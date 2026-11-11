import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── App-level rate limiting ──────────────────────────────────────────────
// In-memory, per instance. Study OS runs as a single container, so this is an
// effective brake against brute force and AI-cost abuse on the public demo.
// Buckets: strict (20/min) for auth + AI + Drive token endpoints, standard
// (120/min) for other API routes. Pages are not limited at this layer.
// Behind Tailscale Funnel / a reverse proxy, the original client IP arrives in
// X-Forwarded-For; when absent we fall back to a shared bucket.
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; reset: number }>();

function strictPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/drive/token") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/")
  );
}

function limitFor(pathname: string): number {
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/auth/")) return 0;
  return strictPath(pathname) ? 20 : 120;
}

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const limit = limitFor(pathname);
  if (limit === 0) return null;

  const now = Date.now();
  const key = `${clientIp(request)}|${limit === 20 ? "strict" : "api"}`;
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return null;
  }
  bucket.count += 1;
  // Cheap eviction to bound memory when many IPs appear.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
  }
  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.reset - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  return null;
}

const PROTECTED = ["/", "/subjects", "/notes", "/flashcards", "/practice", "/past-papers", "/ai-tutor", "/planner", "/progress", "/settings", "/cloud-files", "/import", "/research", "/specifications"];
const isProtected = (p: string) => PROTECTED.some((r) => r === "/" ? p === "/" : (p === r || p.startsWith(r + "/")));
export async function middleware(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();
  // Fail closed: if auth is not configured, do not silently allow protected pages.
  if (!url || !anon) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  // Admin gate for /import: check happens server-side in the page/API; middleware only ensures auth.
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"] };
