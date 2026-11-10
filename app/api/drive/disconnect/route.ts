import { withUser, json } from "@/lib/api-helpers";
import { clearConnection } from "@/lib/google-drive-storage";
export async function POST() {
  return withUser(async (userId) => { await clearConnection(userId); return json({ ok: true }); });
}
