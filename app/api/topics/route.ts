import { getDb } from "@/db";
import { topics } from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { withUser, json, requireString, optionalUuid, optionalString, assertOwnedSubject, assertUuidParam } from "@/lib/api-helpers";
export async function GET(req: Request) {
  return withUser(async (userId) => {
    const subjectParam = new URL(req.url).searchParams.get("subjectId");
    const subjectId = subjectParam ? assertUuidParam(subjectParam, "subjectId") : undefined;
    const base = and(or(eq(topics.userId, userId), and(isNull(topics.userId), eq(topics.isOfficial, true))), subjectId ? eq(topics.subjectId, subjectId) : undefined);
    const rows = await getDb().select().from(topics).where(base);
    return json({ topics: rows });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const subjectId = optionalUuid(body, "subjectId");
    const specificationId = optionalUuid(body, "specificationId");
    if (subjectId) await assertOwnedSubject(db, userId, subjectId);
    const rows = await db.insert(topics).values({ userId, subjectId, specificationId, name: requireString(body, "name", 500), description: optionalString(body, "description"), isOfficial: false }).returning();
    return json({ topic: rows[0] }, 201);
  });
}
