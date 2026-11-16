// Rate limiting middleware using an in-memory store.
// In production, replace with Redis or Upstash.
import { NextRequest, NextResponse } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/ai": { max: 20, windowMs: 60000 },
  "/api/notifications": { max: 60, windowMs: 60000 },
  "/api/planner": { max: 120, windowMs: 60000 },
  "/api/notes": { max: 60, windowMs: 60000 },
  "/api/flashcards": { max: 60, windowMs: 60000 },
  "/api/practice": { max: 60, windowMs: 60000 },
  "/api/sessions": { max: 60, windowMs: 60000 },
  "/api/progress": { max: 60, windowMs: 60000 },
  "/api/subjects": { max: 60, windowMs: 60000 },
  "/api/search": { max: 30, windowMs: 60000 },
  "/api/past-papers": { max: 60, windowMs: 60000 },
  "/api/ai/feedback": { max: 30, windowMs: 60000 },
  "/api/drive": { max: 30, windowMs: 60000 },
  "/api/spec-updates": { max: 10, windowMs: 3600000 },
  "/api/account": { max: 5, windowMs: 3600000 },
};

export function rateLimit(req: NextRequest): NextResponse | null {
  const path = req.nextUrl.pathname;
  const rule = Object.entries(LIMITS).find(([prefix]) => path.startsWith(prefix));
  if (!rule) return null;

  const [, { max, windowMs }] = rule;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  entry.count += 1;
  return null;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60000);