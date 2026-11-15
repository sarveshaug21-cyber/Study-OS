"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookMarked,
  CalendarClock,
  ChevronDown,
  FileCheck2,
  ListChecks,
  ShieldQuestion,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge, ProgressBar } from "@/components/ui";
import { COMMAND_WORDS } from "@/lib/specifications";
import { cn } from "@/lib/utils";

type VersionEntry = {
  version: string;
  title: string;
  officialUrl: string | null;
  firstTeaching: string | null;
  firstAssessment: string | null;
  changeSummary: string | null;
  status: "current" | "superseded" | "draft";
  firstAssessmentYear: number | null;
};

type LearningObjectiveEntry = {
  id: string;
  code: string;
  statement: string;
  commandWord: string | null;
  assessmentObjective: string | null;
  topicId: string | null;
  isVerified: boolean;
};

type AssessmentObjectiveEntry = {
  code: string;
  name: string;
  description: string;
};

type Coverage = {
  total: number;
  covered: number;
  percentage: number;
  byChapter: { chapter: string; total: number; covered: number }[];
};

type Specification = {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string | null;
  board: string | null;
  level: string | null;
  officialUrl: string | null;
  verified: boolean;
  version: string | null;
  versions: VersionEntry[];
  learningObjectives: LearningObjectiveEntry[];
  coverage: Coverage;
  assessmentObjectives: AssessmentObjectiveEntry[];
};

type SubjectMapping = {
  subjectId: string;
  subjectName: string;
  code: string;
  board: string;
  level: string;
  examDate: string | null;
  specificationId: string | null;
  specificationTitle: string | null;
  specificationVersion: string | null;
  coverage: Coverage;
  learningObjectiveCount: number;
  verified: boolean;
};

type Payload = {
  specifications: Specification[];
  subjectMappings: SubjectMapping[];
};

