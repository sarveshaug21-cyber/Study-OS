import { getDb } from "@/db";
import { aiConversations, aiMessages } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { withUser, json, requireString, optionalUuid, assertOwnedConversation, assertOwnedSubject } from "@/lib/api-helpers";
import { generateAiReply } from "@/lib/ai/provider";
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
    const context = typeof body.context === "string" && body.context.length <= 4000 ? `Context: ${body.context}\n\n` : "";
    const reply = await generateAiReply([...history.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: context + prompt }]);
    await db.insert(aiMessages).values({ conversationId: convId, role: "assistant", content: reply.content });
    return json({ conversationId: convId, reply: reply.content, provider: reply.provider, model: reply.model, generated: true });
  });
}
