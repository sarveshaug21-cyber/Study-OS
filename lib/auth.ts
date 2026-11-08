import "server-only";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDb } from "@/db";
import { users, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  await ensureProfile(user.id, user.email ?? "");
  return user.id;
}
export async function ensureProfile(userId: string, email: string) {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({ id: userId, email, displayName: email.split("@")[0] || "Student" });
    await db.insert(userSettings).values({ userId }).onConflictDoNothing();
  }
  return existing[0];
}
