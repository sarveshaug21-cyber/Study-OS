import { getDb } from "@/db";
import { pastPapers, pastPaperCompletions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, requireUuid, requireIntInRange, optionalString } from "@/lib/api-helpers";
export async function GET() {
  return withUser(async (userId) => {
    const db = getDb();
    const papers = await db.select().from(pastPapers); // public catalogue — no user data
    const completions = await db.select().from(pastPaperCompletions).where(eq(pastPaperCompletions.userId, userId));
    return json({ papers, completions });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const pastPaperId = requireUuid(body, "pastPaperId");
    const [paper] = await db.select({ id: pastPapers.id }).from(pastPapers).where(eq(pastPapers.id, pastPaperId));
    if (!paper) return json({ error: "Past paper not found" }, 404);
    const score = body.score === undefined ? undefined : requireIntOrThrow(body, "score");
    const personalNotes = optionalString(body, "personalNotes");
    if (personalNotes !== undefined && personalNotes.length > 5000) throw Object.assign(new Error("personalNotes is too long"), { status: 400 });
    const rows = await db.insert(pastPaperCompletions).values({ userId, pastPaperId, score, personalNotes }).returning();
    return json({ completion: rows[0] }, 201);
  });
}
function requireIntOrThrow(body: Record<string, unknown>, key: string): number { return requireIntInRange(body, key, 0, 100000); }
