import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { rateLimit } from "@/lib/rate-limit";

const PROTECTED = ["/", "/subjects", "/notes", "/flashcards", "/practice", "/past-papers", "/ai-tutor", "/planner", "/progress", "/settings", "/cloud-files", "/import", "/research", "/specifications", "/exam-materials"];
const isProtected = (p: string) => PROTECTED.some((r) => r === "/" ? p === "/" : (p === r || p.startsWith(r + "/")));

// Rebuild an origin-aware nextUrl for redirects. Behind Tailscale Funnel (or
// any reverse proxy) the app must redirect to the PUBLIC host, not the bind
// address — prefer x-forwarded-host/proto, then Host, then nextUrl.
function externalUrl(request: NextRequest, pathname: string, search?: string): URL {
  const configured = process.env.APP_PUBLIC_URL?.trim();
  const fwdHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const rawHost = request.headers.get("host")?.trim();
  const fwdProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = (fwdProto || request.nextUrl.protocol.replace(":", "")) + ":";

  // Tailnet clients (direct to the node, no proxy in front) must stay on the
  // origin they dialled, otherwise a redirect would bounce them to the public
  // Funnel host. Funnel always arrives on :443 with the configured host; a
  // direct client uses an explicit port instead (tailnet :3000). Only trust
  // the request's own Host in that case — never redirect off-host otherwise.
  let configuredHost = "";
  if (configured) {
    try {
      configuredHost = new URL(configured).host.toLowerCase();
    } catch {
      configuredHost = "";
    }
  }
  const rawHostNo443 = (rawHost ?? "").replace(/:443$/, "").toLowerCase();
  const isTailnetDirect =
    !!rawHost && rawHostNo443 !== configuredHost;
  if (isTailnetDirect) {
    const url = request.nextUrl.clone();
    url.protocol = protocol;
    url.host = rawHost;
    url.pathname = pathname;
    url.search = search ?? "";
    url.hash = "";
    return url;
  }

  if (configured) {
    try {
      const u = new URL(configured);
      u.pathname = pathname;
      u.search = search ?? "";
      u.hash = "";
      return u;
    } catch {
      // fall through to header-derived origin
    }
  }
  const host = fwdHost || rawHost || request.nextUrl.host;
  const url = request.nextUrl.clone();
  url.protocol = protocol;
  url.host = host;
  url.pathname = pathname;
  url.search = search ?? "";
  return url;
}
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;

  // Rate-limit API routes before auth checks
  if (pathname.startsWith("/api/")) {
    const limited = rateLimit(request);
    if (limited) return limited;
  }

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
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|icon.svg).*)"] };
