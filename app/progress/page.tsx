import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  FileText,
  Flame,
  Layers,
  Minus,
  Target,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProgressBar, StatCard } from "@/components/ui";
import { MasteryChart } from "@/components/mastery-chart";
import {
  EXAM_BOARDS,
  subjects,
  subjectGradeRows,
} from "@/lib/demo-data";
import { RealAnalytics } from "@/components/real-analytics";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "Track mastery, study time, exam board coverage and predicted grades.",
};

const averageMastery = Math.round(
  subjects.reduce((total, subject) => total + subject.progress, 0) /
    subjects.length,
);
const topicsComplete = subjects.reduce(
  (total, subject) => total + subject.topicsComplete,
  0,
);
const topicsTotal = subjects.reduce(
  (total, subject) => total + subject.topicsTotal,
  0,
);

const boardMastery = EXAM_BOARDS.map((board) => {
  const boardSubjects = subjects.filter((subject) => subject.board === board);
  const average = Math.round(
    boardSubjects.reduce((total, subject) => total + subject.progress, 0) /
      boardSubjects.length,
  );

  return {
    board,
    count: boardSubjects.length,
    average,
  };
}).sort((a, b) => b.average - a.average);

const milestones = [
  {
    title: "12-day study streak",
    detail: "Your best run this term. One more day to equal your record.",
    icon: Flame,
    accent: "bg-orange-50 text-orange-600",
  },
  {
    title: "Biology crossed 75%",
    detail: "Exchange surfaces is now your strongest A-level unit.",
    icon: Target,
    accent: "bg-brand-50 text-brand-600",
  },
  {
    title: "250 cards reviewed",
    detail: "84% recall across this week's spaced-repetition sessions.",
    icon: Layers,
    accent: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "8 past papers marked",
    detail: "Two more than October. Mathematics is improving fastest.",
    icon: FileText,
    accent: "bg-emerald-50 text-emerald-700",
  },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Long-term view"
        title="Progress"
        description="Mastery, study time, board coverage and grade trajectory in one place. All figures are illustrative demo data."
        actions={
          <>
            <Link href="/notes" className="btn-secondary">
              <BookOpen aria-hidden="true" size={16} />
              Open notes
            </Link>
            <Link href="/planner" className="btn-primary">
              <Timer aria-hidden="true" size={16} />
              Review planner
            </Link>
          </>
        }
      />

      <section aria-label="Progress summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average mastery"
          value={`${averageMastery}%`}
          detail="Up 17 points over the last eight weeks."
          icon={Target}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Study this week"
          value="6h 42m"
          detail="74% of the 9-hour weekly target."
          icon={Timer}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Cards reviewed"
          value="246"
          detail="Across 10 decks. 84% recalled first time."
          icon={Layers}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Topics mastered"
          value={`${topicsComplete}/${topicsTotal}`}
          detail="Ten active subjects · six exam boards."
          icon={BookOpen}
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
                Average mastery across all active subjects
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              +17 pts in 8 weeks
            </span>
          </div>
          <div className="mt-5">
            <MasteryChart />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-sm">
            <div>
              <p className="text-xs text-ink-muted">Starting point</p>
              <p className="mt-0.5 font-semibold">48%</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Current</p>
              <p className="mt-0.5 font-semibold">65%</p>
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
          <ul className="mt-5 space-y-3.5">
            {boardMastery.map((item) => (
              <li key={item.board}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{item.board}</span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {item.count} {item.count === 1 ? "subject" : "subjects"}
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs font-semibold">
                    {item.average}%
                  </span>
                </div>
                <ProgressBar
                  value={item.average}
                  label={`${item.board} average mastery`}
                  className="mt-1.5"
                />
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-ink-muted">
            {boardMastery[0]?.board} currently leads your board averages at{" "}
            {boardMastery[0]?.average}% mastery.
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
                {subjectGradeRows.map((row) => (
                  <tr key={row.subject} className="transition hover:bg-slate-50/60">
                    <th scope="row" className="whitespace-nowrap px-5 py-3.5 text-left text-sm font-semibold">
                      {row.subject}
                    </th>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-soft">
                      {row.board}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                      {row.target}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                      {row.predicted}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-ink-soft">
                      {row.latest}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={
                          row.trend === "up"
                            ? "inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
                            : row.trend === "down"
                              ? "inline-flex items-center gap-1 text-xs font-semibold text-rose-700"
                              : "inline-flex items-center gap-1 text-xs font-semibold text-ink-muted"
                        }
                      >
                        {row.trend === "up" ? (
                          <ArrowUpRight aria-hidden="true" size={13} />
                        ) : row.trend === "down" ? (
                          <ArrowDownRight aria-hidden="true" size={13} />
                        ) : (
                          <Minus aria-hidden="true" size={13} />
                        )}
                        {row.trend === "up"
                          ? "Improving"
                          : row.trend === "down"
                            ? "Needs focus"
                            : "Stable"}
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
            Small wins from the last 30 days
          </p>
          <ol className="mt-5 space-y-4">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <li key={milestone.title} className="flex gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${milestone.accent}`}
                  >
                    <Icon aria-hidden="true" size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5">
                      {milestone.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                      {milestone.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link
            href="/planner"
            className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Keep the streak going
            <ArrowRight aria-hidden="true" size={12} />
          </Link>
        </section>
      </div>
      <RealAnalytics />
    </div>
  );
}
