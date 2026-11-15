// Spaced repetition scheduling based on SM-2 (SuperMemo-2) algorithm.
// Computes interval, repetitions, and updated ease factor for flashcards.

export type SrsRating = "again" | "hard" | "good" | "easy";

export interface SrsItem {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
}

export interface SrsResult {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: Date;
}

/**
 * Standard quality grades corresponding to ratings:
 * - again: 0 (complete blackout / reset)
 * - hard: 2 (incorrect response / hard struggle)
 * - good: 4 (correct response after hesitation)
 * - easy: 5 (perfect response)
 */
export function ratingToQuality(rating: SrsRating): number {
  switch (rating) {
    case "again":
      return 0;
    case "hard":
      return 2;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}

/**
 * Calculate the next review schedule using the SM-2 algorithm.
 *
 * @param current Current item stats (repetitions, intervalDays, easeFactor)
 * @param rating User assessment ('again', 'hard', 'good', 'easy')
 * @param now Reference timestamp (defaults to Date.now())
 */
export function calculateNextReview(
  current: SrsItem,
  rating: SrsRating,
  now: Date = new Date(),
): SrsResult {
  const quality = ratingToQuality(rating);
  let { repetitions, intervalDays, easeFactor } = current;

  // Ease factor is updated based on quality grade
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, Number(newEase.toFixed(2)));

  if (quality < 3) {
    // If forgotten / hard failure, restart repetition counter
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Correct recall
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = rating === "easy" ? 4 : 2;
    } else {
      const bonus = rating === "easy" ? 1.3 : 1.0;
      intervalDays = Math.round(intervalDays * easeFactor * bonus);
    }
    repetitions += 1;
  }

  // Cap interval to 365 days max
  intervalDays = Math.min(365, Math.max(1, intervalDays));

  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    repetitions,
    intervalDays,
    easeFactor,
    dueAt,
  };
}
