import { getDb } from "@/db";
import { topics, topicProgress, subjects } from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
import {
  buildPrerequisiteEdges,
  prioritiseTopics,
  recommendedOrder,
  type PrerequisiteNode,
} from "@/lib/prerequisites";

export async function GET(req: Request) {
  return withUser(async (userId) => {
    const subjectParam = new URL(req.url).searchParams.get("subjectId");
    const db = getDb();

    const visibleTopics = await db
      .select()
      .from(topics)
      .where(
        or(
          eq(topics.userId, userId),
          and(isNull(topics.userId), eq(topics.isOfficial, true)),
        ),
      );

    const scoped = subjectParam
      ? visibleTopics.filter((topic) => topic.subjectId === subjectParam)
      : visibleTopics;

    const progressRows = await db
      .select()
      .from(topicProgress)
      .where(eq(topicProgress.userId, userId));
    const completed = new Set(
      progressRows.filter((row) => row.completed).map((row) => row.topicId),
    );

    const nodes: PrerequisiteNode[] = scoped.map((topic) => ({
      id: topic.id,
      name: topic.name,
      completed: completed.has(topic.id),
      mastery: null,
    }));

    const edges = buildPrerequisiteEdges(nodes);
    const order = recommendedOrder(nodes, edges);
    const prioritised = prioritiseTopics(nodes, edges);

    const subjectNames = new Map(
      (
        await db
          .select({ id: subjects.id, name: subjects.name })
          .from(subjects)
          .where(eq(subjects.userId, userId))
      ).map((subject) => [subject.id, subject.name]),
    );

    return json({
      topics: nodes,
      edges: edges.map((edge) => ({
        ...edge,
        fromName: nodes.find((node) => node.id === edge.from)?.name ?? edge.from,
        toName: nodes.find((node) => node.id === edge.to)?.name ?? edge.to,
      })),
      recommendedOrder: order.map((node, index) => ({
        position: index + 1,
        id: node.id,
        name: node.name,
        completed: node.completed,
        subject: subjectNames.get(
          scoped.find((topic) => topic.id === node.id)?.subjectId ?? "",
        ) ?? null,
      })),
      priorities: prioritised.map((entry) => ({
        id: entry.topic.id,
        name: entry.topic.name,
        completed: entry.topic.completed,
        unlocks: entry.unlocks,
        blockedBy: entry.blockedBy,
      })),
    });
  });
}
