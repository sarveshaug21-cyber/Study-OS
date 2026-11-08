import { getDb } from "@/db";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireString, requireUuid } from "@/lib/api-helpers";
export async function GET(req: Request) { return withUser(async (userId) => { const q = new URL(req.url).searchParams.get("q")?.toLowerCase() ?? ""; let rows = await getDb().select().from(notes).where(eq(notes.userId, userId)); if (q) rows = rows.filter((r) => (r.title + " " + r.content).toLowerCase().includes(q)); return json({ notes: rows }); }); }
export async function POST(req: Request) { return withUser(async (userId) => { const body = await req.json().catch(()=>({})); const rows = await getDb().insert(notes).values({ userId, subjectId: requireUuid(body,"subjectId"), title: requireString(body,"title"), content: requireString(body,"content"), isPinned: body.isPinned === true, tags: Array.isArray(body.tags) ? body.tags.filter((t: unknown): t is string => typeof t === "string") : [] }).returning(); return json({ note: rows[0] }, 201); }); }
