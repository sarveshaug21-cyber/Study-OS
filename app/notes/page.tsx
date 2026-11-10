import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock3, NotebookPen, Pin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/ui";
import { NotesWorkspace } from "@/components/notes-workspace";
import { NoteEditor } from "@/components/note-editor";
import { notes } from "@/lib/demo-data";
import { NoteForm } from "@/components/data-panels";

export const metadata: Metadata = {
  title: "Notes",
  description: "Condensed, exam-ready revision notes across your subjects.",
};

const pinnedCount = notes.filter((note) => note.pinned).length;
const averageReading = Math.round(
  notes.reduce((total, note) => total + note.readingMinutes, 0) / notes.length,
);

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Revision library"
        title="Notes"
        description="Condensed topic notes with key terms and exam traps. Browse the demo library, then practise what you have just read."
        actions={
          <>
            <Link href="/ai-tutor" className="btn-secondary">
              <Sparkles aria-hidden="true" size={16} />
              Summarise with AI
            </Link>
            <Link href="/planner" className="btn-primary">
              <CalendarDays aria-hidden="true" size={16} />
              Schedule review
            </Link>
          </>
        }
      />

      <section aria-label="Note statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Notes"
          value={String(notes.length)}
          detail="Across eight subjects and six exam boards."
          icon={NotebookPen}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Pinned"
          value={String(pinnedCount)}
          detail="High-priority notes kept at the top of your library."
          icon={Pin}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Average read"
          value={`${averageReading} min`}
          detail="Short enough for a focused between-lesson review."
          icon={Clock3}
          accent="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          label="Last updated"
          value="2h ago"
          detail="Biology · Exchange surfaces & transport."
          icon={CalendarDays}
          accent="bg-emerald-50 text-emerald-700"
        />
      </section>

      <NotesWorkspace />
      <p className="text-xs text-ink-muted">Tip: use the NoteForm above to create notes; editing with autosave is available per note via the API.</p>
      <NoteForm />
    </div>
  );
}
