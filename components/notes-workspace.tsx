"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Clock3,
  FileQuestion,
  Layers,
  Pin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { notes, subjects } from "@/lib/demo-data";
import { Badge, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

export function NotesWorkspace() {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? "");
  const readerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesQuery =
        !normalized ||
        note.title.toLowerCase().includes(normalized) ||
        note.excerpt.toLowerCase().includes(normalized) ||
        note.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
        note.subject.toLowerCase().includes(normalized);
      const matchesSubject =
        subjectFilter === "all" || note.subjectId === subjectFilter;

      return matchesQuery && matchesSubject;
    });
  }, [query, subjectFilter]);

  const selectedNote =
    filtered.find((note) => note.id === selectedId) ?? filtered[0];

  const hasFilters = query !== "" || subjectFilter !== "all";

  const selectNote = (id: string) => {
    setSelectedId(id);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      window.setTimeout(() => {
        readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-24">
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Note library</h2>
            <span className="text-xs text-ink-muted">{filtered.length} of {notes.length}</span>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="note-search" className="label">
                Search notes
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="note-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles, tags or keywords"
                  className="input pl-9 text-xs"
                />
              </div>
            </div>
            <div>
              <label htmlFor="note-subject" className="label">
                Subject
              </label>
              <select
                id="note-subject"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className="input text-xs"
              >
                <option value="all">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSubjectFilter("all");
                }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink-muted transition hover:bg-slate-100 hover:text-ink"
              >
                <X aria-hidden="true" size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filtered.map((note) => {
              const active = selectedNote?.id === note.id;

              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => selectNote(note.id)}
                    aria-pressed={active}
                    className={cn(
                      "w-full px-4 py-3.5 text-left transition",
                      active
                        ? "bg-brand-50/70"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: note.accent }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-ink">
                            {note.title}
                          </span>
                          {note.pinned && (
                            <Pin
                              aria-label="Pinned note"
                              size={11}
                              className="shrink-0 text-brand-600"
                            />
                          )}
                        </span>
                        <span className="mt-1 block truncate text-xs text-ink-muted">
                          {note.subject} · {note.board} {note.level}
                        </span>
                        <span className="mt-1.5 block text-[0.68rem] text-slate-500">
                          Updated {note.updated} · {note.readingMinutes} min read
                        </span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && (
            <div className="p-6 text-sm text-ink-muted">
              No notes match these filters.
            </div>
          )}
        </div>
      </div>

      <div ref={readerRef} className="scroll-mt-24">
        {selectedNote ? (
          <article className="card overflow-hidden">
            <div
              className="h-1.5"
              style={{ backgroundColor: selectedNote.accent }}
              aria-hidden="true"
            />
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  style={{
                    borderColor: `${selectedNote.accent}30`,
                    backgroundColor: `${selectedNote.accent}10`,
                    color: selectedNote.accent,
                  }}
                >
                  {selectedNote.subject}
                </Badge>
                <Badge className="border-slate-200 bg-slate-50 text-ink-soft">
                  {selectedNote.board} · {selectedNote.level}
                </Badge>
                {selectedNote.pinned && (
                  <Badge className="border-brand-100 bg-brand-50 text-brand-700">
                    <Pin aria-hidden="true" size={10} />
                    Pinned
                  </Badge>
                )}
              </div>

              <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {selectedNote.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
                {selectedNote.excerpt}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" size={13} />
                  Updated {selectedNote.updated}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookMarked aria-hidden="true" size={13} />
                  {selectedNote.readingMinutes} min read
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedNote.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-7 space-y-7">
                {selectedNote.sections.map((section) => (
                  <section key={section.heading}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">
                      {section.body}
                    </p>
                    {section.bullets && (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-2.5 text-sm leading-6 text-ink-soft"
                          >
                            <span
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                              aria-hidden="true"
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>

              <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <h3 className="text-sm font-semibold tracking-tight">
                  Key terms
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {selectedNote.keyTerms.map((term) => (
                    <div key={term.term} className="rounded-xl bg-white p-3 shadow-sm">
                      <dt className="text-sm font-semibold text-ink">{term.term}</dt>
                      <dd className="mt-1 text-xs leading-5 text-ink-muted">
                        {term.definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                <Link href="/practice" className="btn-primary">
                  <FileQuestion aria-hidden="true" size={15} />
                  Practise this topic
                </Link>
                <Link href="/flashcards" className="btn-secondary">
                  <Layers aria-hidden="true" size={15} />
                  Review flashcards
                </Link>
                <Link href="/ai-tutor" className="btn-ghost">
                  <Sparkles aria-hidden="true" size={15} />
                  Ask AI Tutor
                  <ArrowRight aria-hidden="true" size={13} />
                </Link>
              </div>
            </div>
          </article>
        ) : (
          <EmptyState
            icon={Search}
            title="No notes found"
            description="Try adjusting your search or subject filter to find another revision note."
          />
        )}
      </div>
    </div>
  );
}
