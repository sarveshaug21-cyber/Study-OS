import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
const PROTECTED = ["/", "/subjects", "/notes", "/flashcards", "/practice", "/past-papers", "/ai-tutor", "/planner", "/progress", "/settings", "/cloud-files", "/import", "/research", "/specifications"];
const isProtected = (p: string) => PROTECTED.some((r) => r === "/" ? p === "/" : (p === r || p.startsWith(r + "/")));
export async function middleware(request: NextRequest) {
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
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|icon.svg).*)"] };
