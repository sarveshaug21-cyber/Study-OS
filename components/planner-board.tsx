"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";
import { Badge, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  subjectId?: string | null;
  scheduledFor: string;
  estimatedMinutes: number;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  completed?: boolean;
};

const priorityStyles: Record<string, string> = {
  low: "border-slate-200 bg-slate-50 text-ink-muted",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-700",
};

export function PlannerBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", scheduledFor: "", priority: "medium" as "low" | "medium" | "high", estimatedMinutes: "30" });

  useEffect(() => {
    let cancelled = false;
    api<{ tasks: Task[] }>("/api/planner")
      .then((d) => { if (!cancelled) setTasks(d.tasks ?? []); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const totalMinutes = tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0);
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const visible = useMemo(() => filter === "open" ? tasks.filter((t) => t.status !== "done") : tasks, [tasks, filter]);

  const toggle = async (id: string, done: boolean) => {
    setError(null);
    try {
      const d = await api<{ task: Task }>("/api/planner", { method: "PATCH", body: JSON.stringify({ id, status: done ? "done" : "todo" }) });
      setTasks((prev) => prev.map((t) => (t.id === id ? d.task : t)));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api(`/api/planner?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  };

  const addTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.scheduledFor) return;
    setError(null);
    try {
      const d = await api<{ task: Task }>("/api/planner", { method: "POST", body: JSON.stringify({ title: draft.title.trim(), scheduledFor: new Date(draft.scheduledFor).toISOString(), priority: draft.priority, estimatedMinutes: Number(draft.estimatedMinutes) }) });
      setTasks((prev) => [...prev, d.task]);
      setDraft({ title: "", scheduledFor: "", priority: "medium", estimatedMinutes: "30" });
      setFormOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); }
  };

  if (loading) return <section className="card p-5"><p className="text-sm text-ink-muted">Loading your planner…</p></section>;

  return (
    <section className="card overflow-hidden" aria-labelledby="planner-board-title">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Your plan</p>
            <h2 id="planner-board-title" className="mt-1 text-base font-semibold tracking-tight">Study blocks</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{completedCount} of {tasks.length} complete · {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m planned</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Filter study blocks">
              {(["all", "open"] as const).map((value) => (
                <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={cn("rounded-[0.6rem] px-3 py-1.5 text-xs font-semibold capitalize transition", filter === value ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink")}>{value === "all" ? "All blocks" : "To do"}</button>
              ))}
            </div>
            <button type="button" onClick={() => setFormOpen((c) => !c)} aria-expanded={formOpen} className="btn-primary px-3 py-2 text-xs">{formOpen ? <X aria-hidden="true" size={14} /> : <Plus aria-hidden="true" size={14} />} {formOpen ? "Cancel" : "Add block"}</button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3"><ProgressBar value={progress} label="Weekly plan completion" /><span className="shrink-0 text-xs font-semibold text-ink-muted">{progress}%</span></div>
        {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {formOpen && (
          <form onSubmit={addTask} className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="block-title">Study block</label><input id="block-title" type="text" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Biology retrieval practice" className="input" /></div>
            <div><label className="label" htmlFor="block-date">When</label><input id="block-date" type="datetime-local" required value={draft.scheduledFor} onChange={(e) => setDraft({ ...draft, scheduledFor: e.target.value })} className="input" /></div>
            <div><label className="label" htmlFor="block-priority">Priority</label><select id="block-priority" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as "low" | "medium" | "high" })} className="input">{["low","medium","high"].map((p) => <option key={p}>{p}</option>)}</select></div>
            <div><label className="label" htmlFor="block-min">Minutes</label><select id="block-min" value={draft.estimatedMinutes} onChange={(e) => setDraft({ ...draft, estimatedMinutes: e.target.value })} className="input">{[20,30,45,60,90,120].map((m) => <option key={m}>{m}</option>)}</select></div>
            <div className="flex items-end"><button type="submit" className="btn-primary w-full"><Plus aria-hidden="true" size={14} />Add block</button></div>
          </form>
        )}
      </div>
      {tasks.length === 0 ? (
        <div className="p-6 text-sm text-ink-muted">No sessions yet. Add your first study block above.</div>
      ) : (
        <ul className="divide-y divide-slate-100 p-4 space-y-2">
          {visible.map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <input type="checkbox" checked={task.status === "done"} onChange={() => toggle(task.id, task.status !== "done")} aria-label={`Mark ${task.title} complete`} className="h-4 w-4" />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold", task.status === "done" && "line-through text-ink-muted")}>{task.title}</p>
                <p className="text-xs text-ink-muted">{new Date(task.scheduledFor).toLocaleString()} · {task.estimatedMinutes} min</p>
              </div>
              <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
              <button type="button" onClick={() => remove(task.id)} aria-label={`Delete ${task.title}`} className="text-ink-muted hover:text-rose-600"><X size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3.5">
        <Badge className={priorityStyles.high}>High priority</Badge>
        <Badge className={priorityStyles.medium}>Medium</Badge>
        <Badge className={priorityStyles.low}>Low</Badge>
        <span className="ml-auto inline-flex items-center gap-1 text-[0.68rem] text-ink-muted"><Sparkles aria-hidden="true" size={11} />Persisted via Supabase</span>
      </div>
    </section>
  );
}
