import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, FileQuestion, Lightbulb, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui";
import { AiTutorChat } from "@/components/ai-tutor-chat";
export const metadata: Metadata = { title: "AI Tutor", description: "A guided AI study tutor." };
export default function AiTutorPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Guided study" title="AI Tutor" description="Ask for an explanation, build an exam answer plan or run a quick retrieval quiz. Replies are tailored to your year group, exam board, qualification and subject (set in Settings)." actions={<><Link href="/notes" className="btn-secondary"><BookOpen aria-hidden="true" size={16} />Open notes</Link><Link href="/practice" className="btn-primary"><FileQuestion aria-hidden="true" size={16} />Practice questions</Link></>} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <AiTutorChat />
        <div className="space-y-5">
          <section className="card p-5" aria-labelledby="tutor-context-title">
            <div className="flex items-center justify-between gap-2">
              <h2 id="tutor-context-title" className="text-sm font-semibold">Study context</h2>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Synced from settings</Badge>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Your year group, exam board, qualification and subject are read from your profile (Settings). AI replies use the matching teaching profile. If you have not chosen a year group yet, you will be asked to set one.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/notes" className="btn-secondary px-3 py-2 text-xs"><BookOpen aria-hidden="true" size={13} />Notes</Link>
              <Link href="/practice" className="btn-secondary px-3 py-2 text-xs"><FileQuestion aria-hidden="true" size={13} />Practise</Link>
            </div>
          </section>
          <section className="card p-5" aria-labelledby="tutor-tips-title">
            <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Lightbulb aria-hidden="true" size={16} /></span><h2 id="tutor-tips-title" className="text-sm font-semibold">Get a better answer</h2></div>
            <ol className="mt-4 space-y-3">{["Name the subject, board and level.","Say whether you want an explanation, plan or quiz.","Include the number of marks for exam answers.","Ask for one improvement after your first attempt."].map((tip,i)=><li key={tip} className="flex gap-2.5 text-sm leading-5 text-ink-soft"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[0.65rem] font-bold text-ink-muted">{i+1}</span><span>{tip}</span></li>)}</ol>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-labelledby="tutor-safety-title">
            <div className="flex items-center gap-2"><ShieldCheck aria-hidden="true" size={17} className="text-emerald-600" /><h2 id="tutor-safety-title" className="text-sm font-semibold">Safe by design</h2></div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">This workspace contains no user data unless Supabase is configured. Prompts are assembled server-side; API keys never reach the browser.</p>
            <Link href="/settings" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800">Review privacy settings<ArrowUpRight aria-hidden="true" size={12} /></Link>
          </section>
        </div>
      </div>
    </div>
  );
}
