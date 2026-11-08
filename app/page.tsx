import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Flame,
  Layers,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TodayPlan } from "@/components/today-plan";
import { WeeklyStudyChart } from "@/components/weekly-study-chart";
import { StatCard, ProgressBar } from "@/components/ui";
import {
  assessments,
  boardCoverage,
  dashboardActivity,
  demoUser,
  subjects,
  weeklyStudy,
} from "@/lib/demo-data";

const continueSubjects = [
  subjects.find((subject) => subject.id === "bio-aqa"),
  subjects.find((subject) => subject.id === "maths-edexcel"),
  subjects.find((subject) => subject.id === "psych-int-edexcel"),
].filter((subject): subject is NonNullable<typeof subject> => Boolean(subject));

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sunday, 8 November"
        title={`Good evening, ${demoUser.name.split(" ")[0]}`}
        description="You are 4 days out from your Biology mock. Here is what matters most this evening."
        actions={
          <>
            <Link href="/ai-tutor" className="btn-secondary">
              <Sparkles aria-hidden="true" size={16} />
              Ask AI Tutor
            </Link>
            <Link href="/planner" className="btn-primary">
              <Timer aria-hidden="true" size={16} />
              Start focus session
            </Link>
          </>
        }
      />

      <section aria-label="Study summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Study streak"
          value="12 days"
          detail="Personal best is 21 days. Keep the run alive."
          icon={Flame}
          accent="bg-orange-50 text-orange-600"
        />
        <StatCard
          label="Cards due"
          value="37"
          detail="Across 10 decks · about 24 minutes today."
          icon={Layers}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Weekly focus"
          value="6h 42m"
          detail="74% of your 9-hour target. Saturday was your best day."
          icon={Timer}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Average mastery"
          value="65%"
          detail="Up 4 points this month across all subjects."
          icon={Target}
          accent="bg-emerald-50 text-emerald-700"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <section className="card p-5" aria-labelledby="continue-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="continue-title" className="text-base font-semibold tracking-tight">
                Continue where you left off
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Three focused sessions picked from your current plan.
              </p>
            </div>
            <Link
              href="/subjects"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              All subjects
              <ArrowUpRight aria-hidden="true" size={13} />
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {continueSubjects.map((subject) => (
              <Link
                key={subject.id}
                href="/subjects"
                className="group flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: subject.accent }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-ink-soft">
                    {subject.name}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-5 text-ink">
                  {subject.nextTopic}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {subject.board} · {subject.level}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
                  <span>{subject.progress}% mastery</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">
                    Resume
                    <ArrowRight aria-hidden="true" size={12} />
                  </span>
                </div>
                <ProgressBar
                  value={subject.progress}
                  accent={subject.accent}
                  label={`${subject.name} mastery`}
                  className="mt-2"
                />
              </Link>
            ))}
          </div>
        </section>

        <TodayPlan />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <section className="card p-5" aria-labelledby="rhythm-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="rhythm-title" className="text-base font-semibold tracking-tight">
                Weekly study rhythm
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Minutes studied each day this week
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">6h 42m</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[0.68rem] font-semibold text-emerald-700">
                +12% vs last week
              </span>
            </div>
          </div>

          <WeeklyStudyChart data={weeklyStudy} className="mt-6" large />

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink-muted">Daily average</p>
              <p className="mt-0.5 font-semibold">57 min</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Best day</p>
              <p className="mt-0.5 font-semibold">Saturday · 1h 36m</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-ink-muted">Focus goal</p>
              <p className="mt-0.5 font-semibold">90 min / day</p>
            </div>
          </div>
        </section>

        <section
          className="relative flex flex-col overflow-hidden rounded-2xl bg-night p-5 text-white shadow-lift"
          aria-labelledby="next-assessment-title"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-brand-200">
                <CalendarClock aria-hidden="true" size={12} />
                Next assessment
              </span>
              <span className="rounded-full bg-amber-300/15 px-2.5 py-1 text-[0.68rem] font-semibold text-amber-200">
                4 days
              </span>
            </div>
            <h2
              id="next-assessment-title"
              className="mt-5 text-balance text-2xl font-semibold tracking-tight"
            >
              Biology mock — Paper 1
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              AQA · A-level · Thursday 12 November, 09:00
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Topics covered</span>
                <span className="font-semibold text-white">18 / 24</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-400 to-cyan-300" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[0.68rem] uppercase tracking-wider text-slate-400">
                  Predicted
                </p>
                <p className="mt-1 text-lg font-semibold">A</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[0.68rem] uppercase tracking-wider text-slate-400">
                  Target
                </p>
                <p className="mt-1 text-lg font-semibold">A*</p>
              </div>
            </div>

            <Link
              href="/planner"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-100"
            >
              Review revision plan
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5" aria-labelledby="assessments-title">
          <div className="flex items-end justify-between gap-3">
            <h2 id="assessments-title" className="text-base font-semibold tracking-tight">
              Upcoming assessments
            </h2>
            <Link href="/planner" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {assessments.map((assessment) => (
              <li key={assessment.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: `${assessment.accent}14`,
                    color: assessment.accent,
                  }}
                  aria-hidden="true"
                >
                  {assessment.daysAway}d
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{assessment.title}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {assessment.date} · {assessment.type}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  size={14}
                  className="shrink-0 text-slate-400"
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5" aria-labelledby="activity-title">
          <div className="flex items-end justify-between gap-3">
            <h2 id="activity-title" className="text-base font-semibold tracking-tight">
              Recent activity
            </h2>
            <Link href="/progress" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Progress
            </Link>
          </div>
          <ol className="mt-4 space-y-4">
            {dashboardActivity.map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: activity.accent }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-5">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {activity.detail} · {activity.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card p-5" aria-labelledby="boards-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="boards-title" className="text-base font-semibold tracking-tight">
                Exam board coverage
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                10 subjects across 6 boards
              </p>
            </div>
            <Link href="/subjects" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Manage
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2.5">
            {boardCoverage.map((item) => (
              <li
                key={item.board}
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
              >
                <p className="truncate text-xs font-semibold text-ink-soft">
                  {item.board}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-ink-muted">
                  {item.subjects} {item.subjects === 1 ? "subject" : "subjects"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
