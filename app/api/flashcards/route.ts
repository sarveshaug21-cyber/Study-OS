import { getDb } from "@/db";
import { flashcards, flashcardDecks, flashcardReviews } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withUser, json, requireString, requireUuid, optionalString, assertOwnedDeck, assertOwnedSubject } from "@/lib/api-helpers";
export async function GET(req: Request) {
  return withUser(async (userId) => {
    const due = new URL(req.url).searchParams.get("due") === "1";
    const all = await getDb().select().from(flashcards).where(eq(flashcards.userId, userId));
    return json({ flashcards: due ? all.filter((r) => r.dueAt <= new Date()) : all });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const deckId = requireUuid(body, "deckId");
    await assertOwnedDeck(db, userId, deckId);
    const rows = await db.insert(flashcards).values({ userId, deckId, front: requireString(body, "front", 2000), back: requireString(body, "back", 5000), hint: optionalString(body, "hint") }).returning();
    return json({ flashcard: rows[0] }, 201);
  });
}
export async function PUT(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const cardId = requireUuid(body, "cardId");
    const correct = body.correct === true;
    const existing = await db.select().from(flashcards).where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)));
    if (!existing.length) return json({ error: "Not found" }, 404);
    const intervalDays = correct ? Math.min(30, Math.max(1, (existing[0].mastery ?? 0) + 1)) : 1;
    const due = new Date(Date.now() + intervalDays * 86400000);
    await db.update(flashcards).set({ mastery: correct ? (existing[0].mastery ?? 0) + 1 : Math.max(0, (existing[0].mastery ?? 0) - 1), dueAt: due, lastReviewedAt: new Date(), updatedAt: new Date() }).where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)));
    await db.insert(flashcardReviews).values({ userId, flashcardId: cardId, correct, intervalDays });
    return json({ ok: true, intervalDays });
  });
}
export async function PATCH(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const subjectId = requireUuid(body, "subjectId");
    await assertOwnedSubject(db, userId, subjectId);
    const rows = await db.insert(flashcardDecks).values({ userId, subjectId, title: requireString(body, "title", 500), description: optionalString(body, "description") }).returning();
    return json({ deck: rows[0] }, 201);
  });
}
