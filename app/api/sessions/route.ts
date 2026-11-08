import { getDb } from "@/db";
import { studySessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireIntInRange, optionalUuid, optionalString, assertOwnedSubject, assertTopicVisible } from "@/lib/api-helpers";
export async function GET() {
  return withUser(async (userId) => {
    const rows = await getDb().select().from(studySessions).where(eq(studySessions.userId, userId));
    return json({ sessions: rows });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const subjectId = optionalUuid(body, "subjectId");
    const topicId = optionalUuid(body, "topicId");
    if (subjectId) await assertOwnedSubject(db, userId, subjectId);
    if (topicId) await assertTopicVisible(db, userId, topicId);
    const rows = await db.insert(studySessions).values({ userId, subjectId, topicId, minutes: requireIntInRange(body, "minutes", 1, 1440), focus: optionalString(body, "focus"), notes: optionalString(body, "notes") }).returning();
    return json({ session: rows[0] }, 201);
  });
}
