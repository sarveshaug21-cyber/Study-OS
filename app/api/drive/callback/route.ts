import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withUser, json } from "@/lib/api-helpers";
import { exchangeCode, findFolder, googleConfigured } from "@/lib/google-drive";
import { saveConnection } from "@/lib/google-drive-storage";
import { getCurrentUser } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expected = cookieStore.get("gdrive_state")?.value;
  if (!code || !state || !expected || state !== expected) return NextResponse.redirect(new URL("/cloud-files?error=state", req.url).origin + "/cloud-files?error=state");
  if (!googleConfigured()) return NextResponse.redirect(new URL("/cloud-files?error=config", req.url).origin + "/cloud-files?error=config");
  try {
    const tok = await exchangeCode(code);
    if (!tok.refreshToken) throw new Error("No refresh token returned. Re-consent required.");
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated.");
    // Find existing "Study OS" folder (do not create duplicates).
    let folder = await findFolder(tok.accessToken, "Study OS");
    if (!folder) throw new Error("Existing 'Study OS' folder not found in your Google Drive. Create a folder named exactly 'Study OS' first, then reconnect.");
    await saveConnection(user.id, tok.refreshToken, folder.id, user.email ?? undefined);
    const res = NextResponse.redirect(new URL("/cloud-files?connected=1", req.url).origin + "/cloud-files?connected=1");
    res.cookies.delete("gdrive_state");
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OAuth failed";
    return NextResponse.redirect(new URL(`/cloud-files?error=${encodeURIComponent(msg)}`, req.url).origin + `/cloud-files?error=${encodeURIComponent(msg)}`);
  }
}
