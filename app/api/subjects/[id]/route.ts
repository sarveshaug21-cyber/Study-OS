import { getDb } from "@/db";
import { subjects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withUser, json, requireString } from "@/lib/api-helpers";
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) { return withUser(async (userId) => { const { id } = await ctx.params; const rows = await getDb().delete(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, userId))).returning(); if (!rows.length) return json({ error: "Not found" }, 404); return json({ ok: true }); }); }
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) { return withUser(async (userId) => { const { id } = await ctx.params; const body = await req.json().catch(()=>({})); const rows = await getDb().update(subjects).set({ name: requireString(body,"name"), updatedAt: new Date() }).where(and(eq(subjects.id, id), eq(subjects.userId, userId))).returning(); if (!rows.length) return json({ error: "Not found" }, 404); return json({ subject: rows[0] }); }); }
