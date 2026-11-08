"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Check,
  Clock3,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import {
  plannerTasks,
  subjects,
  type PlannerTask,
  type Priority,
} from "@/lib/demo-data";
import { Badge, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils";

const days = [
  { short: "Mon", date: "2 Nov" },
  { short: "Tue", date: "3 Nov" },
  { short: "Wed", date: "4 Nov" },
  { short: "Thu", date: "5 Nov" },
  { short: "Fri", date: "6 Nov" },
  { short: "Sat", date: "7 Nov" },
  { short: "Sun", date: "8 Nov" },
];

const priorityStyles: Record<Priority, string> = {
  low: "border-slate-200 bg-slate-50 text-ink-muted",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-700",
};

type Filter = "all" | "open";

export function PlannerBoard() {
  const [tasks, setTasks] = useState<PlannerTask[]>(plannerTasks);
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    subjectId: subjects[0]?.id ?? "",
    day: "Mon",
    duration: "30",
    priority: "medium" as Priority,
  });

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalMinutes = tasks.reduce((total, task) => total + task.duration, 0);
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const visibleTasks = useMemo(
    () => (filter === "open" ? tasks.filter((task) => !task.completed) : tasks),
    [tasks, filter],
  );

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = subjects.find((item) => item.id === draft.subjectId);
    if (!subject || !draft.title.trim()) return;

    const day = days.find((item) => item.short === draft.day) ?? days[0];
    const task: PlannerTask = {
      id: `task-added-${Date.now()}`,
      day: day.short,
      date: day.date,
      time: "TBC",
      title: draft.title.trim(),
      subject: subject.name,
      board: subject.board,
      level: subject.level,
      accent: subject.accent,
      duration: Number(draft.duration),
      priority: draft.priority,
      completed: false,
      type: "notes",
    };

    setTasks((current) => [...current, task]);
    setDraft((current) => ({ ...current, title: "" }));
    setFormOpen(false);
  };

  return (
    <section className="card overflow-hidden" aria-labelledby="planner-board-title">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
              This week · 2–8 November
            </p>
            <h2 id="planner-board-title" className="mt-1 text-base font-semibold tracking-tight">
              Study blocks
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {completedCount} of {tasks.length} complete ·{" "}
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m planned
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5"
              role="group"
              aria-label="Filter study blocks"
            >
              {(["all", "open"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={cn(
                    "rounded-[0.6rem] px-3 py-1.5 text-xs font-semibold capitalize transition",
                    filter === value
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {value === "all" ? "All blocks" : "To do"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFormOpen((current) => !current)}
              aria-expanded={formOpen}
              aria-controls="add-block-form"
              className="btn-primary px-3 py-2 text-xs"
            >
              {formOpen ? (
                <X aria-hidden="true" size={14} />
              ) : (
                <Plus aria-hidden="true" size={14} />
              )}
              {formOpen ? "Cancel" : "Add block"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={progress} label="Weekly plan completion" />
          <span className="shrink-0 text-xs font-semibold text-ink-muted">
            {progress}%
          </span>
        </div>

        {formOpen && (
          <form
            id="add-block-form"
            onSubmit={addTask}
            className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="block-title" className="label">
                Study block
              </label>
              <input
                id="block-title"
                type="text"
                required
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g. Biology retrieval practice"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="block-subject" className="label">
                Subject
              </label>
              <select
                id="block-subject"
                value={draft.subjectId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    subjectId: event.target.value,
                  }))
                }
                className="input"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="block-day" className="label">
                  Day
                </label>
                <select
                  id="block-day"
                  value={draft.day}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, day: event.target.value }))
                  }
                  className="input"
                >
                  {days.map((day) => (
                    <option key={day.short} value={day.short}>
                      {day.short}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="block-duration" className="label">
                  Minutes
                </label>
                <select
                  id="block-duration"
                  value={draft.duration}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      duration: event.target.value,
                    }))
                  }
                  className="input"
                >
                  {[20, 30, 45, 60, 90, 120].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full">
                <Plus aria-hidden="true" size={14} />
                Add block
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {days.map((day) => {
          const dayTasks = visibleTasks.filter((task) => task.day === day.short);
          const isToday = day.short === "Sun";
          const dayComplete = tasks
            .filter((task) => task.day === day.short)
            .every((task) => task.completed);

          return (
            <div
              key={day.short}
              className={cn(
                "flex flex-col rounded-xl border p-2.5",
                isToday
                  ? "border-brand-200 bg-brand-50/50"
                  : "border-slate-200 bg-slate-50/40",
              )}
            >
              <div className="flex items-center justify-between px-1 py-1">
                <div>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isToday ? "text-brand-700" : "text-ink-soft",
                    )}
                  >
                    {day.short}
                  </p>
                  <p className="text-[0.65rem] text-ink-muted">{day.date}</p>
                </div>
                {isToday && (
                  <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                    Today
                  </span>
                )}
                {!isToday && dayComplete && dayTasks.length > 0 && (
                  <Check
                    aria-label="All blocks complete"
                    size={13}
                    className="text-emerald-600"
                  />
                )}
              </div>

              <div className="mt-1.5 space-y-1.5">
                {dayTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-2 py-4 text-center text-[0.65rem] text-ink-muted">
                    No blocks
                  </p>
                ) : (
                  dayTasks.map((task) => (
                    <label
                      key={task.id}
                      className={cn(
                        "block cursor-pointer rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition hover:border-slate-300",
                        task.completed && "opacity-60",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="peer sr-only"
                      />
                      <span className="flex items-start gap-1.5">
                        <span
                          className={cn(
                            "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1",
                            task.completed
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-slate-300 bg-white text-transparent",
                          )}
                          aria-hidden="true"
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 text-[0.62rem] text-ink-muted">
                            <Clock3 aria-hidden="true" size={9} />
                            {task.time} · {task.duration}m
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block text-[0.7rem] font-semibold leading-4 text-ink",
                              task.completed && "line-through",
                            )}
                          >
                            {task.title}
                          </span>
                          <span className="mt-1 flex items-center gap-1 truncate text-[0.62rem] text-ink-muted">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: task.accent }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{task.subject}</span>
                          </span>
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3.5">
        <Badge className={priorityStyles.high}>High priority</Badge>
        <Badge className={priorityStyles.medium}>Medium</Badge>
        <Badge className={priorityStyles.low}>Low</Badge>
        <span className="ml-auto inline-flex items-center gap-1 text-[0.68rem] text-ink-muted">
          <Sparkles aria-hidden="true" size={11} />
          Changes are local to this demo
        </span>
      </div>
    </section>
  );
}
