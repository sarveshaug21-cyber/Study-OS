import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { EXAM_BOARD_CATALOG, QUALIFICATIONS, OFFICIAL_UPDATES_URLS } from "@/lib/catalog";
export const metadata = { title: "Exam boards & specifications" };
export default function SpecificationsPage() {
  return (<div className="space-y-6"><PageHeader eyebrow="Catalogue" title="Exam boards & specifications" description="All six boards and four qualifications. Official specification content is linked to board sources; anything not verified is labelled as such. No syllabus content is invented here." actions={<Link href="/subjects" className="btn-primary">Go to subjects</Link>} />
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{EXAM_BOARD_CATALOG.map((b) => <article key={b.board} className="card p-5"><h2 className="font-semibold">{b.board}</h2><p className="mt-1 text-sm text-ink-muted">Qualifications: {b.qualifications.join(", ")}</p><a className="mt-3 inline-block text-sm font-semibold text-brand-700" href={b.officialUrl} target="_blank" rel="noreferrer">Official site ↗</a></article>)}</section>
    <section className="card p-5"><h2 className="font-semibold">Qualifications</h2><p className="mt-1 text-sm text-ink-muted">{QUALIFICATIONS.join(" · ")}</p></section>
    <section className="card p-5"><h2 className="font-semibold">Update monitoring sources</h2><p className="mt-1 text-sm text-ink-muted">Check these official pages monthly (or trigger <code>POST /api/spec-updates</code>). Confirmed vs proposed vs unverified is recorded in the database.</p><ul className="mt-3 space-y-2">{OFFICIAL_UPDATES_URLS.map((u) => <li key={u.board}><a className="text-sm font-semibold text-brand-700" href={u.url} target="_blank" rel="noreferrer">{u.label} ↗</a></li>)}</ul><Link className="btn-secondary mt-4" href="/settings">Record an update in Settings</Link></section>
  </div>);
}
