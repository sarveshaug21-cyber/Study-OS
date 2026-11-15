"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  FileStack,
  GraduationCap,
  Layers3,
  ScrollText,
} from "lucide-react";
import {
  BOARD_INTELLIGENCE,
  boardSessions,
  type BoardIntelligence,
} from "@/lib/exam-boards";
import { EXAM_BOARDS, type ExamBoard, type QualificationLevel } from "@/lib/qualifications";
import { Badge, SectionHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

const BOARD_ORDER = EXAM_BOARDS;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-b border-slate-100 py-2.5 last:border-b-0 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </dt>
      <dd className="text-sm leading-6 text-ink-soft">{value}</dd>
    </div>
  );
}

function BoardPanel({
  intelligence,
  level,
}: {
  intelligence: BoardIntelligence;
  level: QualificationLevel;
}) {
  const assessment = intelligence.assessment[level];
  const tiering = intelligence.tiering[level];
  const sessions = boardSessions(intelligence.board);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="card p-5" aria-label={`${intelligence.board} overview`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <GraduationCap aria-hidden="true" size={19} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">
              {intelligence.organisation}
            </h2>
            <p className="text-xs text-ink-muted">{intelligence.board}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-ink-soft">
          {intelligence.summary}
        </p>

        <dl className="mt-4">
          <DetailRow label="Specification codes" value={intelligence.codeFormat} />
          <DetailRow label="Assessment style" value={intelligence.assessmentStyle} />
          <DetailRow label="Past papers" value="Published by the board for each series." />
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="btn-secondary"
            href={intelligence.specificationUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ScrollText aria-hidden="true" size={15} />
            Specifications
            <ExternalLink aria-hidden="true" size={13} />
          </a>
          <a
            className="btn-secondary"
            href={intelligence.pastPapersUrl}
            target="_blank"
            rel="noreferrer"
          >
            <FileStack aria-hidden="true" size={15} />
            Past papers
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        </div>
      </section>

      <section className="card p-5" aria-label={`${intelligence.board} assessment structure`}>
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {level} assessment structure
        </h3>
        <dl className="mt-2">
          <DetailRow label="Components" value={assessment.components} />
          <DetailRow label="Assessed by" value={assessment.assessedBy} />
          <DetailRow label="Coursework" value={assessment.coursework} />
          <DetailRow label="Resits" value={assessment.resits} />
        </dl>

        <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
          <Layers3 aria-hidden="true" size={14} />
          Tiering
        </h3>
        {tiering.supported ? (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1.5">
              {tiering.tiers.map((tier) => (
                <Badge key={tier} className="border-brand-100 bg-brand-50 text-brand-700">
                  {tier}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{tiering.note}</p>
            <p className="mt-1 text-xs text-ink-muted">
              Applies to: {tiering.subjects.join(", ")}.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-6 text-ink-soft">{tiering.note}</p>
        )}

        <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
          <CalendarDays aria-hidden="true" size={14} />
          Exam windows
        </h3>
        <ul className="mt-2 space-y-1.5">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-ink-soft">{session.label}</span>
              <span className="text-xs text-ink-muted">{session.month}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function BoardExplorer() {
  const [board, setBoard] = useState<ExamBoard>("AQA");
  const [level, setLevel] = useState<QualificationLevel>("GCSE");

  const intelligence = BOARD_INTELLIGENCE[board];
  const levels = useMemo(
    () => intelligence.qualifications,
    [intelligence.qualifications],
  );

  const selectBoard = (next: ExamBoard) => {
    setBoard(next);
    const nextLevels = BOARD_INTELLIGENCE[next].qualifications;
    if (!nextLevels.includes(level)) setLevel(nextLevels[0]);
  };

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <SectionHeader
          title="Compare examination boards"
          description="Choose a board to see how it awards qualifications, names its specification codes and structures its assessments."
        />

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Exam boards"
        >
          {BOARD_ORDER.map((candidate) => {
            const active = candidate === board;
            return (
              <button
                key={candidate}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectBoard(candidate)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
                  active
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-ink-soft hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                {candidate}
              </button>
            );
          })}
        </div>

        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label="Qualification"
        >
          {levels.map((candidate) => {
            const active = candidate === level;
            return (
              <button
                key={candidate}
                type="button"
                aria-pressed={active}
                onClick={() => setLevel(candidate)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-slate-200 bg-slate-50 text-ink-soft hover:bg-slate-100",
                )}
              >
                {candidate}
              </button>
            );
          })}
        </div>
      </div>

      <BoardPanel intelligence={intelligence} level={level} />
    </div>
  );
}
