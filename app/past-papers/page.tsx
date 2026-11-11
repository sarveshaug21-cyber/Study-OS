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
import { EXAM_BOARD_CATALOG as EXAM_BOARDS, QUALIFICATIONS as QUALIFICATION_LEVELS } from "@/lib/catalog";
import { OFFICIAL_RESOURCES } from "@/lib/official-resources";
import { PastPaperLinks } from "@/components/past-paper-actions";
import { api } from "@/lib/api";

type PastPaper = {
  id: string;
  subjectId: string;
  subject: string;
  board: string;
  level: string;
  year: number;
  session: string;
  paperCode: string;
  title: string;
  durationMinutes: number;
  marks: number;
  hasMarkScheme: boolean;
};

export const metadata: Metadata = {
  title: "Past Papers",
  description:
    "Browse GCSE, International GCSE and A-level past papers with mark schemes.",
};

export default async function PastPapersPage() {
  let papers: PastPaper[] = [];
  let completions: { pastPaperId: string; score: number | null }[] = [];
  let error: string | null = null;

  try {
    const d = await api<{ papers: PastPaper[]; completions: { pastPaperId: string; score: number | null }[] }>("/api/past-papers");
    papers = d.papers ?? [];
    completions = d.completions ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load past papers";
  }

  const markSchemeCount = papers.filter((paper) => paper.hasMarkScheme).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Question practice"
        title="Past papers"
        description="Browse GCSE, International GCSE and A-level past papers with mark schemes."
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

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error} — showing limited content.
        </p>
      )}

      <section aria-label="Past paper statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Papers available"
          value={String(papers.length)}
          detail="Past papers from your connected data source."
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
          value={`${markSchemeCount}/${papers.length}`}
          detail="Every paper includes marking guidance."
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
        />
      </section>

      <PastPapersBrowser papers={papers} completions={completions} />

      <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5" aria-labelledby="paper-note-title">
        <h2 id="paper-note-title" className="text-sm font-semibold text-brand-900">
          About this demo library
        </h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-brand-900/80">
          Past papers link to official exam board sources. Where official documents
          cannot be hosted due to copyright, links point to the board&apos;s own website.
        </p>
      </section>
      <PastPaperLinks papers={papers.map((p) => ({ id: p.id, paperCode: p.paperCode, title: p.title }))} />
    </div>
  );
}
