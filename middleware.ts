import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/", "/subjects", "/notes", "/flashcards", "/practice", "/past-papers", "/ai-tutor", "/planner", "/progress", "/settings", "/cloud-files", "/import", "/research", "/specifications"];
const isProtected = (p: string) => PROTECTED.some((r) => r === "/" ? p === "/" : (p === r || p.startsWith(r + "/")));

// Rebuild an origin-aware nextUrl for redirects. Behind Tailscale Funnel (or
// any reverse proxy) the app must redirect to the PUBLIC host, not the bind
// address — prefer x-forwarded-host/proto, then Host, then nextUrl.
function externalUrl(request: NextRequest, pathname: string, search?: string): URL {
  const configured = process.env.APP_PUBLIC_URL?.trim();
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
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|icon.svg).*)"] };
