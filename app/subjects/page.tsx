import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarDays, Layers, Settings2, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/ui";
import { SubjectsBrowser } from "@/components/subjects-browser";
import { subjects } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Subjects",
  description: "Manage your GCSE, International GCSE and A-level subjects.",
};

const averageMastery = Math.round(
  subjects.reduce((total, subject) => total + subject.progress, 0) /
    subjects.length,
);
const totalTopics = subjects.reduce(
  (total, subject) => total + subject.topicsTotal,
  0,
);
const cardsDue = subjects.reduce(
  (total, subject) => total + subject.cardsDue,
  0,
);

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Curriculum"
        title="Your subjects"
        description="Ten active courses spanning all six exam boards and four qualification levels. Progress shown here is realistic demo data."
        actions={
          <>
            <Link href="/settings" className="btn-secondary">
              <Settings2 aria-hidden="true" size={16} />
              Preferences
            </Link>
            <Link href="/planner" className="btn-primary">
              <CalendarDays aria-hidden="true" size={16} />
              Plan a session
            </Link>
          </>
        }
      />

      <section aria-label="Subject summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active subjects"
          value={String(subjects.length)}
          detail="AQA, Pearson Edexcel, OCR, WJEC, Eduqas and CCEA."
          icon={BookOpen}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Average mastery"
          value={`${averageMastery}%`}
          detail="Weighted equally across all active courses."
          icon={Target}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Topics mapped"
          value={String(totalTopics)}
          detail="Complete topic outlines ready for notes and cards."
          icon={Layers}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Cards due"
          value={String(cardsDue)}
          detail="Spread across your spaced-repetition decks."
          icon={CalendarDays}
          accent="bg-amber-50 text-amber-700"
        />
      </section>

      <SubjectsBrowser />
    </div>
  );
}
