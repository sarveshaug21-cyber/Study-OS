"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, List } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { api } from "@/lib/api";
import { countKeyTerms, readingMinutes } from "@/lib/note-content";
import { tableOfContents } from "@/lib/markdown";

type Note = {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export function NoteDetail({ id }: { id: string }) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ note: Note }>(`/api/notes/${id}`);
        if (!cancelled) setNote(data.note ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load note");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const contents = useMemo(
    () => (note?.content ? tableOfContents(note.content) : []),
    [note?.content],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Revision notes" title="Loading note…" />
        <section className="card p-5">
          <p className="text-sm text-ink-muted">Loading note…</p>
        </section>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Revision notes" title="Note not found" />
        <section className="card p-5">
          <p
            role="alert"
            className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error || "This note does not exist or you do not have access to it."}
          </p>
          <Link href="/notes" className="btn-secondary mt-3 inline-flex">
            Back to notes
          </Link>
        </section>
      </div>
    );
  }

  const updated = new Date(note.updatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const keyTerms = countKeyTerms(note.content);
  const description = [
    `${updated}`,
    `${readingMinutes(note.content)} min read`,
    keyTerms > 0 ? `${keyTerms} key terms` : null,
    note.tags.length > 0 ? note.tags.join(", ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Revision notes"
        title={note.title}
        description={description}
        actions={
          <Link href="/notes" className="btn-secondary">
            <ArrowRight size={14} aria-hidden="true" />
            Back to notes
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
        <article className="card overflow-hidden">
          <div className="p-5 sm:p-7">
            {note.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <MarkdownRenderer content={note.content} />
          </div>
        </article>

        {contents.length > 1 && (
          <nav className="card h-fit p-4" aria-label="On this page">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <List aria-hidden="true" size={13} />
              On this page
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {contents.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="block truncate text-sm text-ink-soft transition hover:text-brand-700"
                    style={{ paddingLeft: `${(entry.level - 2) * 0.75}rem` }}
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
