import { getDb } from "@/db";
import { userSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withUser, json, optionalIntInRange, optionalString } from "@/lib/api-helpers";
const VALID_THEMES = ["light", "dark", "system"] as const;
export async function GET() {
  return withUser(async (userId) => {
    const db = getDb();
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    const [profile] = await db.select().from(users).where(eq(users.id, userId));
    return json({ settings: settings ?? null, profile: profile ?? null });
  });
}
export async function PUT(req: Request) {
  return withUser(async (userId) => {
    const db = getDb();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.theme !== undefined) {
      if (!(VALID_THEMES as readonly string[]).includes(body.theme as string)) throw Object.assign(new Error("Invalid theme"), { status: 400 });
      patch.theme = body.theme;
    }
    if (body.dailyGoalMinutes !== undefined) patch.dailyGoalMinutes = optionalIntInRange(body, "dailyGoalMinutes", 1, 1440);
    if (body.weekStartDay !== undefined) patch.weekStartDay = optionalString(body, "weekStartDay");
    if (body.targetGrade !== undefined) patch.targetGrade = optionalString(body, "targetGrade");
    if (body.aiProvider !== undefined) patch.aiProvider = optionalString(body, "aiProvider");
    if (body.aiModel !== undefined) patch.aiModel = optionalString(body, "aiModel");
    if (body.notificationsJson !== undefined) {
      const v = optionalString(body, "notificationsJson");
      if (v !== undefined && v.length > 20000) throw Object.assign(new Error("notificationsJson is too large"), { status: 400 });
      patch.notificationsJson = v;
    }
    const rows = await db.update(userSettings).set(patch).where(eq(userSettings.userId, userId)).returning();
    if (!rows.length) {
      const inserted = await db.insert(userSettings).values({ userId, dailyGoalMinutes: optionalIntInRange(body, "dailyGoalMinutes", 1, 1440) ?? 60, weekStartDay: optionalString(body, "weekStartDay") ?? "Monday" }).returning();
      return json({ settings: inserted[0] });
    }
    // NOTE: email is intentionally NOT updatable here. Email changes require a
    // verified Supabase Auth flow (updateUser + confirmation), otherwise the
    // profile email could be spoofed (e.g. to bypass ADMIN_EMAILS checks).
    if (body.email !== undefined) throw Object.assign(new Error("Email cannot be changed via settings — use Supabase Auth email update"), { status: 400 });
    if (body.displayName !== undefined) {
      if (typeof body.displayName !== "string" || !body.displayName.trim() || body.displayName.length > 200) throw Object.assign(new Error("Invalid displayName"), { status: 400 });
      await db.update(users).set({ displayName: body.displayName, updatedAt: new Date() }).where(eq(users.id, userId));
    }
    return json({ settings: rows[0] });
  });
}
