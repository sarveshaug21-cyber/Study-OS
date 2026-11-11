import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { forwardedOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (env.supabaseConfigured()) { const s = await createSupabaseServerClient(); await s.auth.signOut(); }
  const origin = forwardedOrigin(request);
  return NextResponse.redirect(`${origin}/auth/login`, { status: 303 });
}
