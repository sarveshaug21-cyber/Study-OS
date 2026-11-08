import { getDb } from "@/db";
import { pastPapers, pastPaperCompletions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireUuid } from "@/lib/api-helpers";
export async function GET() { return withUser(async (userId) => { const papers = await getDb().select().from(pastPapers); const completions = await getDb().select().from(pastPaperCompletions).where(eq(pastPaperCompletions.userId, userId)); return json({ papers, completions }); }); }
export async function POST(req: Request) { return withUser(async (userId) => { const body = await req.json().catch(()=>({})); const rows = await getDb().insert(pastPaperCompletions).values({ userId, pastPaperId: requireUuid(body,"pastPaperId"), score: body.score, personalNotes: body.personalNotes }).returning(); return json({ completion: rows[0] }, 201); }); }
