import type { Metadata } from "next";
import { Archive, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExamMaterialsBrowser } from "@/components/exam-materials-browser";

export const metadata: Metadata = {
  title: "Exam materials",
  description: "Question papers, mark schemes, examiner reports and specification PDFs curated for GCSE.",
};

export default function ExamMaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Exam materials"
        description="Public GCSE papers, mark schemes and examiner reports from AQA, OCR and CCEA, served from a private Hugging Face archive. Boards' own sources remain the authoritative reference."
      />
      <section className="card p-5">
        <ExamMaterialsBrowser />
      </section>
      <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-900"><Archive aria-hidden="true" size={16} /> What lives here</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-brand-900/85">
          <li>AQA GCSE — <strong>6,827</strong> PDFs (papers, mark schemes, examiner reports, candidate materials)</li>
          <li>OCR GCSE — <strong>3,369</strong> PDFs (papers, mark schemes, examiner reports)</li>
          <li>CCEA GCSE — <strong>4,586</strong> PDFs plus <strong>58</strong> MP3/ZIP assets</li>
        </ul>
        <p className="mt-3 flex items-center gap-2 text-xs text-brand-900/75"><FileText aria-hidden="true" size={12} /> Files stream straight from the private archive; they never touch this server&apos;s disk.</p>
      </section>
    </div>
  );
}
