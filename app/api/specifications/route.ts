import { getDb } from "@/db";
import {
  specifications,
  specificationVersions,
  learningObjectives,
  topics,
  topicProgress,
  subjects,
} from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
import {
  assessmentObjectivesFor,
  computeTopicCoverage,
  versionStatuses,
} from "@/lib/specifications";

export async function GET(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const params = new URL(req.url).searchParams;
    const boardFilter = params.get("board");
    const levelFilter = params.get("level");
    const subjectFilter = params.get("subject")?.trim().toLowerCase();

    const [specs, versions, objectives, userSubjects, userTopics] =
      await Promise.all([
        db.select().from(specifications),
        db.select().from(specificationVersions),
        db
          .select()
          .from(learningObjectives)
          .where(
            or(
              isNull(learningObjectives.userId),
              eq(learningObjectives.userId, userId),
            ),
          ),
        db.select().from(subjects).where(eq(subjects.userId, userId)),
        db
          .select()
          .from(topics)
          .where(
            or(eq(topics.userId, userId), and(isNull(topics.userId), eq(topics.isOfficial, true))),
          ),
      ]);

    const progressRows = await db
      .select()
      .from(topicProgress)
      .where(eq(topicProgress.userId, userId));
    const completedTopicIds = new Set(
      progressRows.filter((row) => row.completed).map((row) => row.topicId),
    );

    const topicsBySpec = new Map<string, typeof userTopics>();
    for (const topic of userTopics) {
      if (!topic.specificationId) continue;
      const list = topicsBySpec.get(topic.specificationId) ?? [];
      list.push(topic);
      topicsBySpec.set(topic.specificationId, list);
    }

    const enriched = specs.map((spec) => {
      const specVersions = versions.filter((v) => v.specificationId === spec.id);
      const specTopics = topicsBySpec.get(spec.id) ?? [];
      const coverage = computeTopicCoverage(
        specTopics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          chapter: topic.description,
          completed: completedTopicIds.has(topic.id),
        })),
      );
      const specObjectives = objectives
        .filter((objective) => objective.specificationId === spec.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const statuses = versionStatuses(specVersions);
      const latest = statuses
        .filter((entry) => entry.status === "current")
        .sort(
          (a, b) =>
            (b.firstAssessmentYear ?? 0) - (a.firstAssessmentYear ?? 0),
        )[0];

      return {
        ...spec,
        versions: statuses.map((entry) => ({
          version: entry.version.version,
          title: entry.version.title,
          officialUrl: entry.version.officialUrl,
          firstTeaching: entry.version.firstTeaching,
          firstAssessment: entry.version.firstAssessment,
          changeSummary: entry.version.changeSummary,
          status: entry.status,
          firstAssessmentYear: entry.firstAssessmentYear,
        })),
        latestVersion: latest
          ? {
              version: latest.version.version,
              publishedAt: latest.version.publishedAt ?? null,
            }
          : null,
        topicCount: specTopics.length,
        learningObjectives: specObjectives.map((objective) => ({
          id: objective.id,
          code: objective.code,
          statement: objective.statement,
          commandWord: objective.commandWord,
          assessmentObjective: objective.assessmentObjective,
          topicId: objective.topicId,
          isVerified: objective.isVerified,
        })),
        coverage,
        assessmentObjectives:
          spec.board ? assessmentObjectivesFor(spec.board) : [],
      };
    });

    const filteredSpecs = enriched.filter((spec) => {
      if (boardFilter && spec.board !== boardFilter) return false;
      if (levelFilter && spec.level !== levelFilter) return false;
      if (subjectFilter) {
        const haystack = `${spec.subjectName} ${spec.title} ${spec.subjectCode ?? ""}`.toLowerCase();
        if (!haystack.includes(subjectFilter)) return false;
      }
      return true;
    });

    // Map each of the student's subjects onto the matching specification.
    const subjectMappings = userSubjects.map((subject) => {
      const match = enriched.find(
        (spec) =>
          spec.subjectCode &&
          spec.subjectCode.toLowerCase() === subject.code.toLowerCase() &&
          spec.board === subject.board &&
          spec.level === subject.level,
      );
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        code: subject.code,
        board: subject.board,
        level: subject.level,
        examDate: subject.examDate,
        specificationId: match?.id ?? null,
        specificationTitle: match?.title ?? null,
        specificationVersion:
          match?.versions.find((version) => version.status === "current")
            ?.version ?? null,
        coverage: match?.coverage ?? { total: 0, covered: 0, percentage: 0, byChapter: [] },
        learningObjectiveCount: match?.learningObjectives.length ?? 0,
        verified: match?.verified ?? false,
      };
    });

    return json({ specifications: filteredSpecs, subjectMappings });
  });
}
