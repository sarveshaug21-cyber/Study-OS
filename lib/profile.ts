import "server-only";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isYearGroup, type YearGroup } from "@/lib/ai/prompts";

export interface StudentProfile {
  userId: string;
  email: string;
  displayName: string;
  examBoard: string;
  yearGroup: YearGroup | null;
  qualification: string | null;
  defaultSubjectId: string | null;
}

export async function getStudentProfile(): Promise<StudentProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, user.id));
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const yg = meta.yearGroup;
  return {
    userId: user.id,
    email: user.email ?? "",
    displayName: row?.displayName ?? (user.email?.split("@")[0] ?? "Student"),
    examBoard: row?.examBoard ?? "AQA",
    yearGroup: isYearGroup(yg) ? yg : null,
    qualification: typeof meta.qualification === "string" ? meta.qualification : null,
    defaultSubjectId: typeof meta.defaultSubjectId === "string" ? meta.defaultSubjectId : null,
  };
}

export async function updateStudentProfile(patch: { yearGroup?: string; qualification?: string; examBoard?: string; defaultSubjectId?: string }): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const db = getDb();
  if (patch.examBoard) {
    await db.update(users).set({ examBoard: patch.examBoard as never, updatedAt: new Date() }).where(eq(users.id, user.id));
  }
  const metaPatch: Record<string, unknown> = { ...user.user_metadata };
  if (patch.yearGroup !== undefined) {
    if (!isYearGroup(patch.yearGroup)) throw Object.assign(new Error("yearGroup must be Year 10, 11, 12 or 13"), { status: 400 });
    metaPatch.yearGroup = patch.yearGroup;
  }
  if (patch.qualification !== undefined) metaPatch.qualification = patch.qualification;
  if (patch.defaultSubjectId !== undefined) metaPatch.defaultSubjectId = patch.defaultSubjectId;
  const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ data: metaPatch });
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
}
