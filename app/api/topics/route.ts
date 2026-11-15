import { getDb } from "@/db";
import { topics } from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { withUser, json, requireString, optionalUuid, optionalString, assertOwnedSubject, assertUuidParam, requireEnum } from "@/lib/api-helpers";
import { TAXONOMY_LEVELS, type TaxonomyLevel } from "@/lib/taxonomy";

export async function GET(req: Request) {
  return withUser(async (userId) => {
    const params = new URL(req.url).searchParams;
    const subjectParam = params.get("subjectId");
    const subjectId = subjectParam ? assertUuidParam(subjectParam, "subjectId") : undefined;
    const levelParam = params.get("level");
    const level = levelParam
      ? requireEnum<TaxonomyLevel>(levelParam, TAXONOMY_LEVELS, "level")
      : undefined;
    const parentParam = params.get("parentTopicId");
    const parentTopicId = parentParam
      ? assertUuidParam(parentParam, "parentTopicId")
      : undefined;

    const base = and(
      or(
        eq(topics.userId, userId),
        and(isNull(topics.userId), eq(topics.isOfficial, true)),
      ),
      subjectId ? eq(topics.subjectId, subjectId) : undefined,
      level ? eq(topics.level, level) : undefined,
      parentTopicId ? eq(topics.parentTopicId, parentTopicId) : undefined,
    );
    const rows = await getDb()
      .select()
      .from(topics)
      .where(base)
      .orderBy(topics.sortOrder, topics.name);
    return json({ topics: rows });
  });
}

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const subjectId = optionalUuid(body, "subjectId");
    const specificationId = optionalUuid(body, "specificationId");
    const parentTopicId = optionalUuid(body, "parentTopicId");
    const level = body.level
      ? requireEnum<TaxonomyLevel>(body.level, TAXONOMY_LEVELS, "level")
      : "topic";
    if (subjectId) await assertOwnedSubject(db, userId, subjectId);
    if (parentTopicId) {
      const [parent] = await db
        .select({ id: topics.id, subjectId: topics.subjectId })
        .from(topics)
        .where(eq(topics.id, parentTopicId));
      if (!parent) throw Object.assign(new Error("parentTopicId not found"), { status: 404 });
      if (subjectId && parent.subjectId !== subjectId) {
        throw Object.assign(new Error("parentTopicId belongs to a different subject"), { status: 400 });
      }
    }
    const rows = await db
      .insert(topics)
      .values({
        userId,
        subjectId,
        specificationId,
        parentTopicId,
        level,
        name: requireString(body, "name", 500),
        description: optionalString(body, "description"),
        isOfficial: false,
      })
      .returning();
    return json({ topic: rows[0] }, 201);
  });
}
