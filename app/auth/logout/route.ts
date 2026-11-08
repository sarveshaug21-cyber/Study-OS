import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
export async function POST(request: Request) {
  if (env.supabaseConfigured()) { const s = await createSupabaseServerClient(); await s.auth.signOut(); }
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/auth/login`, { status: 303 });
}
