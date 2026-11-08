import { getDb } from "@/db";
import { studySessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
export async function GET() { return withUser(async (userId) => { const rows = await getDb().select().from(studySessions).where(eq(studySessions.userId, userId)); return json({ sessions: rows }); }); }
export async function POST(req: Request) { return withUser(async (userId) => { const body = await req.json().catch(()=>({})); if (typeof body.minutes !== "number" || body.minutes <= 0) throw new Error("minutes must be a positive number"); const rows = await getDb().insert(studySessions).values({ userId, subjectId: body.subjectId, topicId: body.topicId, minutes: body.minutes, focus: body.focus, notes: body.notes }).returning(); return json({ session: rows[0] }, 201); }); }
