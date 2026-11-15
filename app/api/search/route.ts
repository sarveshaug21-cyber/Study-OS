import { getDb } from "@/db";
import { subjects, notes, flashcards, practiceQuestions, pastPapers, topics } from "@/db/schema";
import { and, eq, ilike, isNull, or } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
export async function GET(req: Request) {
  return withUser(async (userId) => {
    const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase().slice(0, 200) ?? "";
    if (!q) return json({ results: [] });
    const db = getDb();
    const like = `%${q}%`;
    const [subs, ns, cards, qs, papers, tps] = await Promise.all([
      db.select().from(subjects).where(and(eq(subjects.userId, userId), or(ilike(subjects.name, like), ilike(subjects.code, like)))),
      db.select().from(notes).where(and(eq(notes.userId, userId), or(ilike(notes.title, like), ilike(notes.content, like)))),
      db.select().from(flashcards).where(and(eq(flashcards.userId, userId), ilike(flashcards.front, like))),
      db.select().from(practiceQuestions).where(and(eq(practiceQuestions.userId, userId), ilike(practiceQuestions.question, like))),
      db.select().from(pastPapers).where(or(ilike(pastPapers.title, like), ilike(pastPapers.paperCode, like))),
      db.select().from(topics).where(and(or(eq(topics.userId, userId), and(isNull(topics.userId), eq(topics.isOfficial, true))), ilike(topics.name, like))),
    ]);
    const results = [
      ...subs.map((s) => ({ type: "subject", id: s.id, title: s.name, href: `/subjects/${s.id}` })),
      ...ns.map((n) => ({ type: "note", id: n.id, title: n.title, href: "/notes" })),
      ...cards.map((c) => ({ type: "flashcard", id: c.id, title: c.front, href: "/flashcards" })),
      ...qs.map((x) => ({ type: "practice", id: x.id, title: x.question, href: "/practice" })),
      ...papers.map((p) => ({ type: "past-paper", id: p.id, title: `${p.paperCode} ${p.title}`, href: "/past-papers" })),
      ...tps.map((t) => ({ type: "topic", id: t.id, title: t.name, href: "/subjects" })),
    ];
    return json({ results: results.slice(0, 50) });
  });
}
