import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withUser, json } from "@/lib/api-helpers";
import { exchangeCode, googleConfigured } from "@/lib/google-drive";
import { forwardedOrigin } from "@/lib/http";
import { saveConnection } from "@/lib/google-drive-storage";
import { getCurrentUser } from "@/lib/supabase/server";
// OAuth callback: exchange code, store refresh token with a placeholder folder id,
// then redirect to the Picker so the user selects the existing "Study OS" folder
// (drive.file scope cannot list pre-existing folders without Picker selection).
export async function GET(req: Request) {
  const origin = forwardedOrigin(req);
  const code = new URL(req.url).searchParams.get("code");
  const state = new URL(req.url).searchParams.get("state");
  const cookieStore = await cookies();
  const expected = cookieStore.get("gdrive_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/cloud-files?error=state", origin));
  }
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/cloud-files?error=config", origin));
  }
  try {
    const tok = await exchangeCode(code);
    if (!tok.refreshToken) throw new Error("No refresh token returned. Re-consent required.");
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated.");
    // Store refresh token with empty folderId; user must pick the folder via Picker.
    await saveConnection(user.id, tok.refreshToken, "", user.email ?? undefined);
    const res = NextResponse.redirect(new URL("/cloud-files?pick=1", origin));
    res.cookies.delete("gdrive_state");
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OAuth failed";
    return NextResponse.redirect(new URL(`/cloud-files?error=${encodeURIComponent(msg)}`, origin));
  }
}
