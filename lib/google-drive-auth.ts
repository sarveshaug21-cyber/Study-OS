import "server-only";
import { getDecryptedRefreshToken, getConnection, saveConnection } from "@/lib/google-drive-storage";
import { refreshAccessToken } from "@/lib/google-drive";
import { requireUserId } from "@/lib/auth";

export async function requireDriveAccess(): Promise<{ userId: string; accessToken: string; folderId: string }> {
  const userId = await requireUserId();
  const conn = await getConnection(userId);
  if (!conn) throw Object.assign(new Error("Google Drive is not connected. Connect it in Settings."), { status: 400 });
  const rt = await getDecryptedRefreshToken(userId);
  if (!rt) throw Object.assign(new Error("Google Drive refresh token missing. Reconnect."), { status: 400 });
  const refreshed = await refreshAccessToken(rt);
  if (refreshed.refreshToken) {
    await saveConnection(userId, refreshed.refreshToken, conn.folderId, conn.email);
  }
  return { userId, accessToken: refreshed.accessToken, folderId: conn.folderId };
}
