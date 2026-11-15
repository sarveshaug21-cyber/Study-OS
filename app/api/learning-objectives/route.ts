import { getDb } from "@/db";
import { learningObjectives, specifications } from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import {
  withUser,
  json,
  requireString,
  requireUuid,
  optionalString,
  optionalUuid,
} from "@/lib/api-helpers";

export async function GET(req: Request) {
  return withUser(async (userId) => {
    const specificationId = new URL(req.url).searchParams.get("specificationId");
    const rows = await getDb()
      .select()
      .from(learningObjectives)
      .where(
        and(
          or(
            isNull(learningObjectives.userId),
            eq(learningObjectives.userId, userId),
          ),
          specificationId
            ? eq(learningObjectives.specificationId, specificationId)
            : undefined,
        ),
      )
      .orderBy(learningObjectives.sortOrder);
    return json({ learningObjectives: rows });
  });
}

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const specificationId = requireUuid(body, "specificationId");

    const [spec] = await db
      .select({ id: specifications.id })
      .from(specifications)
      .where(eq(specifications.id, specificationId));
    if (!spec) {
      throw Object.assign(new Error("Specification not found"), { status: 404 });
    }

    const rows = await db
      .insert(learningObjectives)
      .values({
        userId,
        specificationId,
        topicId: optionalUuid(body, "topicId"),
        code: requireString(body, "code", 100),
        statement: requireString(body, "statement", 2000),
        commandWord: optionalString(body, "commandWord"),
        assessmentObjective: optionalString(body, "assessmentObjective"),
        // Student-entered objectives are never treated as verified.
        isVerified: false,
      })
      .returning();
    return json({ learningObjective: rows[0] }, 201);
  });
}
