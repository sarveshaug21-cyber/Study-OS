"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Flame,
  Layers,
  Minus,
  Target,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/ui";
import { MasteryChart } from "@/components/mastery-chart";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type ProgressRecord = {
  id: string;
  userId: string;
  subjectId: string;
  mastery: number;
  confidence: number;
  studyMinutes: number;
  recordedAt: string;
};

type StudySession = {
  id: string;
  userId: string;
  subjectId: string | null;
  topicId: string | null;
  minutes: number;
  focus: string | null;
  notes: string | null;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
};

type PracticeAttempt = {
  id: string;
  userId: string;
  questionId: string;
  answer: string | null;
  score: number | null;
  marksAvailable: number;
  completedAt: string;
};

export default function ProgressPage() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // /api/progress returns records, sessions AND attempts in one payload — one call suffices.
        const d = await api<{
          records: ProgressRecord[];
          sessions: StudySession[];
          attempts: PracticeAttempt[];
        }>("/api/progress");
        setRecords(d.records ?? []);
        setSessions(d.sessions ?? []);
        setAttempts(d.attempts ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStudyMinutes = sessions.reduce((a, s) => a + s.minutes, 0);
  const scoredAttempts = attempts.filter((a) => typeof a.score === "number");
  const accuracy = scoredAttempts.length
    ? Math.round(
        scoredAttempts.reduce((a, x) => a + (x.score ?? 0) / x.marksAvailable, 0) /
          scoredAttempts.length *
          100,
      )
    : 0;
  const totalMastery = records.reduce((a, r) => a + r.mastery, 0);
  const averageMastery = records.length
    ? Math.round(totalMastery / records.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Long-term view"
          title="Progress"
          description="Mastery, study time, exam board coverage and grade trajectory based on your actual study data."
        />
        <p className="text-sm text-ink-muted">Loading your progress data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Long-term view"
          title="Progress"
          description="Mastery, study time, exam board coverage and grade trajectory based on your actual study data."
        />
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Long-term view"
        title="Progress"
        description="Mastery, study time, exam board coverage and grade trajectory based on your actual study data."
      />

      <section aria-label="Progress summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average mastery"
          value={`${averageMastery}%`}
          detail="Based on your progress records."
          icon={Target}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Study this week"
          value={`${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`}
          detail="From your logged study sessions."
          icon={Timer}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Progress records"
          value={String(records.length)}
          detail="Based on your tracked progress."
          icon={Layers}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Practice accuracy"
          value={`${accuracy}%`}
          detail={
            scoredAttempts.length > 0
              ? `Based on ${scoredAttempts.length} attempts`
              : "No attempts recorded yet"
          }
          icon={Target}
          accent="bg-emerald-50 text-emerald-700"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="card p-5 sm:p-6" aria-labelledby="trend-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="trend-title" className="text-base font-semibold tracking-tight">
                Mastery trend
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Average mastery across all progress records
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {records.length} records
            </span>
          </div>
          <div className="mt-5">
            <MasteryChart />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-sm">
            <div>
              <p className="text-xs text-ink-muted">Starting point</p>
              <p className="mt-0.5 font-semibold">
                {records.length > 0 ? records[0].mastery : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Current</p>
              <p className="mt-0.5 font-semibold">{averageMastery}%</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Target by June</p>
              <p className="mt-0.5 font-semibold">82%</p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="board-mastery-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="board-mastery-title" className="text-base font-semibold tracking-tight">
                Board mastery
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Average progress by exam board
              </p>
            </div>
            <Award aria-hidden="true" size={18} className="text-brand-500" />
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Board-level mastery requires subject-board linkage in progress records.
            Configure your subjects in Settings to see board breakdowns.
          </p>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="card overflow-hidden" aria-labelledby="grades-title">
          <div className="flex items-end justify-between gap-3 p-5 pb-3">
            <div>
              <h2 id="grades-title" className="text-base font-semibold tracking-tight">
                Grade tracker
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Target, prediction and latest assessment
              </p>
            </div>
            <Link href="/subjects" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Subjects
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <caption className="sr-only">
                Subject grade tracker showing target grade, predicted grade,
                latest assessment percentage and trend
              </caption>
              <thead className="bg-slate-50/80">
                <tr>
                  {["Subject", "Board", "Target", "Predicted", "Latest", "Trend"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-5 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-muted"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row) => (
                  <tr key={row.id} className="transition hover:bg-slate-50/60">
                    <th scope="row" className="whitespace-nowrap px-5 py-3.5 text-left text-sm font-semibold">
                      {row.subjectId}
                    </th>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-soft">
                      {row.subjectId}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                      {row.mastery}%
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                      {row.confidence}%
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-ink-soft">
                      {row.studyMinutes} min
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={
                          row.mastery >= 75
                            ? "inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
                            : row.mastery >= 50
                              ? "inline-flex items-center gap-1 text-xs font-semibold text-ink-soft"
                              : "inline-flex items-center gap-1 text-xs font-semibold text-rose-700"
                        }
                      >
                        {row.mastery >= 75 ? (
                          <ArrowUpRight aria-hidden="true" size={13} />
                        ) : row.mastery >= 50 ? (
                          <Minus aria-hidden="true" size={13} />
                        ) : (
                          <ArrowDownRight aria-hidden="true" size={13} />
                        )}
                        {row.mastery >= 75
                          ? "Strong"
                          : row.mastery >= 50
                            ? "Developing"
                            : "Needs work"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="milestones-title">
          <h2 id="milestones-title" className="text-base font-semibold tracking-tight">
            Recent milestones
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Based on your actual study data.
          </p>
          <ol className="mt-5 space-y-4">
            {records.length > 0 ? (
              <li key="streak" className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                  <Flame aria-hidden="true" size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5">
                    {records.length} progress records
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                    Great consistency!
                  </p>
                </div>
              </li>
            ) : (
              <li className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-200 text-ink-soft">
                  <Flame aria-hidden="true" size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5">No records yet</p>
                  <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                    Start logging your study sessions to see progress.
                  </p>
                </div>
              </li>
            )}
          </ol>
        </section>
      </div>
    </div>
  );
}
