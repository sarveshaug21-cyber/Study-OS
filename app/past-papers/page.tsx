import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/ui";
import { PastPapersBrowser } from "@/components/past-papers-browser";
import { EXAM_BOARDS, QUALIFICATION_LEVELS, pastPapers } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Past Papers",
  description:
    "Browse GCSE, International GCSE and A-level past papers with mark schemes.",
};

const markSchemeCount = pastPapers.filter((paper) => paper.hasMarkScheme).length;

export default function PastPapersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Question practice"
        title="Past papers"
        description="A realistic demo library covering AQA, Pearson Edexcel, OCR, WJEC, Eduqas and CCEA across every supported qualification."
        actions={
          <>
            <Link href="/practice" className="btn-secondary">
              <FileText aria-hidden="true" size={16} />
              Practice questions
            </Link>
            <Link href="/planner" className="btn-primary">
              <CalendarDays aria-hidden="true" size={16} />
              Plan a paper
            </Link>
          </>
        }
      />

      <section aria-label="Past paper statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Papers available"
          value={String(pastPapers.length)}
          detail="Representative question papers in the demo library."
          icon={FileText}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Exam boards"
          value={String(EXAM_BOARDS.length)}
          detail="Every supported board is represented."
          icon={Building2}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Qualifications"
          value={String(QUALIFICATION_LEVELS.length)}
          detail="GCSE through International A-level."
          icon={GraduationCap}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Mark schemes"
          value={`${markSchemeCount}/${pastPapers.length}`}
          detail="Every demo paper includes marking guidance."
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
        />
      </section>

      <PastPapersBrowser />

      <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5" aria-labelledby="paper-note-title">
        <h2 id="paper-note-title" className="text-sm font-semibold text-brand-900">
          About this demo library
        </h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-brand-900/80">
          These records use representative paper codes and titles for product
          demonstration. They are not official copies of board materials. In a
          production deployment, paper files would live in Supabase Storage with
          signed URLs and row-level access policies.
        </p>
      </section>
    </div>
  );
}
