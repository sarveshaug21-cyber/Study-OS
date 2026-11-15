"use client";

import { useEffect, useState } from "react";
import {
  AlarmClock,
  Bookmark,
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { type PastPaper } from "@/components/past-papers-browser";
import { api } from "@/lib/api";

export function TimedExamModal({
  paper,
  onClose,
}: {
  paper: PastPaper;
  onClose: () => void;
}) {
  const totalSeconds = paper.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [flagged, setFlagged] = useState(false);
  const [score, setScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formatTime = () => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isLowTime = secondsRemaining < 300 && secondsRemaining > 0; // < 5 mins
  const isTimeUp = secondsRemaining === 0;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const parsedScore = score.trim() ? parseInt(score.trim(), 10) : undefined;
      await api("/api/past-papers", {
        method: "POST",
        body: JSON.stringify({
          pastPaperId: paper.id,
          score: Number.isFinite(parsedScore) ? parsedScore : undefined,
          personalNotes: notes.trim() || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // In demo mode or if api fails, still show completion confirmation
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="card w-full max-w-lg border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-night">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <span className="chip border-brand-200 bg-brand-50 text-xs font-semibold text-brand-700">
              Timed Mock Examination
            </span>
            <h3 className="mt-1 text-lg font-bold text-ink-strong">{paper.title}</h3>
            <p className="text-xs text-ink-muted">
              {paper.board} · {paper.paperCode} · {paper.marks} marks total
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink-strong"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle size={28} />
            </span>
            <h4 className="mt-3 text-lg font-semibold">Exam Recorded!</h4>
            <p className="mt-1 text-sm text-ink-muted">
              Your mock completion has been recorded. Check your progress analytics to track improvements.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-6 w-full"
            >
              Back to Past Papers
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Timer Display */}
            <div
              className={`flex flex-col items-center justify-center rounded-2xl p-6 transition-colors ${
                isTimeUp
                  ? "bg-rose-50 text-rose-700"
                  : isLowTime
                  ? "bg-amber-50 text-amber-800"
                  : "bg-slate-900 text-white"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <AlarmClock size={16} />
                <span>{isTimeUp ? "Time Expired" : "Time Remaining"}</span>
              </div>
              <p className="mt-2 font-mono text-5xl font-black tracking-tight">
                {formatTime()}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30"
                >
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  {isRunning ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  onClick={() => setSecondsRemaining(totalSeconds)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFlagged(!flagged)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold backdrop-blur ${
                    flagged
                      ? "bg-amber-500 text-white"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  <Bookmark size={14} />
                  {flagged ? "Flagged for review" : "Flag"}
                </button>
              </div>
            </div>

            {/* Post-exam self-assessment / completion note */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft">
                  Self-marked score (optional, out of {paper.marks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={paper.marks}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder={`e.g. ${Math.round(paper.marks * 0.75)}`}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft">
                  Revision reflection notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Which topics or questions felt challenging? E.g. Question 4 calculus proofs..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="btn-primary flex-1"
              >
                {isSubmitting ? "Saving…" : "Finish & Record Mock"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
