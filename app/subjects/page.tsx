import type { Metadata } from "next";
import { SubjectsPageClient } from "@/components/subjects-page-client";

export const metadata: Metadata = {
  title: "Subjects",
  description: "Manage your GCSE, International GCSE and A-level subjects.",
};

export default function SubjectsPage() {
  return <SubjectsPageClient />;
}
