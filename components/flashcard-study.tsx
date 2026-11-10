"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  Undo2,
} from "lucide-react";
import { flashcards as demoCards } from "@/lib/demo-data";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Card = { id: string; front: string; back: string; hint?: string };

const demoSessionCards: Card[] = demoCards
  .filter((card) => card.deckId === "deck-bio-exchange")
  .map((c) => ({ id: c.id, front: c.front, back: c.back, hint: c.hint }));

export function FlashcardStudy() {
  const [cards, setCards] = useState<Card[]>(demoSessionCards);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [againCount, setAgainCount] = useState(0);
  const [gotItCount, setGotItCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<{ flashcards: { id: string; front: string; back: string; hint?: string }[] }>("/api/flashcards?due=1")
      .then((d) => {
        if (cancelled) return;
        if (Array.isArray(d.flashcards) && d.flashcards.length) {
          setCards(d.flashcards.map((c) => ({ id: c.id, front: c.front, back: c.back, hint: c.hint })));
        }
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Using demo cards"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const card = cards[index];
  const complete = index >= cards.length;
  const progress = cards.length ? Math.round((index / cards.length) * 100) : 0;

  const advance = async (remembered: boolean) => {
    if (remembered) setGotItCount((c) => c + 1); else setAgainCount((c) => c + 1);
    setRevealed(false);
    setIndex((c) => c + 1);
    if (card) {
      try { await api("/api/flashcards", { method: "PUT", body: JSON.stringify({ cardId: card.id, correct: remembered }) }); } catch { /* demo mode: ignore */ }
    }
  };

  const restart = () => { setIndex(0); setRevealed(false); setAgainCount(0); setGotItCount(0); };

  if (loading) return <section className="card p-5 sm:p-6"><p className="text-sm text-ink-muted">Loading cards…</p></section>;
  if (!cards.length) return <section className="card p-5 sm:p-6"><p className="text-sm text-ink-muted">No cards due. {error ? `(${error})` : ""}</p></section>;

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="flashcard-session-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Study session</p>
          <h2 id="flashcard-session-title" className="mt-1 text-base font-semibold tracking-tight">Flashcard review</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{error ? "Demo cards (server unavailable)" : "Due cards from your account"}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{complete ? "Complete" : `${index + 1} / ${cards.length}`}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Flashcard session progress">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-300" style={{ width: `${complete ? 100 : progress}%` }} />
      </div>
      {complete ? (
        <div className="mt-4 flex min-h-[19rem] flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/60 p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white"><Check aria-hidden="true" size={22} /></span>
          <h3 className="mt-4 text-xl font-semibold tracking-tight">Session complete</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">You reviewed all {cards.length} cards. Ratings were persisted where the database is connected.</p>
          <div className="mt-4 flex gap-2 text-sm">
            <span className="chip border-emerald-200 bg-white text-emerald-700">{gotItCount} got it</span>
            <span className="chip border-amber-200 bg-white text-amber-700">{againCount} to revisit</span>
          </div>
          <button type="button" onClick={restart} className="btn-secondary mt-5"><RotateCcw aria-hidden="true" size={15} />Study again</button>
        </div>
      ) : (
        <>
          <div className="mt-4 flex min-h-[19rem] flex-col rounded-2xl bg-night p-6 text-white shadow-inner sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-brand-200"><Sparkles aria-hidden="true" size={11} />{revealed ? "Answer" : "Question"}</span>
              <span className="text-xs text-slate-400">Card {index + 1}</span>
            </div>
            <div className="flex flex-1 items-center py-6">
              <div aria-live="polite" className="w-full">
                <p className={cn("text-balance font-medium leading-relaxed", revealed ? "text-lg text-brand-100 sm:text-xl" : "text-xl sm:text-2xl")}>{revealed ? card.back : card.front}</p>
                {!revealed && card.hint && <p className="mt-4 text-sm text-slate-400">Hint: {card.hint}</p>}
              </div>
            </div>
          </div>
          <div className="mt-4">
            {revealed ? (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => advance(false)} className="btn border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"><Undo2 aria-hidden="true" size={16} />Again</button>
                <button type="button" onClick={() => advance(true)} className="btn bg-emerald-600 text-white hover:bg-emerald-700"><ThumbsUp aria-hidden="true" size={16} />Got it</button>
              </div>
            ) : (
              <button type="button" onClick={() => setRevealed(true)} className="btn-primary w-full"><Eye aria-hidden="true" size={16} />Show answer</button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
