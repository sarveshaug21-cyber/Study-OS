import "server-only";
import { NextResponse } from "next/server";
import { eq, and, or, isNull, inArray } from "drizzle-orm";
import { env } from "@/lib/env";
import { requireUserId } from "@/lib/auth";
import { ValidationError, isUuid } from "@/lib/validation";
import { subjects, flashcardDecks, practiceQuestions, topics, aiConversations } from "@/db/schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

export { isAdminEmail, parseAdminEmails, requireString, optionalString, requireUuid, optionalUuid, assertUuidParam, requireIntInRange, optionalIntInRange, optionalBoolean, requireBoolean, requireEmail, optionalUrl, requireEnum, isValidEmail, UUID_RE } from "@/lib/validation";

type Db = PostgresJsDatabase<typeof schema>;

export async function withUser(fn: (userId: string) => Promise<Response>) {
  if (!env.databaseConfigured() || !env.supabaseConfigured()) return NextResponse.json({ error: "Database not configured. Set DATABASE_URL and Supabase keys in .env.local." }, { status: 503 });
  try {
    const userId = await requireUserId();
    return await fn(userId);
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 });
    const status = (e as { status?: number }).status ?? 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status >= 400 && status < 500) return NextResponse.json({ error: e instanceof Error ? e.message : "Request error" }, { status });
    // Never leak raw DB/driver messages to clients.
    console.error("[api] internal error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export function json(data: unknown, status = 200) { return NextResponse.json(data, { status }); }
export function notFound(what = "Not found") { return NextResponse.json({ error: what }, { status: 404 }); }
export function forbidden() { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

// ── Ownership assertions ──
export async function assertOwnedSubject(db: Db, userId: string, subjectId: string | undefined | null): Promise<true> {
  if (subjectId === undefined || subjectId === null) return true;
  const [row] = await db.select({ id: subjects.id }).from(subjects).where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));
  if (!row) throw new ValidationError("subjectId does not belong to you");
  return true;
}
export async function assertOwnedDeck(db: Db, userId: string, deckId: string): Promise<true> {
  const [row] = await db.select({ id: flashcardDecks.id }).from(flashcardDecks).where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)));
  if (!row) throw new ValidationError("deckId does not belong to you");
  return true;
}
export async function assertOwnedQuestion(db: Db, userId: string, questionId: string): Promise<true> {
  const [row] = await db.select({ id: practiceQuestions.id }).from(practiceQuestions).where(and(eq(practiceQuestions.id, questionId), eq(practiceQuestions.userId, userId)));
  if (!row) throw new ValidationError("questionId does not belong to you");
  return true;
}
// Visible = owned by user, OR public official topic (user_id IS NULL AND is_official = true).
// Anonymous/shared topics (user_id IS NULL but is_official = false) are treated as private and hidden.
export async function assertTopicVisible(db: Db, userId: string, topicId: string): Promise<true> {
  const [row] = await db.select({ id: topics.id, userId: topics.userId, isOfficial: topics.isOfficial }).from(topics).where(eq(topics.id, topicId));
  if (!row) throw new ValidationError("topic not found");
  if (row.userId === null && row.isOfficial === true) return true;
  if (row.userId !== userId) throw new ValidationError("topic not found");
  return true;
}
export async function assertOwnedConversation(db: Db, userId: string, conversationId: string): Promise<true> {
  const [row] = await db.select({ id: aiConversations.id }).from(aiConversations).where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, userId)));
  if (!row) throw new ValidationError("conversation not found");
  return true;
}
export async function getOwnedSubject(db: Db, userId: string, subjectId: string) {
  const [row] = await db.select().from(subjects).where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));
  return row ?? null;
}
export { eq, and, or, isNull, inArray, isUuid };