function dateLabel(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function SpecificationMapping() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showCommandWords, setShowCommandWords] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<Payload>("/api/specifications");
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load specifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const specsById = useMemo(() => {
    const map = new Map<string, Specification>();
    for (const spec of data?.specifications ?? []) map.set(spec.id, spec);
    return map;
  }, [data]);

  if (loading) {
    return (
      <section className="card p-5" aria-busy="true">
        <p className="text-sm text-ink-muted">Mapping your subjects to specifications…</p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="card p-5">
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error} — specification data needs a connected database.
        </p>
      </section>
    );
  }

  const mappings = data?.subjectMappings ?? [];

  return (
    <div className="space-y-4">
      <section className="card p-5" aria-labelledby="subject-mapping-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="subject-mapping-title" className="text-base font-semibold tracking-tight">
              Your specification mapping
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Each subject is matched to its specification by board, level and
              specification code.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCommandWords((v) => !v)}
            aria-expanded={showCommandWords}
            className="btn-secondary"
          >
            <ShieldQuestion aria-hidden="true" size={15} />
            Command words
          </button>
        </div>

        {mappings.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-ink-muted">
            Add a subject with its specification code to see the mapping.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mappings.map((mapping) => {
              const isOpen = expanded[mapping.subjectId];
              const spec = mapping.specificationId
                ? specsById.get(mapping.specificationId)
                : undefined;
              return (
                <li
                  key={mapping.subjectId}
                  className="rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink">
                          {mapping.subjectName}
                        </h3>
                        <Badge className="border-slate-200 bg-slate-50 text-ink-soft">
                          {mapping.code}
                        </Badge>
                        <Badge className="border-slate-200 bg-slate-50 text-ink-soft">
                          {mapping.board} · {mapping.level}
                        </Badge>
                        {spec?.verified ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            <BadgeCheck aria-hidden="true" size={11} />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        {mapping.specificationTitle
                          ? `${mapping.specificationTitle}${
                              mapping.specificationVersion
                                ? ` · version ${mapping.specificationVersion}`
                                : ""
                            }`
                          : "No matching specification record yet — add the specification code to your subject."}
                      </p>
                      {mapping.examDate && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                          <CalendarClock aria-hidden="true" size={12} />
                          Exam {dateLabel(mapping.examDate)}
                        </p>
                      )}
                    </div>

                    <div className="w-full max-w-[14rem]">
                      <div className="flex items-baseline justify-between text-xs text-ink-muted">
                        <span>Topic coverage</span>
                        <span className="font-semibold text-ink">
                          {mapping.coverage.covered}/{mapping.coverage.total}
                        </span>
                      </div>
                      <ProgressBar
                        className="mt-1"
                        value={mapping.coverage.percentage}
                        label={`${mapping.subjectName} topic coverage`}
                      />
                    </div>
                  </div>

                  {spec && (
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [mapping.subjectId]: !prev[mapping.subjectId],
                          }))
                        }
                        aria-expanded={Boolean(isOpen)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        <ChevronDown
                          aria-hidden="true"
                          size={14}
                          className={cn(
                            "transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                        {isOpen ? "Hide" : "Show"} specification detail
                      </button>

                      {isOpen && (
                        <div className="mt-3 space-y-4">
                          {spec.versions.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                <ListChecks aria-hidden="true" size={13} />
                                Version history
                              </h4>
                              <ul className="mt-2 space-y-1.5">
                                {spec.versions.map((version) => (
                                  <li
                                    key={version.version}
                                    className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                                  >
                                    <span className="font-semibold text-ink">
                                      {version.version}
                                    </span>
                                    <Badge
                                      className={
                                        version.status === "current"
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : version.status === "superseded"
                                            ? "border-slate-200 bg-white text-ink-muted"
                                            : "border-amber-200 bg-amber-50 text-amber-700"
                                      }
                                    >
                                      {version.status}
                                    </Badge>
                                    <span className="text-xs text-ink-muted">
                                      first assessed {dateLabel(version.firstAssessment)}
                                    </span>
                                    {version.officialUrl && (
                                      <a
                                        href={version.officialUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-semibold text-brand-700"
                                      >
                                        Official document ↗
                                      </a>
                                    )}
                                    {version.changeSummary && (
                                      <span className="w-full text-xs leading-5 text-ink-soft">
                                        {version.changeSummary}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {spec.assessmentObjectives.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                <FileCheck2 aria-hidden="true" size={13} />
                                Assessment objectives
                              </h4>
                              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                                {spec.assessmentObjectives.map((ao) => (
                                  <li
                                    key={ao.code}
                                    className="rounded-lg border border-slate-200 px-3 py-2"
                                  >
                                    <p className="text-xs font-semibold text-ink">
                                      {ao.code} — {ao.name}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                                      {ao.description}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {spec.coverage.byChapter.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                Coverage by unit
                              </h4>
                              <ul className="mt-2 space-y-1.5">
                                {spec.coverage.byChapter.map((chapter) => (
                                  <li
                                    key={chapter.chapter}
                                    className="flex items-center gap-3 text-sm"
                                  >
                                    <span className="w-40 shrink-0 truncate text-ink-soft">
                                      {chapter.chapter}
                                    </span>
                                    <ProgressBar
                                      className="flex-1"
                                      value={
                                        chapter.total
                                          ? (chapter.covered / chapter.total) * 100
                                          : 0
                                      }
                                      label={`${chapter.chapter} coverage`}
                                    />
                                    <span className="w-14 shrink-0 text-right text-xs text-ink-muted">
                                      {chapter.covered}/{chapter.total}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {spec.learningObjectives.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                <BookMarked aria-hidden="true" size={13} />
                                Learning objectives
                              </h4>
                              <ul className="mt-2 space-y-1.5">
                                {spec.learningObjectives.map((objective) => (
                                  <li key={objective.id} className="text-sm leading-6">
                                    <span className="font-semibold text-ink">
                                      {objective.code}
                                    </span>{" "}
                                    <span className="text-ink-soft">
                                      {objective.statement}
                                    </span>
                                    {objective.assessmentObjective && (
                                      <Badge className="ml-2 border-slate-200 bg-slate-50 text-ink-muted">
                                        {objective.assessmentObjective}
                                      </Badge>
                                    )}
                                    {!objective.isVerified && (
                                      <span className="ml-2 text-[0.68rem] text-amber-700">
                                        unverified
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {showCommandWords && (
        <section className="card p-5" aria-labelledby="command-words-title">
          <h2 id="command-words-title" className="text-base font-semibold tracking-tight">
            Command words
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Every UK awarding board issues these words with the same intent. What
            the mark scheme rewards changes with the depth of the command.
          </p>
          <ul className="mt-4 space-y-2">
            {COMMAND_WORDS.map((command) => (
              <li
                key={command.word}
                className="rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {command.word}
                  </span>
                  <Badge
                    className={
                      command.depth === 1
                        ? "border-slate-200 bg-slate-50 text-ink-muted"
                        : command.depth === 2
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : "border-brand-200 bg-brand-50 text-brand-700"
                    }
                  >
                    {command.depth === 1
                      ? "Recall"
                      : command.depth === 2
                        ? "Applied"
                        : "Extended"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {command.intent}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                  Full marks: {command.looksLike}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
