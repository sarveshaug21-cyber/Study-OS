import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── App-level rate limiting ──────────────────────────────────────────────
// In-memory, per instance. Study OS runs as a single instance, so this is an
// effective brake against brute force, AI-cost abuse and bulk-import floods.
// Buckets: strict (20/min) for auth + AI + Drive token endpoints, generous
// (600/min) for other API routes and the Drive folder import endpoints.
// Generous is intentional: via Tailscale Funnel the real client IP may or may
// not reach this process, and the demo must not 429 its own users.
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; reset: number }>();

function limitFor(pathname: string): number {
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/auth/")) return 0;
  if (
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/drive/token") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/")
  ) return 20;
  return 600;
}

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (fwd) return fwd;
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  // Last resort: bucket by the (proxy) host rather than one shared bucket.
  return request.headers.get("host")?.trim() || "unknown";
}

function bucketKey(limit: number): string {
  return limit === 20 ? "strict" : "api";
}

function rateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const limit = limitFor(pathname);
  if (limit === 0) return null;

  const now = Date.now();
  const key = `${clientIp(request)}|${bucketKey(limit)}`;
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return null;
  }
  bucket.count += 1;
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

// Rebuild an origin-aware nextUrl for redirects. Behind Tailscale Funnel (or
// any reverse proxy) the app must redirect to the PUBLIC host, not the bind
// address — prefer x-forwarded-host/proto, then Host, then nextUrl.
function externalUrl(request: NextRequest, pathname: string, search?: string): URL {
  const fwdHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = fwdHost || request.headers.get("host")?.trim() || request.nextUrl.host;
  const fwdProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = (fwdProto || request.nextUrl.protocol.replace(":", "")) + ":";
  const url = request.nextUrl.clone();
  url.protocol = protocol;
  url.host = host;
  url.pathname = pathname;
  url.search = search ?? "";
  return url;
}
export async function middleware(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();
  // Fail closed: if auth is not configured, do not silently allow protected pages.
  if (!url || !anon) {
    return NextResponse.redirect(externalUrl(request, "/auth/login", `?next=${encodeURIComponent(pathname)}`));
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
    return NextResponse.redirect(externalUrl(request, "/auth/login", `?next=${encodeURIComponent(pathname)}`));
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"] };
