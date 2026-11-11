"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui";

export type PastPaper = {
  id: string;
  subjectId: string;
  subject: string;
  board: string;
  level: string;
  year: number;
  session: string;
  paperCode: string;
  title: string;
  durationMinutes: number;
  marks: number;
  hasMarkScheme: boolean;
};

type Completion = { pastPaperId: string; score: number | null };

export function PastPapersBrowser({
  papers = [],
  completions = [],
}: { papers: PastPaper[]; completions: Completion[] }) {
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [notice, setNotice] = useState<string | null>(null);

  const boards = [...new Set(papers.map((p) => p.board))].sort();
  const levels = [...new Set(papers.map((p) => p.level))].sort();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return papers.filter((paper) => {
      const matchesQuery =
        !normalized ||
        paper.subject.toLowerCase().includes(normalized) ||
        paper.title.toLowerCase().includes(normalized) ||
        paper.paperCode.toLowerCase().includes(normalized);
      const matchesBoard = board === "all" || paper.board === board;
      const matchesLevel = level === "all" || paper.level === level;

      return matchesQuery && matchesBoard && matchesLevel;
    });
  }, [query, board, level, papers]);

  const hasFilters = query !== "" || board !== "all" || level !== "all";

  const requestDownload = (label: string) => {
    setNotice(
      `${label} is not downloadable in this demo workspace. Connect Supabase Storage in the full app to host paper files.`,
    );
  };

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="paper-search" className="label">
              Search papers
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="paper-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by subject, paper code or title"
                className="input pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[24rem]">
            <div>
              <label htmlFor="paper-board" className="label">
                Exam board
              </label>
              <select
                id="paper-board"
                value={board}
                onChange={(event) => setBoard(event.target.value)}
                className="input"
              >
                <option value="all">All boards</option>
                {boards.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="paper-level" className="label">
                Qualification
              </label>
              <select
                id="paper-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="input"
              >
                <option value="all">All levels</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <SlidersHorizontal aria-hidden="true" size={13} />
            Showing {filtered.length} of {papers.length} papers
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setBoard("all");
                setLevel("all");
              }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink-muted transition hover:bg-slate-100 hover:text-ink"
            >
              <X aria-hidden="true" size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900"
        >
          <FileText aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded-lg p-1 text-brand-700 transition hover:bg-brand-100"
            aria-label="Dismiss download notice"
          >
            <X aria-hidden="true" size={15} />
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
          <h2 className="text-base font-semibold">No papers found</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Adjust the board, qualification or search term.
          </p>
        </div>
      ) : (
        <>
          <div className="card hidden overflow-hidden md:block">
            <table className="min-w-full divide-y divide-slate-100">
              <caption className="sr-only">
                Past papers with exam board, qualification, session,
                duration, marks and mark scheme availability
              </caption>
              <thead className="bg-slate-50/80">
                <tr>
                  {["Paper", "Board", "Qualification", "Session", "Duration", "Marks", "Downloads"].map(
                    (heading, index) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-muted ${
                          index === 6 ? "text-right" : "text-left"
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((paper) => {
                  const completion = completions.find((c) => c.pastPaperId === paper.id);
                  return (
                    <tr key={paper.id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-ink">
                          {paper.title}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {paper.subject} · {paper.paperCode}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-ink-soft">
                        {paper.board}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-ink-soft">
                        {paper.level}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-ink-soft">
                        {paper.session} {paper.year}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-ink-soft">
                        {Math.floor(paper.durationMinutes / 60)}h{" "}
                        {paper.durationMinutes % 60 > 0
                          ? `${paper.durationMinutes % 60}m`
                          : ""}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-ink-soft">
                        {paper.marks}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              requestDownload(`${paper.paperCode} question paper`)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-slate-50"
                          aria-label={`Download ${paper.paperCode} question paper (demo)`}
                        >
                          <Download aria-hidden="true" size={12} />
                          Paper
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestDownload(`${paper.paperCode} mark scheme`)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          aria-label={`Download ${paper.paperCode} mark scheme (demo)`}
                        >
                          <CheckCircle2 aria-hidden="true" size={12} />
                          Mark scheme
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filtered.map((paper) => (
              <article key={paper.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{paper.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {paper.subject} · {paper.paperCode}
                    </p>
                  </div>
                  <Badge className="shrink-0 border-slate-200 bg-slate-50 text-ink-soft">
                    {paper.session} {paper.year}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip">{paper.board}</span>
                  <span className="chip">{paper.level}</span>
                  <span className="chip">
                    {Math.floor(paper.durationMinutes / 60)}h{" "}
                    {paper.durationMinutes % 60 > 0
                      ? `${paper.durationMinutes % 60}m`
                      : ""}
                  </span>
                  <span className="chip">{paper.marks} marks</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      requestDownload(`${paper.paperCode} question paper`)
                  }
                  className="btn-secondary flex-1 px-3 py-2 text-xs">
                    <Download aria-hidden="true" size={13} />
                    Paper
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      requestDownload(`${paper.paperCode} mark scheme`)
                  }
                    className="btn flex-1 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-100"
                  >
                    <CheckCircle2 aria-hidden="true" size={13} />
                    Mark scheme
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
