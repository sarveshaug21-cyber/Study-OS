"use client";

import { useId, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleCheck,
  CircleDashed,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  practiceQuestions,
  subjects,
  type Difficulty,
  type PracticeQuestion,
} from "@/lib/demo-data";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const difficultyStyles: Record<Difficulty, string> = {
  easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  hard: "border-rose-200 bg-rose-50 text-rose-700",
};

function PracticeCard({ question }: { question: PracticeQuestion }) {
  const [revealed, setRevealed] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const answerId = useId();

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          style={{
            borderColor: `${question.accent}30`,
            backgroundColor: `${question.accent}10`,
            color: question.accent,
          }}
        >
          {question.subject}
        </Badge>
        <Badge className="border-slate-200 bg-slate-50 text-ink-soft">
          {question.board} · {question.level}
        </Badge>
        <Badge className={difficultyStyles[question.difficulty]}>
          {question.difficulty}
        </Badge>
        <span className="ml-auto text-xs font-semibold text-ink-muted">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {question.topic}
      </p>
      <h3 className="mt-1.5 text-balance text-base font-semibold leading-6 text-ink">
        {question.question}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          aria-expanded={revealed}
          aria-controls={answerId}
          className="btn-secondary"
        >
          <ChevronDown
            aria-hidden="true"
            size={15}
            className={cn("transition", revealed && "rotate-180")}
          />
          {revealed ? "Hide model answer" : "Show model answer"}
        </button>
        <button
          type="button"
          onClick={() => setAttempted((current) => !current)}
          aria-pressed={attempted}
          className={cn(
            "btn",
            attempted
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "text-ink-muted hover:bg-slate-100",
          )}
        >
          {attempted ? (
            <CircleCheck aria-hidden="true" size={15} />
          ) : (
            <CircleDashed aria-hidden="true" size={15} />
          )}
          {attempted ? "Attempted" : "Mark attempted"}
        </button>
      </div>

      {revealed && (
        <div id={answerId} className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Model answer
            </h4>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {question.modelAnswer}
            </p>
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
              Mark scheme
            </h4>
            <ul className="mt-2 space-y-1.5">
              {question.markScheme.map((point) => (
                <li
                  key={point}
                  className="flex gap-2 text-sm leading-5 text-ink-soft"
                >
                  <Check
                    aria-hidden="true"
                    size={14}
                    className="mt-0.5 shrink-0 text-brand-600"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}

export function PracticeBrowser() {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return practiceQuestions.filter((question) => {
      const matchesQuery =
        !normalized ||
        question.question.toLowerCase().includes(normalized) ||
        question.topic.toLowerCase().includes(normalized) ||
        question.subject.toLowerCase().includes(normalized);
      const matchesSubject =
        subjectFilter === "all" || question.subjectId === subjectFilter;
      const matchesDifficulty =
        difficulty === "all" || question.difficulty === difficulty;

      return matchesQuery && matchesSubject && matchesDifficulty;
    });
  }, [query, subjectFilter, difficulty]);

  const hasFilters = query !== "" || subjectFilter !== "all" || difficulty !== "all";

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="practice-search" className="label">
              Search question bank
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="practice-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by topic, subject or keyword"
                className="input pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[24rem]">
            <div>
              <label htmlFor="practice-subject" className="label">
                Subject
              </label>
              <select
                id="practice-subject"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className="input"
              >
                <option value="all">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="practice-difficulty" className="label">
                Difficulty
              </label>
              <select
                id="practice-difficulty"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as Difficulty | "all")
                }
                className="input"
              >
                <option value="all">All levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <SlidersHorizontal aria-hidden="true" size={13} />
            Showing {filtered.length} of {practiceQuestions.length} questions
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubjectFilter("all");
                setDifficulty("all");
              }}
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
          <h2 className="text-base font-semibold">No questions match</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Try a different subject, difficulty or search term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((question) => (
            <PracticeCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
