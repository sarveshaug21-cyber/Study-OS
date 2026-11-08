"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
type R = { type: string; id: string; title: string; href: string };
export function SearchBar() {
  const [q, setQ] = useState(""); const [results, setResults] = useState<R[]>([]); const [open, setOpen] = useState(false); const [error, setError] = useState<string | null>(null); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); ref.current?.focus(); } }; document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, []);
  useEffect(() => { const t = setTimeout(async () => { if (q.trim().length < 2) { setResults([]); return; } try { const d = await api<{ results: R[] }>("/api/search?q=" + encodeURIComponent(q)); setResults(d.results); setOpen(true); setError(null); } catch { setError("Search unavailable in demo mode"); } }, 300); return () => clearTimeout(t); }, [q]);
  return (<div className="relative hidden md:block"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} placeholder="Search subjects, notes, papers…" aria-label="Global search" className="h-10 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-16 text-sm shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 xl:w-80" />{open && (q.trim().length >= 2) && <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-white p-2 shadow-lift">{error && <p className="p-2 text-sm text-ink-muted">{error}</p>}{results.length === 0 && !error && <p className="p-2 text-sm text-ink-muted">No results</p>}{results.map((r) => <Link key={r.type + r.id} href={r.href} className="block rounded-lg px-2 py-2 hover:bg-slate-50"><span className="text-[0.65rem] font-semibold uppercase text-brand-600">{r.type}</span><span className="block truncate text-sm">{r.title}</span></Link>)}</div>}</div>);
}
