import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  FileQuestion,
  Lightbulb,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui";
import { AiTutorChat } from "@/components/ai-tutor-chat";

export const metadata: Metadata = {
  title: "AI Tutor",
  description:
    "A guided, simulated AI study tutor for explanations, exam plans and retrieval practice.",
};

export default function AiTutorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guided study"
        title="AI Tutor"
        description="Ask for an explanation, build an exam answer plan or run a quick retrieval quiz. This demo uses simulated responses and never sends data anywhere."
        actions={
          <>
            <Link href="/notes" className="btn-secondary">
              <BookOpen aria-hidden="true" size={16} />
              Open notes
            </Link>
            <Link href="/practice" className="btn-primary">
              <FileQuestion aria-hidden="true" size={16} />
              Practice questions
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <AiTutorChat />

        <div className="space-y-5">
          <section className="card p-5" aria-labelledby="tutor-context-title">
            <div className="flex items-center justify-between gap-2">
              <h2 id="tutor-context-title" className="text-sm font-semibold">
                Study context
              </h2>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Synced
              </Badge>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
                AQA · A-level
              </p>
              <h3 className="mt-1.5 text-base font-semibold">Biology</h3>
              <p className="mt-0.5 text-sm text-ink-muted">
                Exchange surfaces & transport
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-ink-muted">Topic mastery</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[78%] rounded-full bg-brand-500" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/notes" className="btn-secondary px-3 py-2 text-xs">
                <BookOpen aria-hidden="true" size={13} />
                Notes
              </Link>
              <Link href="/practice" className="btn-secondary px-3 py-2 text-xs">
                <FileQuestion aria-hidden="true" size={13} />
                Practise
              </Link>
            </div>
          </section>

          <section className="card p-5" aria-labelledby="tutor-tips-title">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <Lightbulb aria-hidden="true" size={16} />
              </span>
              <h2 id="tutor-tips-title" className="text-sm font-semibold">
                Get a better answer
              </h2>
            </div>
            <ol className="mt-4 space-y-3">
              {[
                "Name the subject, board and level.",
                "Say whether you want an explanation, plan or quiz.",
                "Include the number of marks for exam answers.",
                "Ask for one improvement after your first attempt.",
              ].map((tip, index) => (
                <li key={tip} className="flex gap-2.5 text-sm leading-5 text-ink-soft">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[0.65rem] font-bold text-ink-muted">
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-labelledby="tutor-safety-title">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" size={17} className="text-emerald-600" />
              <h2 id="tutor-safety-title" className="text-sm font-semibold">
                Safe by design
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              This workspace contains no user data. The demo tutor runs entirely
              in your browser with canned replies, and no prompts are stored or
              transmitted.
            </p>
            <Link
              href="/settings"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Review privacy settings
              <ArrowUpRight aria-hidden="true" size={12} />
            </Link>
          </section>

          <div className="rounded-2xl bg-night p-5 text-white shadow-lift">
            <Sparkles aria-hidden="true" size={18} className="text-brand-300" />
            <h2 className="mt-3 text-sm font-semibold">Need a fresh angle?</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">
              Ask for a worked example, a counterargument, or a six-mark plan
              before you attempt the question yourself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
