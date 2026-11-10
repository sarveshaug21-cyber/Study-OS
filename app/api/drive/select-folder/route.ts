import { withUser, json, requireString } from "@/lib/api-helpers";
import { getConnection, saveConnection } from "@/lib/google-drive-storage";
import { getDecryptedRefreshToken } from "@/lib/google-drive-storage";
import { getCurrentUser } from "@/lib/supabase/server";
// Save the folder chosen via Google Picker. Requires an existing connection (refresh token).
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await req.json().catch(() => ({}));
    const folderId = requireString(body, "folderId", 200);
    const conn = await getConnection(userId);
    if (!conn) return json({ error: "Connect Google Drive first." }, 400);
    const rt = await getDecryptedRefreshToken(userId);
    if (!rt) return json({ error: "Refresh token missing. Reconnect." }, 400);
    const user = await getCurrentUser();
    await saveConnection(userId, rt, folderId, user?.email ?? conn.email);
    return json({ ok: true, folderId });
  });
}
