/**
 * Post likes API.
 *
 * POST /api/posts/[id]/like — toggles a like for the current viewer.
 *
 * Identity model:
 *   • If the request carries a valid Supabase session, like with auth.uid().
 *   • Otherwise we mint or read the `antry_anon_id` cookie and use it as a
 *     stable identifier. Anonymous-friendly is a feature — most first-time
 *     visitors won't be signed in for their first 5 minutes.
 *
 * Returns { liked: boolean, total: number } — the optimistic UI on the
 * client reconciles against this.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  toggleLike,
  newAnonId,
  type Identity,
} from "@/lib/posts/interactions";

export const runtime = "nodejs";

const ANON_COOKIE = "antry_anon_id";
// 1 year — long enough to be stable across visits but the cookie is
// httpOnly so it can't be exfil'd by client JS.
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await ctx.params;
  if (!postId) {
    return NextResponse.json({ error: "invalid_post_id" }, { status: 400 });
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  let identity: Identity;
  let setCookie: { name: string; value: string } | null = null;

  if (user) {
    identity = { userId: user.id, anonId: null };
  } else {
    const jar = await cookies();
    let anonId = jar.get(ANON_COOKIE)?.value ?? null;
    if (!anonId) {
      anonId = newAnonId();
      setCookie = { name: ANON_COOKIE, value: anonId };
    }
    identity = { userId: null, anonId };
  }

  try {
    const state = await toggleLike({ postId, identity });
    const res = NextResponse.json(state);
    if (setCookie) {
      res.cookies.set(setCookie.name, setCookie.value, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: ANON_COOKIE_MAX_AGE,
      });
    }
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
