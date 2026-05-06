import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Dev-friendly fallback: if Supabase isn't configured, pass through
  // unprotected requests so the marketing surface still renders.
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token. Network errors (e.g. bad placeholder URL)
  // shouldn't 500 the entire app — fall through as anonymous.
  let user: { id: string } | null = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user as typeof user;
  } catch {
    user = null;
  }

  // Protected routes — redirect to login if not authenticated.
  // Use exact-or-slash matching so siblings like /claim-card stay public.
  const protectedPaths = ["/dashboard", "/submit", "/settings", "/admin", "/claim"];
  const pathname = request.nextUrl.pathname;
  const isProtected =
    protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    /^\/projects\/[^/]+\/edit$/.test(pathname);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in? Redirect away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isAuthPage && user) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const url = request.nextUrl.clone();
    url.pathname = redirect || "/discover";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
