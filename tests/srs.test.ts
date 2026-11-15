import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateNextReview, ratingToQuality, type SrsItem } from "../lib/srs";

describe("SM-2 Spaced Repetition", () => {
  it("converts ratings to SM-2 quality grades", () => {
    assert.equal(ratingToQuality("again"), 0);
    assert.equal(ratingToQuality("hard"), 2);
    assert.equal(ratingToQuality("good"), 4);
    assert.equal(ratingToQuality("easy"), 5);
  });

  it("resets repetition and sets 1-day interval on 'again'", () => {
    const item: SrsItem = { repetitions: 3, intervalDays: 10, easeFactor: 2.5 };
    const now = new Date("2026-11-15T12:00:00Z");
    const result = calculateNextReview(item, "again", now);

    assert.equal(result.repetitions, 0);
    assert.equal(result.intervalDays, 1);
    assert.ok(result.easeFactor < 2.5);
    assert.ok(result.easeFactor >= 1.3);
    assert.equal(result.dueAt.toISOString(), "2026-11-16T12:00:00.000Z");
  });

  it("increments repetitions and calculates interval on 'good'", () => {
    const initial: SrsItem = { repetitions: 0, intervalDays: 1, easeFactor: 2.5 };
    const now = new Date("2026-11-15T12:00:00Z");
    const rep1 = calculateNextReview(initial, "good", now);

    assert.equal(rep1.repetitions, 1);
    assert.equal(rep1.intervalDays, 1);

    const rep2 = calculateNextReview(rep1, "good", now);
    assert.equal(rep2.repetitions, 2);
    assert.equal(rep2.intervalDays, 2);

    const rep3 = calculateNextReview(rep2, "good", now);
    assert.equal(rep3.repetitions, 3);
    assert.ok(rep3.intervalDays >= 4);
  });

  it("rewards 'easy' with higher ease factor and bonus multiplier", () => {
    const item: SrsItem = { repetitions: 2, intervalDays: 4, easeFactor: 2.5 };
    const now = new Date("2026-11-15T12:00:00Z");
    const result = calculateNextReview(item, "easy", now);

    assert.equal(result.repetitions, 3);
    assert.ok(result.easeFactor >= 2.6);
    assert.ok(result.intervalDays > item.intervalDays);
  });

  it("never lets ease factor drop below 1.3", () => {
    let item: SrsItem = { repetitions: 0, intervalDays: 1, easeFactor: 1.3 };
    for (let i = 0; i < 5; i++) {
      item = calculateNextReview(item, "again");
    }
    assert.equal(item.easeFactor, 1.3);
  });
});
