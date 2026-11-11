"use client";

import type { Metadata } from "next";
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
import { StatCard, ProgressBar } from "@/components/ui";
import { MasteryChart } from "@/components/mastery-chart";
import { TodayPlan } from "@/components/today-plan";
import { WeeklyStudyChart } from "@/components/weekly-study-chart";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type Subject = {
  id: string;
  name: string;
  board: string;
  level: string;
  accent: string;
  progress: number;
  examDate: string | null;
};

type PlannerTask = {
  id: string;
  title: string;
  subjectId: string | null;
  scheduledFor: string;
  estimatedMinutes: number;
  status: string;
};

type PracticeQuestion = {
  id: string;
  subjectId: string;
  question: string;
  marks: number;
  createdAt: string;
};

type ProgressRecord = {
  id: string;
  userId: string;
  subjectId: string;
  mastery: number;
  confidence: number;
  studyMinutes: number;
  recordedAt: string;
};



export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes, rRes, qRes] = await Promise.all([
          api<{ subjects: Subject[] }>("/api/subjects"),
          api<{ tasks: PlannerTask[] }>("/api/planner"),
          api<{ records: ProgressRecord[] }>("/api/progress"),
          api<{ questions: PracticeQuestion[] }>("/api/practice"),
        ]);
        setSubjects(sRes.subjects ?? []);
        setTasks(pRes.tasks ?? []);
        setRecords(rRes.records ?? []);
        setQuestions(qRes.questions ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.scheduledFor);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && t.status !== "done";
  });

  const upcomingTasks = tasks
    .filter((t) => {
      const d = new Date(t.scheduledFor);
      d.setHours(0, 0, 0, 0);
      return d.getTime() > today.getTime() && t.status !== "done";
    })
    .slice(0, 3);

  const upcomingAssessments = questions
    .filter((q) => {
      const d = new Date(q.createdAt);
      return d > today;
    })
    .slice(0, 3);

  const totalStudyMinutes = 0; // Would come from study sessions
  const averageMastery =
    records.length > 0
      ? Math.round(
          records.reduce((a, r) => a + r.mastery, 0) / records.length
        )
    : 0;

  const recentActivity = records
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      title: `Updated ${r.subjectId} progress`,
      detail: `${r.mastery}% mastery`,
      time: r.recordedAt,
      accent: subjects.find((s) => s.id === r.subjectId)?.accent || "#7A55F2",
    }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Sunday, 8 November"
          title="Loading dashboard…"
          description=""
        />
        <p className="text-sm text-ink-muted">Loading your dashboard data…</p>
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
        eyebrow="Dashboard"
        title="Study OS"
        description="Your study snapshot, progress tracker and revision command centre."
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
          label="Active subjects"
          value={String(subjects.length)}
          detail="Across your enrolled courses."
          icon={Layers}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Today's tasks"
          value={String(todayTasks.length)}
          detail="Due today across your subjects."
          icon={Flame}
          accent="bg-orange-50 text-orange-600"
        />
        <StatCard
          label="Weekly study"
          value={`${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`}
          detail="From your logged study sessions."
          icon={Timer}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Average mastery"
          value={`${averageMastery}%`}
          detail="Based on your progress records."
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
                Focus on your upcoming study blocks.
              </p>
            </div>
            <Link
              href="/subjects"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              All subjects
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {todayTasks.slice(0, 3).length > 0 ? (
              todayTasks.slice(0, 3).map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId);
                return (
                  <Link
                    key={task.id}
                    href="/subjects"
                    className="group flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-card"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: subject?.accent }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-ink-soft">
                        {subject?.name || "Subject"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-5 text-ink">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {task.subjectId ? "Scheduled task" : "No subject"}
                    </p>
                    <ProgressBar
                      value={0}
                      accent={subject?.accent || "#7A55F2"}
                      label={task.title}
                      className="mt-2"
                    />
                  </Link>
                )
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-ink-muted">
                No upcoming study blocks. Add one in the planner.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <section className="card p-5" aria-labelledby="rhythm-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="rhythm-title" className="text-base font-semibold tracking-tight">
                Weekly study rhythm
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Study time logged this week
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {Math.floor(totalStudyMinutes / 60)}h{" "}
                {totalStudyMinutes % 60}m
              </span>
            </div>
          </div>
          <div className="mt-4">
            <WeeklyStudyChart
              data={[]}
              className="mt-6"
              large
            />
          </div>
        </section>

        <section className="card p-5" aria-labelledby="assessments-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="assessments-title" className="text-base font-semibold tracking-tight">
                Upcoming assessments
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Based on your practice questions.
              </p>
            </div>
            <Link href="/past-papers" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {upcomingAssessments.map((q) => (
              <li key={q.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: "#7A55F214",
                    color: "#7A55F2",
                  }}
                  aria-hidden="true"
                >
                  {1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{q.question}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {q.marks} marks
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
            <div>
              <h2 id="activity-title" className="text-base font-semibold tracking-tight">
                Recent activity
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Latest progress updates.
              </p>
            </div>
            <Link href="/progress" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              View all
            </Link>
          </div>
          <ol className="mt-4 space-y-4">
            {recentActivity.map((activity) => (
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
              <p className="mt-0.5 text-sm text-ink-muted">
                {new Set(subjects.map((s) => s.board)).size} boards
              </p>
            </div>
            <Link href="/subjects" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Manage
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2.5">
            {[...new Set(subjects.map((s) => s.board))].map((board) => (
              <li
                key={board}
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
              >
                <p className="truncate text-xs font-semibold text-ink-soft">
                  {board}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-ink-muted">
                  {subjects.filter((s) => s.board === board).length} subjects
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
