import { withUser, json } from "@/lib/api-helpers";
import { dryRun } from "@/lib/import/validate";
import { isAdminEmail } from "@/lib/validation";
import { getCurrentUser } from "@/lib/supabase/server";
// Admin-only dry-run import preview. No DB writes. Requires ADMIN_EMAILS.
export async function POST(req: Request) {
  return withUser(async () => {
    const user = await getCurrentUser();
    if (!isAdminEmail(user?.email, process.env.ADMIN_EMAILS)) return json({ error: "Forbidden" }, 403);
    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.records) ? body.records : [];
    const existing = Array.isArray(body.existing) ? body.existing : [];
    const preview = dryRun(existing, incoming);
    return json({ preview });
  });
}
