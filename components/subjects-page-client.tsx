"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Layers, Settings2, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/ui";
import { SubjectsBrowser, type Subject } from "@/components/subjects-browser";
import { SubjectForm } from "@/components/data-panels";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export function SubjectsPageClient() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const d = await api<{ subjects: Subject[] }>("/api/subjects");
        setSubjects(d.subjects ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load subjects");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const averageMastery =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((total, s) => total + s.progress, 0) /
            subjects.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Curriculum"
        title="Your subjects"
        description="Manage your GCSE, International GCSE and A-level subjects."
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

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      <section aria-label="Subject summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active subjects"
          value={String(subjects.length)}
          detail={subjects.length > 0 ? `${subjects.length} active courses` : "Add your first subject"}
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
          value="0"
          detail="Complete topic outlines ready for notes and cards."
          icon={Layers}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Cards due"
          value="0"
          detail="Spread across your spaced-repetition decks."
          icon={CalendarDays}
          accent="bg-amber-50 text-amber-700"
        />
      </section>

      <SubjectsBrowser subjects={subjects} />
      {loading && (
        <p className="text-sm text-ink-muted">Loading your subjects…</p>
      )}
      <SubjectForm />
    </div>
  );
}
