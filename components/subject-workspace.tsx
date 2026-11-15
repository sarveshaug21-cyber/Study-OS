"use client";

import Link from "next/link";
import {
  BookOpen,
  CircleHelp,
  FileText,
  Layers,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { TopicTree } from "@/components/topic-tree";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type SubjectDetail = {
  id: string;
  name: string;
  code: string;
  board: string;
  level: string;
  accent: string;
  targetGrade: string | null;
  examDate: string | null;
};

export function SubjectWorkspace({ subjectId }: { subjectId: string }) {
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ subject: SubjectDetail }>(`/api/subjects/${subjectId}`)
      .then((d) => {
        if (!cancelled) setSubject(d.subject ?? null);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load subject");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error} — you may be in demo mode (Supabase not configured).
        </p>
      )}

      {subject && (
        <section className="card p-5" aria-label="Subject details">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: subject.accent }}
                aria-hidden="true"
              />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {subject.name}
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {subject.code} · {subject.board} · {subject.level}
                </p>
              </div>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-ink-muted">Target grade</dt>
                <dd className="font-semibold text-ink">
                  {subject.targetGrade || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-muted">Exam date</dt>
                <dd className="font-semibold text-ink">
                  {subject.examDate
                    ? new Date(subject.examDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not set"}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <TopicTree subjectId={subjectId} />

      <section className="card p-5" aria-labelledby="workspace-links-title">
        <h2 id="workspace-links-title" className="text-base font-semibold tracking-tight">
          In this workspace
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="btn-secondary" href="/notes">
            <NotebookPen aria-hidden="true" size={15} />
            Revision notes
          </Link>
          <Link className="btn-secondary" href="/flashcards">
            <Layers aria-hidden="true" size={15} />
            Flashcards
          </Link>
          <Link className="btn-secondary" href="/practice">
            <CircleHelp aria-hidden="true" size={15} />
            Practice
          </Link>
          <Link className="btn-secondary" href="/past-papers">
            <FileText aria-hidden="true" size={15} />
            Past papers
          </Link>
          <Link className="btn-secondary" href="/ai-tutor">
            <Sparkles aria-hidden="true" size={15} />
            Ask AI tutor
          </Link>
          <Link className="btn-secondary" href="/notes">
            <BookOpen aria-hidden="true" size={15} />
            Specification
          </Link>
        </div>
      </section>
    </div>
  );
}
