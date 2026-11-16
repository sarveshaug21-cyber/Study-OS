import { getDb } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq, desc, inArray } from "drizzle-orm";
import { withUser, json, requireString, requireEnum, optionalString } from "@/lib/api-helpers";

const TYPES = ["deadline", "streak", "achievement", "system", "reminder"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export async function GET(req: Request) {
  return withUser(async (userId) => {
    const params = new URL(req.url).searchParams;
    const unreadOnly = params.get("unread") === "1";
    const rawLimit = Number(params.get("limit") ?? "50");
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200) : 50;
    const db = getDb();
    const base = unreadOnly
      ? and(eq(notifications.userId, userId), eq(notifications.read, false))
      : eq(notifications.userId, userId);
    const rows = await db.select().from(notifications).where(base).orderBy(desc(notifications.createdAt)).limit(limit);
    const unreadRes = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return json({ notifications: rows, unreadCount: unreadRes.length });
  });
}

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const type = requireEnum(body.type, TYPES, "type");
    const title = requireString(body, "title", 200);
    const message = requireString(body, "message", 2000);
    const priority = body.priority === undefined ? "medium" : requireEnum(body.priority, PRIORITIES, "priority");
    const rows = await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      priority,
      read: false,
      metadata: optionalString(body, "metadata"),
    }).returning();
    return json({ notification: rows[0] }, 201);
  });
}

export async function PATCH(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
    if (ids.length) {
      await db.update(notifications).set({ read: true, readAt: new Date() }).where(and(eq(notifications.userId, userId), inArray(notifications.id, ids)));
      return json({ ok: true, updated: ids.length });
    }
    if (body.all === true) {
      const res = await db.update(notifications).set({ read: true, readAt: new Date() }).where(eq(notifications.userId, userId)).returning();
      return json({ ok: true, updated: res.length });
    }
    const id = requireString(body, "id");
    const rows = await db.update(notifications).set({ read: true, readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    if (!rows.length) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  });
}

export async function DELETE(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const deleteIds: string[] = Array.isArray(body.ids) ? body.ids : [];
    if (deleteIds.length) {
      await db.delete(notifications).where(and(eq(notifications.userId, userId), inArray(notifications.id, deleteIds)));
      return json({ ok: true, deleted: deleteIds.length });
    }
    if (body.all === true) {
      const res = await db.delete(notifications).where(eq(notifications.userId, userId)).returning();
      return json({ ok: true, deleted: res.length });
    }
    const id = requireString(body, "id");
    const rows = await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    if (!rows.length) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  });
}