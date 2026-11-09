"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export function NotebookResearch() {
  const [notebooks, setNotebooks] = useState<unknown[]>([]);
  const [q, setQ] = useState(""); const [results, setResults] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ notebooks: unknown[] }>("/api/research").then((d) => setNotebooks(d.notebooks)).catch((e) => setError(e instanceof Error ? e.message : "Unavailable")); }, []);
  async function search(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(null); try { const d = await api<{ results: unknown }>("/api/research", { method: "POST", body: JSON.stringify({ query: q }) }); setResults(d.results); } catch (e) { setError(e instanceof Error ? e.message : "Search failed"); } finally { setBusy(false); } }
  return (<div className="space-y-5"><section className="card p-5"><h2 className="font-semibold">Notebooks</h2>{notebooks.length === 0 && <p className="mt-2 text-sm text-ink-muted">No notebooks returned yet.</p>}<pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(notebooks, null, 2).slice(0, 4000)}</pre></section><section className="card p-5"><h2 className="font-semibold">Semantic search</h2><form onSubmit={search} className="mt-3 flex gap-2"><label className="sr-only" htmlFor="rq">Search query</label><input id="rq" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask across your sources…" /><button className="btn-primary" disabled={busy}>{busy ? "Searching…" : "Search"}</button></form>{error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{results !== null && <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(results, null, 2).slice(0, 4000)}</pre>}</section></div>);
}
