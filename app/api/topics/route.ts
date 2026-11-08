import { getDb } from "@/db";
import { topics } from "@/db/schema";
import { withUser, json, requireString } from "@/lib/api-helpers";
export async function GET(req: Request) { return withUser(async (userId) => { const subjectId = new URL(req.url).searchParams.get("subjectId"); const rows = await getDb().select().from(topics); return json({ topics: rows.filter((t) => t.userId === userId || t.userId === null).filter((t) => !subjectId || t.subjectId === subjectId) }); }); }
export async function POST(req: Request) { return withUser(async (userId) => { const body = await req.json().catch(()=>({})); const rows = await getDb().insert(topics).values({ userId, subjectId: body.subjectId, specificationId: body.specificationId, name: requireString(body,"name"), description: body.description, isOfficial: false }).returning(); return json({ topic: rows[0] }, 201); }); }
