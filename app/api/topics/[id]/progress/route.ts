import { getDb } from "@/db";
import { topicProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
export async function PUT(_req: Request, ctx: { params: Promise<{ id: string }> }) { return withUser(async (userId) => { const { id } = await ctx.params; const db = getDb(); const existing = await db.select().from(topicProgress).where(and(eq(topicProgress.userId,userId),eq(topicProgress.topicId,id))); const next = !existing[0]?.completed; if (existing[0]) { const rows = await db.update(topicProgress).set({ completed: next, updatedAt: new Date() }).where(and(eq(topicProgress.userId,userId),eq(topicProgress.topicId,id))).returning(); return json({ completed: rows[0].completed }); } const rows = await db.insert(topicProgress).values({ userId, topicId: id, completed: next }).returning(); return json({ completed: rows[0].completed }); }); }
