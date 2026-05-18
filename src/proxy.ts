import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Auth-aware session handling (protected-route gating, auth-page bounce).
  // Note: do NOT blanket-redirect app route prefixes to "/" here — every
  // route below /about, /briefs, /dashboard, /login, /auth/callback, etc.
  // is live, and a prefix sweep silently breaks login, OAuth, and every
  // post-action redirect.
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
