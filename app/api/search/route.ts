import { getDb } from "@/db";
import { subjects, notes, flashcards, practiceQuestions, pastPapers, topics } from "@/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { withUser, json } from "@/lib/api-helpers";
export async function GET(req: Request) {
  return withUser(async (userId) => {
    const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase().slice(0, 200) ?? "";
    if (!q) return json({ results: [] });
    const db = getDb();
    const [subs, ns, cards, qs, papers] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)),
      db.select().from(notes).where(eq(notes.userId, userId)),
      db.select().from(flashcards).where(eq(flashcards.userId, userId)),
      db.select().from(practiceQuestions).where(eq(practiceQuestions.userId, userId)),
      db.select().from(pastPapers),
    ]);
    // Topics: DB-scoped to own + official only (never other users' private topics).
    const tps = await db.select().from(topics).where(or(eq(topics.userId, userId), and(isNull(topics.userId), eq(topics.isOfficial, true))));
    const match = (s: string) => s.toLowerCase().includes(q);
    const results = [
      ...subs.filter((s) => match(s.name + " " + s.code)).map((s) => ({ type: "subject", id: s.id, title: s.name, href: `/subjects/${s.id}` })),
      ...ns.filter((n) => match(n.title + " " + n.content)).map((n) => ({ type: "note", id: n.id, title: n.title, href: "/notes" })),
      ...cards.filter((c) => match(c.front + " " + c.back)).map((c) => ({ type: "flashcard", id: c.id, title: c.front, href: "/flashcards" })),
      ...qs.filter((x) => match(x.question)).map((x) => ({ type: "practice", id: x.id, title: x.question, href: "/practice" })),
      ...papers.filter((p) => match(p.title + " " + p.paperCode)).map((p) => ({ type: "past-paper", id: p.id, title: `${p.paperCode} ${p.title}`, href: "/past-papers" })),
      ...tps.filter((t) => match(t.name)).map((t) => ({ type: "topic", id: t.id, title: t.name, href: "/subjects" })),
    ];
    return json({ results: results.slice(0, 50) });
  });
}
