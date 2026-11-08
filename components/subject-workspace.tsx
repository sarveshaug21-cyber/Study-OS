"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
type Topic = { id: string; name: string; description?: string | null; isOfficial: boolean };
export function SubjectWorkspace({ subjectId }: { subjectId: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [status] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  useEffect(() => { api<{ topics: Topic[] }>("/api/topics?subjectId=" + subjectId).then((d) => setTopics(d.topics)).catch((e) => setError(e instanceof Error ? e.message : "Failed to load")); }, [subjectId]);
  async function toggle(id: string) { setError(null); try { const d = await api<{ completed: boolean }>("/api/topics/" + id + "/progress", { method: "PUT" }); setProgress((p) => ({ ...p, [id]: d.completed })); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } }
  async function addTopic(e: React.FormEvent) { e.preventDefault(); setError(null); try { const d = await api<{ topic: Topic }>("/api/topics", { method: "POST", body: JSON.stringify({ subjectId, name, isOfficial: false }) }); setTopics((t) => [...t, d.topic]); setName(""); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } }
  const done = topics.filter((t) => progress[t.id]).length;
  return (<div className="space-y-5">
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error} — you may be in demo mode (Supabase not configured).</p>}
    {status && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{status}</p>}
    <section className="card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Specification checklist</h2><span className="text-sm text-ink-muted">{done}/{topics.length} complete</span></div>
      <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: topics.length ? `${Math.round((done/topics.length)*100)}%` : "0%" }} /></div>
      {topics.length === 0 ? <p className="mt-4 text-sm text-ink-muted">No topics yet. Official specification topics should be imported from the exam board source; personal topics can be added below. Unverified topics are not presented as official syllabus content.</p> : <ul className="mt-4 space-y-2">{topics.map((t) => <li key={t.id} className="flex items-center gap-3"><input type="checkbox" checked={Boolean(progress[t.id])} onChange={() => toggle(t.id)} aria-label={`Mark ${t.name} complete`} /><span className="flex-1 text-sm">{t.name}{t.description ? ` — ${t.description}` : ""}</span><span className="text-xs text-ink-muted">{t.isOfficial ? "Official" : "Personal (unverified)"}</span></li>)}</ul>}
      <form onSubmit={addTopic} className="mt-4 flex gap-2"><label className="sr-only" htmlFor="topic-name">New topic</label><input id="topic-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add personal topic" /><button className="btn-primary">Add topic</button></form>
    </section>
    <section className="card p-5"><h2 className="font-semibold">In this workspace</h2><div className="mt-3 flex flex-wrap gap-2"><Link className="btn-secondary" href="/notes">Revision notes</Link><Link className="btn-secondary" href="/flashcards">Flashcards</Link><Link className="btn-secondary" href="/practice">Practice</Link><Link className="btn-secondary" href="/past-papers">Past papers</Link><Link className="btn-secondary" href="/ai-tutor">Ask AI tutor</Link></div></section>
  </div>);
}
