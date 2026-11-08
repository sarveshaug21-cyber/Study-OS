import { getDb } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireString, optionalString } from "@/lib/api-helpers";
const BOARDS = ["AQA","Pearson Edexcel","OCR","WJEC","Eduqas","CCEA"] as const;
const LEVELS = ["GCSE","International GCSE","A-level","International A-level"] as const;
export async function GET() { return withUser(async (userId) => { const rows = await getDb().select().from(subjects).where(eq(subjects.userId, userId)); return json({ subjects: rows }); }); }
export async function POST(req: Request) { return withUser(async (userId) => { const body = await req.json().catch(()=>({})); const name = requireString(body, "name"); const board = body.board; const level = body.level; if (!BOARDS.includes(board)) throw new Error("Invalid exam board"); if (!LEVELS.includes(level)) throw new Error("Invalid qualification"); const rows = await getDb().insert(subjects).values({ userId, name, code: requireString(body,"code"), board, level, targetGrade: optionalString(body,"targetGrade"), examDate: body.examDate ? new Date(body.examDate) : undefined }).returning(); return json({ subject: rows[0] }, 201); }); }
