"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Layers,
  NotebookPen,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import {
  EXAM_BOARDS,
  QUALIFICATION_LEVELS,
  subjects,
  type ExamBoard,
  type QualificationLevel,
} from "@/lib/demo-data";
import { Badge, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils";

type BoardFilter = ExamBoard | "all";
type LevelFilter = QualificationLevel | "all";

export function SubjectsBrowser() {
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<BoardFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesQuery =
        !normalized ||
        subject.name.toLowerCase().includes(normalized) ||
        subject.code.toLowerCase().includes(normalized) ||
        subject.nextTopic.toLowerCase().includes(normalized);
      const matchesBoard = board === "all" || subject.board === board;
      const matchesLevel = level === "all" || subject.level === level;

      return matchesQuery && matchesBoard && matchesLevel;
    });
  }, [query, board, level]);

  const hasFilters = query !== "" || board !== "all" || level !== "all";

  const clearFilters = () => {
    setQuery("");
    setBoard("all");
    setLevel("all");
  };

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="subject-search" className="label">
              Search subjects
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="subject-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, code or current topic"
                className="input pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:w-[26rem]">
            <div>
              <label htmlFor="subject-board" className="label">
                Exam board
              </label>
              <select
                id="subject-board"
                value={board}
                onChange={(event) => setBoard(event.target.value as BoardFilter)}
                className="input"
              >
                <option value="all">All boards</option>
                {EXAM_BOARDS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subject-level" className="label">
                Qualification
              </label>
              <select
                id="subject-level"
                value={level}
                onChange={(event) => setLevel(event.target.value as LevelFilter)}
                className="input"
              >
                <option value="all">All levels</option>
                {QUALIFICATION_LEVELS.map((item) => (
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
            Showing {filtered.length} of {subjects.length} subjects
          </span>
          {board !== "all" && (
            <Badge className="border-brand-100 bg-brand-50 text-brand-700">
              {board}
            </Badge>
          )}
          {level !== "all" && (
            <Badge className="border-brand-100 bg-brand-50 text-brand-700">
              {level}
            </Badge>
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink-muted transition hover:bg-slate-100 hover:text-ink"
            >
              <X aria-hidden="true" size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-ink-muted">
            <BookOpen aria-hidden="true" size={22} />
          </span>
          <h2 className="mt-4 text-base font-semibold">No matching subjects</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Try a different board or qualification, or clear your filters to see
            the full demo curriculum.
          </p>
          <button type="button" onClick={clearFilters} className="btn-secondary mt-5">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject) => (
            <article
              key={subject.id}
              className="card-interactive relative flex flex-col overflow-hidden p-5"
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: subject.accent }}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-sm font-bold"
                    style={{
                      backgroundColor: `${subject.accent}14`,
                      color: subject.accent,
                    }}
                    aria-hidden="true"
                  >
                    {subject.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">
                      {subject.name}
                    </h2>
                    <p className="text-xs text-ink-muted">Spec {subject.code}</p>
                  </div>
                </div>
                <Badge className="border-slate-200 bg-slate-50 text-ink-soft">
                  {subject.level}
                </Badge>
              </div>

              <p className="mt-3 text-xs font-medium text-ink-muted">
                {subject.board}
              </p>

              <div className="mt-4">
                <div className="flex items-end justify-between">
                  <p className="text-sm font-medium text-ink-soft">Mastery</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {subject.progress}%
                  </p>
                </div>
                <ProgressBar
                  value={subject.progress}
                  accent={subject.accent}
                  label={`${subject.name} mastery`}
                  className="mt-2"
                />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <BookOpen aria-hidden="true" size={13} />
                  <dt className="sr-only">Topics complete</dt>
                  <dd>
                    {subject.topicsComplete}/{subject.topicsTotal} topics
                  </dd>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <NotebookPen aria-hidden="true" size={13} />
                  <dt className="sr-only">Notes</dt>
                  <dd>{subject.notesCount} notes</dd>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Layers aria-hidden="true" size={13} />
                  <dt className="sr-only">Cards due</dt>
                  <dd>{subject.cardsDue} cards due</dd>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <UserRound aria-hidden="true" size={13} />
                  <dt className="sr-only">Teacher</dt>
                  <dd className="truncate">{subject.teacher}</dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-muted">
                  Next up
                </p>
                <p className="mt-1 text-sm font-medium leading-5">
                  {subject.nextTopic}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{subject.nextSession}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <CalendarDays aria-hidden="true" size={13} />
                  {subject.examDate}
                </span>
                <div className="flex gap-1">
                  <Link
                    href="/notes"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                    aria-label={`Open ${subject.name} notes`}
                  >
                    Notes
                    <ArrowUpRight aria-hidden="true" size={12} />
                  </Link>
                  <Link
                    href="/flashcards"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                    aria-label={`Review ${subject.name} flashcards`}
                  >
                    Cards
                    <ArrowUpRight aria-hidden="true" size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="card p-5" aria-labelledby="coverage-title">
        <h2 id="coverage-title" className="text-base font-semibold tracking-tight">
          Curriculum coverage
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          The demo workspace is structured for every supported board and
          qualification.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAM_BOARDS.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
          {QUALIFICATION_LEVELS.map((item) => (
            <span
              key={item}
              className={cn(
                "chip border-brand-100 bg-brand-50/70 text-brand-800",
              )}
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
