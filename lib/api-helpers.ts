import "server-only";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireUserId } from "@/lib/auth";
export async function withUser(fn: (userId: string) => Promise<Response>) {
  if (!env.databaseConfigured() || !env.supabaseConfigured()) return NextResponse.json({ error: "Database not configured. Set DATABASE_URL and Supabase keys in .env.local." }, { status: 503 });
  try { const userId = await requireUserId(); return await fn(userId); }
  catch (e) { const status = (e as {status?:number}).status ?? 500; return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status }); }
}
export function json(data: unknown, status = 200) { return NextResponse.json(data, { status }); }
export function requireString(body: Record<string,unknown>, key: string): string { const v = body[key]; if (typeof v !== "string" || !v.trim()) throw new Error(`${key} is required`); return v; }
export function optionalString(body: Record<string,unknown>, key: string) { const v = body[key]; return typeof v === "string" ? v : undefined; }
export function requireUuid(body: Record<string,unknown>, key: string): string { const v = requireString(body, key); if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) throw new Error(`${key} must be a UUID`); return v; }
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
