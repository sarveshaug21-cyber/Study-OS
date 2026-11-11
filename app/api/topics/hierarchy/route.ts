import { getDb } from "@/db";
import { topics, topicHierarchy, subjects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { withUser, json, requireUuid } from "@/lib/api-helpers";

export async function GET(req: Request) {
  return withUser(async (userId) => {
    const subjectParam = new URL(req.url).searchParams.get("subjectId");
    const subjectId = subjectParam ? requireUuid({ subjectId: subjectParam }, "subjectId") : undefined;

    if (subjectId) {
      const [existing] = await getDb().select().from(subjects).where(eq(subjects.id, subjectId));
      if (!existing || existing.userId !== userId) {
        return json({ error: "Subject not found or not owned" }, 404);
      }
    }

    const conditions = [
      eq(topics.userId, userId),
      eq(topics.isOfficial, false),
    ];
    if (subjectId) {
      conditions.push(eq(topics.subjectId, subjectId));
    }

    const allTopics = await getDb().select().from(topics).where(and(...conditions));
    const hierarchy = await getDb().select().from(topicHierarchy);

    const topicMap = new Map();
    for (const topic of allTopics) {
      topicMap.set(topic.id, { ...topic, children: [] as typeof allTopics });
    }

    for (const link of hierarchy) {
      const parent = topicMap.get(link.parentTopicId);
      const child = topicMap.get(link.childTopicId);
      if (parent && child) {
        parent.children.push(child);
      }
    }

    const childIds = new Set(hierarchy.map(h => h.childTopicId));
    const rootTopics = allTopics.filter(t => !childIds.has(t.id));

    return json({ topics: rootTopics.map(t => topicMap.get(t.id)) });
  });
}

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await req.json().catch(() => ({}));
    const parentTopicId = requireUuid(body, "parentTopicId");
    const childTopicId = requireUuid(body, "childTopicId");

    const db = getDb();

    const [parentTopic] = await db.select().from(topics).where(
      and(eq(topics.id, parentTopicId), eq(topics.userId, userId))
    );
    const [childTopic] = await db.select().from(topics).where(
      and(eq(topics.id, childTopicId), eq(topics.userId, userId))
    );

    if (!parentTopic) return json({ error: "Parent topic not found" }, 404);
    if (!childTopic) return json({ error: "Child topic not found" }, 404);

    if (parentTopic.subjectId !== childTopic.subjectId) {
      return json({ error: "Topics must belong to same subject" }, 400);
    }

    if (parentTopicId === childTopicId) {
      return json({ error: "Topic cannot be parent of itself" }, 400);
    }

    const [existing] = await db.select().from(topicHierarchy).where(
      and(eq(topicHierarchy.parentTopicId, parentTopicId), eq(topicHierarchy.childTopicId, childTopicId))
    );
    if (existing) return json({ error: "Hierarchy relationship already exists" }, 409);

    const [row] = await db.insert(topicHierarchy).values({
      parentTopicId,
      childTopicId,
    }).returning();

    return json({ hierarchy: row }, 201);
  });
}
