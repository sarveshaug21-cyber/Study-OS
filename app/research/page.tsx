import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { NotebookResearch } from "@/components/notebook-research";
export const metadata = { title: "Research (Open Notebook)" };
export default function ResearchPage() {
  return (<div className="space-y-6"><PageHeader eyebrow="Research" title="Open Notebook research" description="Source-grounded research powered by your Open Notebook deployment. If it is unavailable, you will see a clear notice — no fake results." actions={<Link href="/ai-tutor" className="btn-primary">Open AI tutor</Link>} /><NotebookResearch /></div>);
}
