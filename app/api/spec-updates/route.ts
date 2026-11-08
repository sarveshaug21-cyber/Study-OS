import { getDb } from "@/db";
import { specUpdates } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { withUser, json, requireString, optionalUrl, requireEnum, isAdminEmail } from "@/lib/api-helpers";
import { OFFICIAL_UPDATES_URLS } from "@/lib/catalog";
const BOARDS = ["AQA","Pearson Edexcel","OCR","WJEC","Eduqas","CCEA"] as const;
const LEVELS = ["GCSE","International GCSE","A-level","International A-level"] as const;
const STATUSES = ["confirmed","proposed","unverified"] as const;
// Catalog writes are privileged. Gate POST behind ADMIN_EMAILS (comma-separated).
function isAdmin(email: string | undefined): boolean {
  const ok = isAdminEmail(email, process.env.ADMIN_EMAILS);
  if (!ok && !(process.env.ADMIN_EMAILS ?? "").trim()) console.warn("[api] ADMIN_EMAILS not configured — spec-update POST is disabled for all users.");
  return ok;
}
export async function GET() {
  return withUser(async () => {
    let rows: unknown[] = [];
    if (process.env.DATABASE_URL) {
      try { rows = await getDb().select().from(specUpdates); } catch { rows = []; }
    }
    return json({ updates: rows, sources: OFFICIAL_UPDATES_URLS, note: "Verify status on the official source before treating a change as confirmed." });
  });
}
export async function POST(req: Request) {
  return withUser(async () => {
    const db = getDb();
    // Security: verify against the JWT-confirmed Auth email, never the mutable
    // `users.email` profile column (users can edit their own profile row).
    const authUser = await getCurrentUser();
    if (!isAdmin(authUser?.email)) return json({ error: "Forbidden — ADMIN_EMAILS not configured or not an admin" }, 403);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const board = requireEnum(body.board, BOARDS, "board");
    const level = body.level === undefined ? undefined : requireEnum(body.level, LEVELS, "level");
    const status = body.status === undefined ? "unverified" : requireEnum(body.status, STATUSES, "status");
    const title = requireString(body, "title", 500);
    const sourceUrl = optionalUrl(body, "sourceUrl") ?? requireString(body, "sourceUrl", 2000);
    const publishedRaw = body.publishedAt ? new Date(body.publishedAt as string) : undefined;
    if (publishedRaw && Number.isNaN(publishedRaw.getTime())) throw Object.assign(new Error("publishedAt must be a valid date"), { status: 400 });
    const rows = await db.insert(specUpdates).values({ board, level, subjectName: typeof body.subjectName === "string" ? body.subjectName : undefined, title, sourceUrl, status, publishedAt: publishedRaw, summary: typeof body.summary === "string" ? body.summary.slice(0, 5000) : undefined }).returning();
    return json({ update: rows[0] }, 201);
  });
}
