import { getDb } from "@/db";
import { progressRecords, studySessions, practiceAttempts, practiceQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
export async function GET() { return withUser(async (userId) => { const db = getDb(); const [records, sessions, attempts, questions] = await Promise.all([db.select().from(progressRecords).where(eq(progressRecords.userId,userId)), db.select().from(studySessions).where(eq(studySessions.userId,userId)), db.select().from(practiceAttempts).where(eq(practiceAttempts.userId,userId)), db.select().from(practiceQuestions).where(eq(practiceQuestions.userId,userId))]); return json({ records, sessions, attempts, questions }); }); }
export async function POST(req: Request) { return withUser(async (userId) => { const body = await req.json().catch(()=>({})); if (!body.subjectId) throw new Error("subjectId is required"); const rows = await getDb().insert(progressRecords).values({ userId, subjectId: body.subjectId, mastery: body.mastery ?? 0, confidence: body.confidence ?? 0, studyMinutes: body.studyMinutes ?? 0 }).returning(); return json({ record: rows[0] }, 201); }); }
