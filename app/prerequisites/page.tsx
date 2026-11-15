import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PrerequisiteMap } from "@/components/prerequisite-map";

export const metadata: Metadata = {
  title: "Learning sequence",
  description:
    "Topic dependencies, recommended revision order and the concepts that unlock the most learning.",
};

export default function PrerequisitesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Prerequisite intelligence"
        title="Your learning sequence"
        description="Study OS maps which concepts depend on others, so you revise the foundation before the topic that needs it."
        actions={
          <Link href="/subjects" className="btn-secondary">
            <GitBranch aria-hidden="true" size={16} />
            Manage topics
          </Link>
        }
      />
      <PrerequisiteMap />
    </div>
  );
}
