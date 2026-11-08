"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export function RealAnalytics() {
  const [data, setData] = useState<{ sessions: { minutes: number }[]; attempts: { score: number | null; marksAvailable: number }[]; records: unknown[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api<{ sessions: { minutes: number }[]; attempts: { score: number | null; marksAvailable: number }[]; records: unknown[] }>("/api/progress").then(setData).catch((e) => setError(e instanceof Error ? e.message : "Failed")); }, []);
  if (error) return <p className="text-sm text-ink-muted">Real analytics unavailable ({error}). Showing demo figures below.</p>;
  if (!data) return <p className="text-sm text-ink-muted">Loading your persisted analytics…</p>;
  const totalMinutes = data.sessions.reduce((a, s) => a + s.minutes, 0);
  const scored = data.attempts.filter((a) => typeof a.score === "number");
  const accuracy = scored.length ? Math.round(scored.reduce((a, x) => a + (x.score ?? 0) / x.marksAvailable, 0) / scored.length * 100) : 0;
  return <div className="grid gap-3 sm:grid-cols-3"><div className="card p-4"><p className="text-xs text-ink-muted">Persisted study time</p><p className="text-xl font-semibold">{totalMinutes} min</p></div><div className="card p-4"><p className="text-xs text-ink-muted">Practice accuracy</p><p className="text-xl font-semibold">{accuracy}%</p></div><div className="card p-4"><p className="text-xs text-ink-muted">Progress records</p><p className="text-xl font-semibold">{data.records.length}</p></div></div>;
}
