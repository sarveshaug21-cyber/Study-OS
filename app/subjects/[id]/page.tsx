import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SubjectWorkspace } from "@/components/subject-workspace";
export const metadata = { title: "Subject workspace" };
export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (<div className="space-y-6"><PageHeader eyebrow="Subject workspace" title="Subject" description="Specification checklist, topics, notes and progress for this subject." actions={<Link href="/subjects" className="btn-secondary">Back to subjects</Link>} /><SubjectWorkspace subjectId={id} /></div>);
}
