import { getDb } from "@/db";
import { notes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withUser, json, requireString } from "@/lib/api-helpers";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) { return withUser(async (userId) => { const { id } = await ctx.params; const body = await req.json().catch(()=>({})); const rows = await getDb().update(notes).set({ title: requireString(body,"title"), content: requireString(body,"content"), isPinned: body.isPinned, updatedAt: new Date() }).where(and(eq(notes.id,id),eq(notes.userId,userId))).returning(); if (!rows.length) return json({error:"Not found"},404); return json({ note: rows[0] }); }); }
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) { return withUser(async (userId) => { const { id } = await ctx.params; const rows = await getDb().delete(notes).where(and(eq(notes.id,id),eq(notes.userId,userId))).returning(); if (!rows.length) return json({error:"Not found"},404); return json({ok:true}); }); }
