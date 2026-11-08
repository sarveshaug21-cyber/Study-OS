import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock3, Flame, Layers, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard, ProgressBar, Badge } from "@/components/ui";
import { FlashcardStudy } from "@/components/flashcard-study";
import { flashcardDecks } from "@/lib/demo-data";
import { DeckForm, CardForm } from "@/components/data-panels";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Spaced-repetition decks for GCSE and A-level revision.",
};

const totalCards = flashcardDecks.reduce((total, deck) => total + deck.cards, 0);
const dueCards = flashcardDecks.reduce((total, deck) => total + deck.due, 0);
const averageMastery = Math.round(
  flashcardDecks.reduce((total, deck) => total + deck.mastered, 0) /
    flashcardDecks.length,
);

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spaced repetition"
        title="Flashcards"
        description="Short, active-recall sessions scheduled at the right interval. Review the sample deck below or browse your full library."
        actions={
          <>
            <Link href="/planner" className="btn-secondary">
              <CalendarDays aria-hidden="true" size={16} />
              Plan review
            </Link>
            <Link href="#study-session" className="btn-primary">
              <Layers aria-hidden="true" size={16} />
              Start session
            </Link>
          </>
        }
      />

      <section aria-label="Flashcard statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cards due"
          value={String(dueCards)}
          detail="About 24 minutes of active recall."
          icon={Flame}
          accent="bg-orange-50 text-orange-600"
        />
        <StatCard
          label="Total cards"
          value={String(totalCards)}
          detail={`Across ${flashcardDecks.length} demo decks.`}
          icon={Layers}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Average mastery"
          value={`${averageMastery}%`}
          detail="Up 6 points over the last 30 days."
          icon={Target}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Review goal"
          value="24 min"
          detail="Two short sessions scheduled for today."
          icon={Clock3}
          accent="bg-cyan-50 text-cyan-700"
        />
      </section>

      <div id="study-session" className="grid scroll-mt-24 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <FlashcardStudy />

        <section className="card p-5 sm:p-6" aria-labelledby="session-focus-title">
          <h2 id="session-focus-title" className="text-base font-semibold tracking-tight">
            Session focus
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Decks with cards due today
          </p>

          <ul className="mt-4 space-y-3">
            {flashcardDecks
              .filter((deck) => deck.due > 0)
              .slice(0, 5)
              .map((deck) => (
                <li key={deck.id}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: deck.accent }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium">{deck.title}</span>
                    </span>
                    <Badge className="shrink-0 border-slate-200 bg-slate-50 text-ink-soft">
                      {deck.due} due
                    </Badge>
                  </div>
                  <ProgressBar
                    value={deck.mastered}
                    accent={deck.accent}
                    label={`${deck.title} mastery`}
                    className="mt-2"
                  />
                </li>
              ))}
          </ul>

          <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
              Why this works
            </p>
            <p className="mt-1.5 text-sm leading-6 text-ink-soft">
              Cards you find difficult return sooner. Cards you know confidently
              move further out, keeping each review just challenging enough.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.68rem]">
              {["Again · 10m", "Good · 2d", "Easy · 7d"].map((stage) => (
                <span
                  key={stage}
                  className="rounded-lg border border-brand-100 bg-white px-1.5 py-2 font-medium text-brand-800"
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-ink-muted">Estimated time</span>
            <span className="font-semibold">24 min</span>
          </div>
        </section>
      </div>

      <section aria-labelledby="decks-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="decks-title" className="text-base font-semibold tracking-tight">
              Your decks
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Mastery and review timing for each deck.
            </p>
          </div>
          <Link href="/settings" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            Deck settings
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flashcardDecks.map((deck) => (
            <article key={deck.id} className="card-interactive flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold"
                  style={{
                    backgroundColor: `${deck.accent}14`,
                    color: deck.accent,
                  }}
                  aria-hidden="true"
                >
                  {deck.due}
                </div>
                <Badge className="border-slate-200 bg-slate-50 text-ink-soft">
                  {deck.board} · {deck.level}
                </Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-tight">
                {deck.title}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                {deck.subject} · {deck.cards} cards
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-muted">Mastered</span>
                  <span className="font-semibold">{deck.mastered}%</span>
                </div>
                <ProgressBar
                  value={deck.mastered}
                  accent={deck.accent}
                  label={`${deck.title} mastery`}
                  className="mt-2"
                />
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-ink-muted">Last studied {deck.lastStudied.toLowerCase()}</span>
                <span className="font-semibold text-brand-700">{deck.due} due</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <DeckForm />
      <CardForm />
    </div>
  );
}
