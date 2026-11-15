import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { BoardExplorer } from "@/components/board-explorer";
import { SpecificationBrowser } from "@/components/specification-browser";
import { SpecificationMapping } from "@/components/specification-mapping";
import { OFFICIAL_UPDATES_URLS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Exam boards & specifications",
  description:
    "Compare AQA, Pearson Edexcel, OCR, WJEC, Eduqas and CCEA: qualifications awarded, specification codes, tiering, exam windows and assessment structure.",
};

export default function SpecificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Exam boards & specifications"
        description="All six boards and four qualifications. Official specification content is linked to board sources; anything not verified is labelled as such. No syllabus content is invented here."
        actions={
          <Link href="/subjects" className="btn-primary">
            <BookOpen aria-hidden="true" size={16} />
            Go to subjects
          </Link>
        }
      />

      <BoardExplorer />
      <SpecificationMapping />
      <SpecificationBrowser />

      <section className="card p-5" aria-labelledby="update-sources-title">
        <h2 id="update-sources-title" className="text-base font-semibold tracking-tight">
          Update monitoring sources
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Check these official pages monthly (or trigger <code>POST /api/spec-updates</code>). Confirmed vs proposed vs unverified is recorded in the database.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICIAL_UPDATES_URLS.map((u) => (
            <li key={u.board}>
              <a
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                href={u.url}
                target="_blank"
                rel="noreferrer"
              >
                {u.label}
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link className="btn-secondary" href="/settings">
            Record an update in Settings
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <ShieldCheck aria-hidden="true" size={13} />
            No background scheduler is running — checks are manual by design.
          </span>
        </div>
      </section>
    </div>
  );
}
