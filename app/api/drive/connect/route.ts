import { NextResponse } from "next/server";
import { withUser, json } from "@/lib/api-helpers";
import { googleConfigured, buildAuthUrl } from "@/lib/google-drive";
import { randomBytes } from "node:crypto";
export async function GET() {
  return withUser(async () => {
    if (!googleConfigured()) return json({ error: "Google Drive is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env.local." }, 503);
    const state = randomBytes(16).toString("hex");
    const res = NextResponse.redirect(buildAuthUrl(state));
    res.cookies.set("gdrive_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
    return res;
  });
}
