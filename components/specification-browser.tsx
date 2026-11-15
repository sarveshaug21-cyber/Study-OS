"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, ScrollText, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

type Specification = {
  id: string;
  board: string;
  level: string;
  subjectName: string;
  subjectCode: string | null;
  title: string;
  officialUrl: string | null;
  verified: boolean;
  version: string | null;
  topicCount: number;
  latestVersion: { version: string; publishedAt: string | null } | null;
};

export function SpecificationBrowser() {
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const url = new URL("/api/specifications", window.location.origin);
        if (board !== "all") url.searchParams.set("board", board);
        if (level !== "all") url.searchParams.set("level", level);
        if (query.trim()) url.searchParams.set("subject", query.trim());
        const data = await api<{ specifications: Specification[] }>(url.toString());
        if (!cancelled) setSpecs(data.specifications ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load specifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [board, level, query]);

  const boards = useMemo(() => [...new Set(specs.map((s) => s.board))].sort(), [specs]);
  const levels = useMemo(() => [...new Set(specs.map((s) => s.level))].sort(), [specs]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return specs.filter((s) => {
      const matchesQuery =
        !normalized ||
        s.subjectName.toLowerCase().includes(normalized) ||
        s.title.toLowerCase().includes(normalized) ||
        (s.subjectCode || "").toLowerCase().includes(normalized);
      const matchesBoard = board === "all" || s.board === board;
      const matchesLevel = level === "all" || s.level === level;
      return matchesQuery && matchesBoard && matchesLevel;
    });
  }, [specs, board, level, query]);

  if (loading) {
    return (
      <section className="card p-5" aria-busy="true">
        <p className="text-sm text-ink-muted">Loading specifications…</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card p-5" aria-label="Specification catalogue">
        <h2 className="text-base font-semibold tracking-tight mb-1">Specification catalogue</h2>
        <div className="grid gap-3 sm:grid-cols-4 mb-4">
          <div className="relative">
            <ScrollText aria-hidden="true" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="spec-subject"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Subject or specification title"
              className="input pl-9"
            />
          </div>
          <div>
            <label htmlFor="spec-board" className="label">Board</label>
            <select id="spec-board" value={board} onChange={(e) => setBoard(e.target.value)} className="input">
              <option value="all">All boards</option>
              {boards.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="spec-level" className="label">Qualification</label>
            <select id="spec-level" value={level} onChange={(e) => setLevel(e.target.value)} className="input">
              <option value="all">All levels</option>
              {levels.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-slate-50"
              >
                <span className="sr-only">Clear search</span>
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm divide-y divide-slate-100 rounded-xl border border-slate-200">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Board · level</th>
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Subject</th>
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Code</th>
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Title</th>
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Version</th>
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Topics</th>
                <th className="text-left px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Status</th>
                <th className="text-right px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-ink-muted">
                    {error ? error : "No specifications match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((spec) => (
                  <tr key={spec.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 text-ink-soft">
                      <p className="font-medium">{spec.board}</p>
                      <p className="text-[0.68rem] text-ink-muted">{spec.level}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{spec.subjectName}</td>
                    <td className="px-4 py-3 text-[0.68rem] font-mono text-ink-muted">{spec.subjectCode ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-soft truncate max-w-[22rem]">{spec.title}</td>
                    <td className="px-4 py-3 text-[0.68rem] font-mono text-ink-soft">{spec.latestVersion?.version ?? spec.version ?? "—"}</td>
                    <td className="px-4 py-3 text-[0.68rem] font-semibold text-ink">{spec.topicCount}</td>
                    <td className="px-4 py-3">
                      {spec.verified ? (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          <CheckCircle2 size={12} aria-hidden="true" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                          <ShieldAlert size={12} aria-hidden="true" /> Unverified
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {spec.officialUrl ? (
                        <Link
                          href={spec.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem] font-semibold text-brand-700 transition hover:bg-brand-50"
                          aria-label={`Official specification for ${spec.title}`}
                        >
                          Official source
                          <ExternalLink size={12} aria-hidden="true" />
                        </Link>
                      ) : (
                        <span className="text-[0.68rem] text-ink-muted">No official URL</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          {filtered.length} of {specs.length} specifications shown.{" "}
          {specs.filter((s) => s.topicCount === 0).length} have no topics mapped
          yet — import specification topics from the board source to enable
          topic navigation.
        </p>
      </section>
    </div>
  );
}

