import { getDb } from "@/db";
import { notes } from "@/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import { withUser, json, requireString, requireUuid, assertOwnedSubject } from "@/lib/api-helpers";
export async function GET(req: Request) {
  return withUser(async (userId) => {
    const q = new URL(req.url).searchParams.get("q")?.toLowerCase().slice(0, 200) ?? "";
    const db = getDb();
    const rows = q
      ? await db.select().from(notes).where(and(eq(notes.userId, userId), or(ilike(notes.title, `%${q}%`), ilike(notes.content, `%${q}%`))))
      : await db.select().from(notes).where(eq(notes.userId, userId));
    return json({ notes: rows });
  });
}
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const subjectId = requireUuid(body, "subjectId");
    await assertOwnedSubject(db, userId, subjectId);
    const tags = Array.isArray(body.tags) ? body.tags.filter((t: unknown): t is string => typeof t === "string" && t.length <= 100).slice(0, 20) : [];
    const rows = await db.insert(notes).values({ userId, subjectId, title: requireString(body, "title", 500), content: requireString(body, "content", 20000), isPinned: body.isPinned === true, tags }).returning();
    return json({ note: rows[0] }, 201);
  });
}
