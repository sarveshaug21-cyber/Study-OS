"use client";
import { suggestOrder } from "@/lib/scheduler";
export function ScheduleSuggest({ tasks }: { tasks: { id: string; title: string; durationMinutes: number; priority: "low" | "medium" | "high"; dueAt: string; completed: boolean }[] }) {
  const ordered = suggestOrder(tasks.map((t) => ({ ...t, dueAt: new Date(t.dueAt) })));
  return (<section className="card p-5"><h2 className="font-semibold">Suggested order</h2><p className="mt-1 text-sm text-ink-muted">High-priority, soon-due tasks first (studyflow-style scheduling).</p><ol className="mt-3 space-y-2">{ordered.map((t, i) => <li key={t.id} className="text-sm"><span className="font-semibold">#{i + 1}</span> {t.title} <span className="text-ink-muted">· {t.durationMinutes} min · {t.priority}</span></li>)}</ol></section>);
}
