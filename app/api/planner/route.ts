import { getDb } from "@/db";
import { plannerTasks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withUser, json, requireString, requireUuid, optionalUuid, optionalIntInRange, assertOwnedSubject } from "@/lib/api-helpers";
const STATUSES = ["todo", "in_progress", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;
export async function GET() {
  return withUser(async (userId) => {
    const rows = await getDb().select().from(plannerTasks).where(eq(plannerTasks.userId, userId));
    return json({ tasks: rows });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const subjectId = optionalUuid(body, "subjectId");
    if (subjectId) await assertOwnedSubject(db, userId, subjectId);
    const status = body.status === undefined ? "todo" : body.status;
    if (!(STATUSES as readonly string[]).includes(status)) throw Object.assign(new Error("Invalid status"), { status: 400 });
    const priority = body.priority === undefined ? "medium" : body.priority;
    if (!(PRIORITIES as readonly string[]).includes(priority)) throw Object.assign(new Error("Invalid priority"), { status: 400 });
    const scheduled = body.scheduledFor ? new Date(body.scheduledFor) : null;
    if (!scheduled || Number.isNaN(scheduled.getTime())) throw Object.assign(new Error("scheduledFor must be a valid date"), { status: 400 });
    const estimated = optionalIntInRange(body, "estimatedMinutes", 1, 10080) ?? 30;
    const rows = await db.insert(plannerTasks).values({ userId, subjectId, title: requireString(body, "title", 500), scheduledFor: scheduled, status, priority, estimatedMinutes: estimated }).returning();
    return json({ task: rows[0] }, 201);
  });
}
export async function PATCH(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const id = requireUuid(body, "id");
    const status = body.status;
    if (!(STATUSES as readonly string[]).includes(status)) throw Object.assign(new Error("Invalid status"), { status: 400 });
    const rows = await db.update(plannerTasks).set({ status, updatedAt: new Date() }).where(and(eq(plannerTasks.id, id), eq(plannerTasks.userId, userId))).returning();
    if (!rows.length) return json({ error: "Not found" }, 404);
    return json({ task: rows[0] });
  });
}
