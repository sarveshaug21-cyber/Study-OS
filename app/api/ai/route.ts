import { getDb } from "@/db";
import { aiConversations, aiMessages, subjects } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { withUser, json, requireString, optionalUuid, assertOwnedConversation, assertOwnedSubject } from "@/lib/api-helpers";
import { generateAiReply } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { getStudentProfile } from "@/lib/profile";

export async function GET() {
  return withUser(async (userId) => {
    const db = getDb();
    const conversations = await db.select().from(aiConversations).where(eq(aiConversations.userId, userId));
    const convIds = conversations.map((c) => c.id);
    const messages = convIds.length ? await db.select().from(aiMessages).where(inArray(aiMessages.conversationId, convIds)) : [];
    return json({ conversations, messages });
  });
}

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await req.json().catch(() => ({}));
    const prompt = requireString(body, "prompt", 8000);
    const db = getDb();
    const profile = await getStudentProfile();
    if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });
    if (!profile.yearGroup) throw Object.assign(new Error("Please select your year group in Settings before using the AI tutor."), { status: 400 });
    let convId = optionalUuid(body, "conversationId");
    const subjectId = optionalUuid(body, "subjectId");
    if (subjectId) await assertOwnedSubject(db, userId, subjectId);
    if (convId) await assertOwnedConversation(db, userId, convId);
    if (!convId) {
      const rows = await db.insert(aiConversations).values({ userId, subjectId, title: prompt.slice(0, 80) }).returning();
      convId = rows[0].id;
    }
    await db.insert(aiMessages).values({ conversationId: convId, role: "user", content: prompt });
    const history = await db.select().from(aiMessages).where(eq(aiMessages.conversationId, convId));

    // Resolve subject context
    let subjectName: string | null = null;
    let subjectBoard: string | null = profile.examBoard;
    let subjectQual: string | null = profile.qualification;
    if (subjectId) {
      const [s] = await db.select().from(subjects).where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));
      if (s) { subjectName = s.name; subjectBoard = s.board; subjectQual = s.level; }
    }
    const systemPrompt = buildSystemPrompt({
      yearGroup: profile.yearGroup,
      examBoard: subjectBoard ?? profile.examBoard,
      qualification: subjectQual ?? profile.qualification,
      subject: subjectName,
      topic: typeof body.topic === "string" ? body.topic.slice(0, 200) : null,
      studentContext: typeof body.context === "string" && body.context.length <= 4000 ? body.context : null,
    });

    const reply = await generateAiReply(
      history.map((m) => ({ role: m.role, content: m.content })),
      systemPrompt,
    );
    await db.insert(aiMessages).values({ conversationId: convId, role: "assistant", content: reply.content });
    return json({ conversationId: convId, reply: reply.content, provider: reply.provider, model: reply.model, generated: true, yearGroup: profile.yearGroup });
  });
}
