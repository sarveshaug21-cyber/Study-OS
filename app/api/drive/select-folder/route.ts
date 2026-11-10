import { withUser, json, requireString } from "@/lib/api-helpers";
import { getConnection, saveConnection } from "@/lib/google-drive-storage";
import { getDecryptedRefreshToken } from "@/lib/google-drive-storage";
import { getCurrentUser } from "@/lib/supabase/server";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { verifyFolder } from "@/lib/google-drive";
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await req.json().catch(() => ({}));
    const folderId = requireString(body, "folderId", 200);
    const conn = await getConnection(userId);
    if (!conn) return json({ error: "Connect Google Drive first." }, 400);
    const rt = await getDecryptedRefreshToken(userId);
    if (!rt) return json({ error: "Refresh token missing. Reconnect." }, 400);
    const { accessToken } = await requireDriveAccess();
    const v = await verifyFolder(accessToken, folderId, "Study OS");
    if (!v.ok) return json({ error: v.reason ?? "Invalid folder." }, 400);
    const user = await getCurrentUser();
    await saveConnection(userId, rt, folderId, user?.email ?? conn.email);
    return json({ ok: true, folderId, name: v.folder?.name });
  });
}
