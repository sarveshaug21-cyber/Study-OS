import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProgressBar, StatCard } from "@/components/ui";
import { PlannerBoard } from "@/components/planner-board";
import {
  assessments,
  plannerTasks,
  subjects,
} from "@/lib/demo-data";
import { PlannerForm, SessionForm } from "@/components/data-panels";

export const metadata: Metadata = {
  title: "Planner",
  description:
    "Plan your study week with focused blocks, deadlines and subject balance.",
};

const completed = plannerTasks.filter((task) => task.completed).length;
const totalMinutes = plannerTasks.reduce(
  (total, task) => total + task.duration,
  0,
);
const completion = Math.round((completed / plannerTasks.length) * 100);

const subjectMinutes = subjects
  .map((subject) => {
    const minutes = plannerTasks
      .filter((task) => task.subject === subject.name)
      .reduce((total, task) => total + task.duration, 0);

    return { subject, minutes };
  })
  .filter((item) => item.minutes > 0)
  .sort((a, b) => b.minutes - a.minutes)
  .slice(0, 5);

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Weekly planning"
        title="Planner"
        description="A realistic week of six to twelve focused blocks, balanced across your subjects and built around the next assessment."
        actions={
          <>
            <Link href="/progress" className="btn-secondary">
              <TrendingUp aria-hidden="true" size={16} />
              Review progress
            </Link>
            <Link href="/flashcards" className="btn-primary">
              <Layers aria-hidden="true" size={16} />
              Start flashcards
            </Link>
          </>
        }
      />

      <section aria-label="Planner statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Planned this week"
          value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
          detail="Twelve blocks including two timed papers."
          icon={Clock3}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Blocks complete"
          value={`${completed}/${plannerTasks.length}`}
          detail={`${completion}% of the weekly plan finished.`}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Next deadline"
          value="4 days"
          detail="Biology mock Paper 1 on Thursday 12 November."
          icon={CalendarDays}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Daily focus goal"
          value="90 min"
          detail="Currently averaging 57 minutes per day."
          icon={Target}
          accent="bg-cyan-50 text-cyan-700"
        />
      </section>

      <PlannerBoard />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="balance-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="balance-title" className="text-base font-semibold tracking-tight">
                Study balance
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Planned minutes by subject this week
              </p>
            </div>
            <span className="text-xs font-semibold text-ink-muted">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total
            </span>
          </div>
          <ul className="mt-5 space-y-4">
            {subjectMinutes.map(({ subject, minutes }) => (
              <li key={subject.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: subject.accent }}
                      aria-hidden="true"
                    />
                    {subject.name}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {minutes} min
                  </span>
                </div>
                <ProgressBar
                  value={(minutes / totalMinutes) * 100}
                  accent={subject.accent}
                  label={`${subject.name} planned time`}
                  className="mt-2"
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5" aria-labelledby="deadlines-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="deadlines-title" className="text-base font-semibold tracking-tight">
                Deadlines ahead
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                The next three assessments in your plan
              </p>
            </div>
            <Link href="/subjects" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Subjects
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {assessments.map((assessment) => (
              <li key={assessment.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: `${assessment.accent}14`,
                    color: assessment.accent,
                  }}
                  aria-hidden="true"
                >
                  {assessment.daysAway}d
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5">
                    {assessment.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {assessment.board} · {assessment.level}
                  </p>
                  <p className="mt-1 text-xs font-medium text-ink-soft">
                    {assessment.date}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-semibold text-ink-muted">
                  {assessment.type}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs leading-5 text-brand-900">
            Protect Saturday morning for the Biology mock. Keep Sunday light and
            finish with a 20-minute flashcard review.
          </div>
        </section>
      </div>
      <PlannerForm />
      <SessionForm />
    </div>
  );
}
