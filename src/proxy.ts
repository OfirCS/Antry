import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const legacyPagePrefixes = [
  "/about",
  "/admin",
  "/agent",
  "/agents",
  "/auth",
  "/blog",
  "/briefs",
  "/builders",
  "/claim",
  "/claim-card",
  "/companies",
  "/dashboard",
  "/discover",
  "/h",
  "/hackathons",
  "/login",
  "/pricing",
  "/privacy",
  "/projects",
  "/receipts",
  "/reset-password",
  "/settings",
  "/showcase",
  "/signup",
  "/submit",
  "/terms",
];

function isLegacyPage(pathname: string) {
  return legacyPagePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  if (isLegacyPage(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
