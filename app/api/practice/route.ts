import { getDb } from "@/db";
import { practiceQuestions, practiceAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireString, requireUuid, requireIntInRange, optionalIntInRange, optionalString, assertOwnedSubject, assertOwnedQuestion } from "@/lib/api-helpers";
export async function GET() {
  return withUser(async (userId) => {
    const db = getDb();
    const questions = await db.select().from(practiceQuestions).where(eq(practiceQuestions.userId, userId));
    const attempts = await db.select().from(practiceAttempts).where(eq(practiceAttempts.userId, userId));
    return json({ practiceQuestions: questions, attempts });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    if (body.attempt) {
      const attempt = body.attempt as Record<string, unknown>;
      const questionId = requireUuid(attempt, "questionId");
      await assertOwnedQuestion(db, userId, questionId);
      const score = optionalIntInRange(attempt, "score", 0, 100000);
      const marksAvailable = requireIntInRange(attempt, "marksAvailable", 1, 100000);
      const rows = await db.insert(practiceAttempts).values({ userId, questionId, answer: optionalString(attempt, "answer"), score, marksAvailable }).returning();
      return json({ attempt: rows[0] }, 201);
    }
    const subjectId = requireUuid(body, "subjectId");
    await assertOwnedSubject(db, userId, subjectId);
    const rows = await db.insert(practiceQuestions).values({ userId, subjectId, question: requireString(body, "question", 5000), modelAnswer: requireString(body, "modelAnswer", 20000), marks: requireIntInRange(body, "marks", 1, 100000), markScheme: body.markScheme }).returning();
    return json({ question: rows[0] }, 201);
  });
}
