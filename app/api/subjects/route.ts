import { getDb } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireString, optionalString } from "@/lib/api-helpers";
import { validateBoardQualification } from "@/lib/qualifications";

export async function GET() {
  return withUser(async (userId) => {
    const rows = await getDb()
      .select()
      .from(subjects)
      .where(eq(subjects.userId, userId));
    return json({ subjects: rows.map(enrichSubject) });
  });
}

// SubjectsBrowser expects the full display shape. Derive the fields the DB
// doesn't carry with safe defaults until real analytics land.
function enrichSubject(row: typeof subjects.$inferSelect) {
  return {
    ...row,
    progress: null,
    topicsComplete: null,
    topicsTotal: null,
    cardsDue: null,
    notesCount: null,
    nextTopic: null,
    nextSession: null,
    teacher: null,
  };
}

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await req.json().catch(() => ({}));
    const name = requireString(body, "name");
    const board = body.board;
    const level = body.level;

    // A board can only award the qualifications it actually awards.
    const boardProblem = validateBoardQualification(board, level);
    if (boardProblem) throw Object.assign(new Error(boardProblem), { status: 400 });

    const rawAccent = typeof body.accent === "string" ? body.accent : undefined;
    const accent = rawAccent && /^#[0-9a-fA-F]{6}$/.test(rawAccent) ? rawAccent : "#7A55F2";
    const rows = await getDb()
      .insert(subjects)
      .values({
        userId,
        name,
        code: requireString(body, "code"),
        board,
        level,
        accent,
        targetGrade: optionalString(body, "targetGrade"),
        examDate: body.examDate ? new Date(body.examDate) : undefined,
      })
      .returning();
    return json({ subject: rows[0] }, 201);
  });
}
