import { getDb } from "@/db";
import { topics, topicHierarchy, topicProgress, subjects } from "@/db/schema";
import { eq, and, isNull, or, inArray } from "drizzle-orm";
import { withUser, json, requireUuid } from "@/lib/api-helpers";
import {
  buildTaxonomyTree,
  flattenTaxonomy,
  taxonomyPath,
  recommendedNextTopic,
} from "@/lib/taxonomy";

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

    const db = getDb();
    // Visibility rule: the student's own topics plus public official topics.
    // Official topics are excluded from the legacy edge table query, so the
    // hierarchy is derived from each topic's parent pointer first.
    const visible = await db
      .select()
      .from(topics)
      .where(
        and(
          or(eq(topics.userId, userId), and(isNull(topics.userId), eq(topics.isOfficial, true))),
          subjectId ? eq(topics.subjectId, subjectId) : undefined,
        ),
      );

    const visibleIds = visible.map((topic) => topic.id);

    // Only load hierarchy edges and progress for topics this user can see.
    // The previous query scanned every user's edges, which was both wasteful
    // and capable of overwriting visible parents with unrelated rows.
    const hierarchy = visibleIds.length
      ? await db
          .select()
          .from(topicHierarchy)
          .where(
            and(
              inArray(topicHierarchy.parentTopicId, visibleIds),
              inArray(topicHierarchy.childTopicId, visibleIds),
            ),
          )
      : [];
    const progressRows = visibleIds.length
      ? await db
          .select()
          .from(topicProgress)
          .where(and(eq(topicProgress.userId, userId), inArray(topicProgress.topicId, visibleIds)))
      : [];
    const completedById = new Map(progressRows.map((row) => [row.topicId, row.completed]));

    // Legacy parent/child edges take precedence over the direct parent column
    // so that previously imported data keeps working.
    const parentOf = new Map<string, string>();
    for (const link of hierarchy) {
      if (!parentOf.has(link.childTopicId)) parentOf.set(link.childTopicId, link.parentTopicId);
    }
    for (const topic of visible) {
      if (!parentOf.has(topic.id) && topic.parentTopicId) {
        parentOf.set(topic.id, topic.parentTopicId);
      }
    }

    const nodes = visible.map((topic) => ({
      id: topic.id,
      name: topic.name,
      level: topic.level,
      parentId: parentOf.get(topic.id) ?? null,
      sortOrder: topic.sortOrder,
      description: topic.description ?? undefined,
    }));

    const tree = buildTaxonomyTree(nodes);
    const flat = flattenTaxonomy(tree);

    const recommended = recommendedNextTopic(tree, completedById);

    return json({
      topics: flat.map((node) => ({
        ...node,
        completed: completedById.get(node.id) ?? false,
        path: taxonomyPath(tree, node.id),
        depth: tree.depthById[node.id] ?? 0,
      })),
      tree: {
        roots: tree.roots,
        childrenByParent: tree.childrenByParent,
        depthById: tree.depthById,
      },
      recommendedTopicId: recommended?.id ?? null,
    });
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
