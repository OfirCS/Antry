/**
 * Post comments API.
 *
 * GET  /api/posts/[id]/comments — returns up to 50 recent comments.
 * POST /api/posts/[id]/comments — adds a comment. Body: { text: string }.
 *
 * Identity model matches /like — authed users use auth.uid(), everyone else
 * gets a stable cookie-backed anon id with a deterministic "@anon-NNNN"
 * display name.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  addComment,
  listComments,
  newAnonId,
  anonNameFromId,
  type Identity,
} from "@/lib/posts/interactions";

export const runtime = "nodejs";

const ANON_COOKIE = "antry_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await ctx.params;
  if (!postId) {
    return NextResponse.json({ error: "invalid_post_id" }, { status: 400 });
  }
  const comments = await listComments({ postId, limit: 50 });
  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      author: c.authorAnonName
        ? `@${c.authorAnonName}`
        : c.authorId
          ? "@user"
          : "@anon",
      text: c.text,
      at: c.createdAt,
    })),
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await ctx.params;
  if (!postId) {
    return NextResponse.json({ error: "invalid_post_id" }, { status: 400 });
  }

  type Body = { text?: string };
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = (body.text ?? "").trim();
  if (text.length < 1 || text.length > 1000) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  let identity: Identity;
  let anonName: string | null = null;
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
    anonName = anonNameFromId(anonId);
  }

  try {
    const c = await addComment({ postId, identity, anonName, text });
    const res = NextResponse.json({
      comment: {
        id: c.id,
        author: c.authorAnonName
          ? `@${c.authorAnonName}`
          : c.authorId
            ? "@user"
            : "@anon",
        text: c.text,
        at: c.createdAt,
      },
    });
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
