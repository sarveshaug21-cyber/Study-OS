"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export function PlannerStats() {
  const [tasks, setTasks] = useState<{ status: string; estimatedMinutes: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api<{ tasks: { status: string; estimatedMinutes: number }[] }>("/api/planner").then((d) => setTasks(d.tasks ?? [])).catch((e) => setError(e instanceof Error ? e.message : "Failed")); }, []);
  const completed = tasks.filter((t) => t.status === "done").length;
  const total = tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0);
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  if (error) return <p className="text-sm text-ink-muted">{error} (demo mode)</p>;
  return (
    <>
      <span>{Math.floor(total / 60)}h {total % 60}m</span>
      <span>{completed}/{tasks.length}</span>
      <span>{pct}%</span>
    </>
  );
}
