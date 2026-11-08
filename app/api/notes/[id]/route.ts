import { getDb } from "@/db";
import { notes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withUser, json, requireString, assertUuidParam, optionalBoolean } from "@/lib/api-helpers";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withUser(async (userId) => {
    const { id } = await ctx.params;
    assertUuidParam(id);
    const body = await req.json().catch(() => ({}));
    const isPinned = optionalBoolean(body, "isPinned");
    const update: Partial<{ title: string; content: string; isPinned: boolean; updatedAt: Date }> = { updatedAt: new Date() };
    if (body.title !== undefined) update.title = requireString(body, "title", 500);
    if (body.content !== undefined) update.content = requireString(body, "content", 20000);
    if (isPinned !== undefined) update.isPinned = isPinned;
    const rows = await getDb().update(notes).set(update).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning();
    if (!rows.length) return json({ error: "Not found" }, 404);
    return json({ note: rows[0] });
  });
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withUser(async (userId) => {
    const { id } = await ctx.params;
    assertUuidParam(id);
    const rows = await getDb().delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning();
    if (!rows.length) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  });
}
