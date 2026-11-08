import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleCheck,
  FileQuestion,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/ui";
import { PracticeBrowser } from "@/components/practice-browser";
import { practiceQuestions } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Practice Questions",
  description:
    "Exam-style practice questions with model answers and mark schemes.",
};

const topicCount = new Set(practiceQuestions.map((question) => question.topic))
  .size;

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exam practice"
        title="Practice questions"
        description="Apply knowledge under exam conditions, then compare your answer with the model answer and mark scheme."
        actions={
          <>
            <Link href="/ai-tutor" className="btn-secondary">
              <Sparkles aria-hidden="true" size={16} />
              Ask AI Tutor
            </Link>
            <Link href="#question-bank" className="btn-primary">
              <FileQuestion aria-hidden="true" size={16} />
              Start practice
            </Link>
          </>
        }
      />

      <section aria-label="Practice statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Question bank"
          value={String(practiceQuestions.length)}
          detail={`${topicCount} topics across all supported boards.`}
          icon={FileQuestion}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Attempted this week"
          value="24"
          detail="Up 8 from last week. Keep the momentum going."
          icon={CircleCheck}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Average score"
          value="68%"
          detail="Marked-answer average over the last 30 days."
          icon={Target}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Time on task"
          value="2h 15m"
          detail="Practice completed in timed and untimed sessions."
          icon={Timer}
          accent="bg-amber-50 text-amber-700"
        />
      </section>

      <div id="question-bank" className="scroll-mt-24">
        <PracticeBrowser />
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="examiner-tips-title">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <TrendingUp aria-hidden="true" size={17} />
          </span>
          <div>
            <h2 id="examiner-tips-title" className="text-base font-semibold tracking-tight">
              Examiner&apos;s checklist
            </h2>
            <p className="text-sm text-ink-muted">
              Three habits that lift marks in every subject.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Answer the command word",
              detail:
                "Explain means give reasons. Assess means weigh evidence. Underline the command word before you write.",
            },
            {
              title: "Use the marks as a guide",
              detail:
                "A four-mark question usually needs four distinct points. Do not write one idea in four different ways.",
            },
            {
              title: "Close the loop",
              detail:
                "After marking, write the correction in your own words and schedule a review in the planner.",
            },
          ].map((tip, index) => (
            <div key={tip.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold text-brand-600">
                0{index + 1}
              </span>
              <h3 className="mt-1.5 text-sm font-semibold">{tip.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                {tip.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
