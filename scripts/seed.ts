// Seed script: populates demo data into a Supabase instance.
// Run: npx tsx scripts/seed.ts
import { readFileSync } from "node:fs";
import { getDb } from "@/db";
import { users, userSettings, subjects, notes, flashcardDecks, flashcards, practiceQuestions, pastPapers, plannerTasks, studySessions, progressRecords } from "@/db/schema";
import { demoUser, subjects as demoSubjects, notes as demoNotes, flashcardDecks as demoDecks, flashcards as demoCards, practiceQuestions as demoQuestions, pastPapers as demoPapers, plannerTasks as demoTasks, weeklyStudy } from "@/lib/demo-data";

// Minimal .env loader (no dotenv dependency): reads .env.local then .env into process.env
// without overwriting variables that are already set.
function loadEnv(file: string) {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnv(".env.local");
loadEnv(".env");

async function main() {
  const db = getDb();
  console.log("Seeding demo data…");

  // Upsert user
  const [user] = await db
    .insert(users)
    .values({
      id: "00000000-0000-0000-0000-000000000001",
      email: demoUser.email,
      displayName: demoUser.name,
      examBoard: "AQA",
      studyGoalMinutes: demoUser.studyGoalMinutes,
    })
    .onConflictDoUpdate({ target: users.email, set: { displayName: demoUser.name, studyGoalMinutes: demoUser.studyGoalMinutes } })
    .returning();
  await db.insert(userSettings).values({ userId: user.id, dailyGoalMinutes: demoUser.studyGoalMinutes }).onConflictDoNothing();

  // Subjects
  const subjectMap = new Map<string, string>();
  for (const s of demoSubjects) {
    const [row] = await db
      .insert(subjects)
      .values({
        id: s.id,
        userId: user.id,
        name: s.name,
        code: s.code,
        board: s.board,
        level: s.level,
        accent: s.accent,
        targetGrade: s.targetGrade,
        examDate: s.examDateIso ? new Date(s.examDateIso) : undefined,
      })
      .onConflictDoUpdate({ target: subjects.id, set: { name: s.name, board: s.board, level: s.level } })
      .returning();
    subjectMap.set(s.id, row.id);
  }

  // Notes
  for (const n of demoNotes) {
    await db.insert(notes).values({
      id: n.id,
      userId: user.id,
      subjectId: subjectMap.get(n.subjectId) ?? n.subjectId,
      title: n.title,
      content: n.sections.map((s) => `## ${s.heading}\n${s.body}${s.bullets ? "\n" + s.bullets.map((b) => `- ${b}`).join("\n") : ""}`).join("\n\n"),
      tags: n.tags,
      isPinned: n.pinned,
    }).onConflictDoNothing();
  }

  // Flashcard decks
  for (const d of demoDecks) {
    const [deck] = await db
      .insert(flashcardDecks)
      .values({ id: d.id, userId: user.id, subjectId: subjectMap.get(d.subjectId) ?? d.subjectId, title: d.title })
      .onConflictDoUpdate({ target: flashcardDecks.id, set: { title: d.title } })
      .returning();
    const cardsForDeck = demoCards.filter((c) => c.deckId === d.id);
    for (const c of cardsForDeck) {
      await db
        .insert(flashcards)
        .values({ id: c.id, deckId: deck.id, userId: user.id, front: c.front, back: c.back, hint: c.hint, mastery: 0, intervalDays: 1, easeFactor: "2.5" })
        .onConflictDoNothing();
    }
  }

  // Practice questions
  for (const q of demoQuestions) {
    await db
      .insert(practiceQuestions)
      .values({ id: q.id, userId: user.id, subjectId: subjectMap.get(q.subjectId) ?? q.subjectId, question: q.question, modelAnswer: q.modelAnswer, marks: q.marks, markScheme: q.markScheme.join("\n") })
      .onConflictDoNothing();
  }

  // Past papers
  for (const p of demoPapers) {
    await db
      .insert(pastPapers)
      .values({ id: p.id, subjectId: subjectMap.get(p.subjectId) ?? p.subjectId, board: p.board, level: p.level, year: p.year, session: p.session, paperCode: p.paperCode, title: p.title, durationMinutes: p.durationMinutes, marks: p.marks, hasMarkScheme: p.hasMarkScheme })
      .onConflictDoNothing();
  }

  // Planner tasks
  for (const t of demoTasks) {
    await db
      .insert(plannerTasks)
      .values({
        id: t.id,
        userId: user.id,
        subjectId: subjectMap.get(t.subject) ? undefined : undefined,
        title: t.title,
        scheduledFor: new Date(new Date().toISOString().slice(0, 10) + "T" + t.time + ":00"),
        estimatedMinutes: t.duration,
        status: t.completed ? "done" : "todo",
        priority: t.priority,
      })
      .onConflictDoNothing();
  }

  // Study sessions
  for (const w of weeklyStudy) {
    await db.insert(studySessions).values({ userId: user.id, minutes: w.minutes, focus: "Seed session", startedAt: new Date() });
  }

  // Progress records
  for (const s of demoSubjects) {
    await db.insert(progressRecords).values({
      userId: user.id,
      subjectId: subjectMap.get(s.id) ?? s.id,
      mastery: s.progress,
      confidence: s.predictedGrade ? 70 : 60,
      studyMinutes: 60,
    });
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});