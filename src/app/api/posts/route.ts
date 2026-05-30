/**
 * Posts API.
 *
 * POST /api/posts — authenticated; creates a post for the current user.
 * GET  /api/posts — public; returns recent posts (optional ?author=).
 *
 * Body shape is intentionally minimal — kind + headline are the only
 * required fields. Compose populates these; the auto-post flow from
 * /api/mcp submit_attempt populates them server-side.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPost, getPosts } from "@/lib/posts/store";
import type { Post } from "@/components/feed/FeedCard";

export const runtime = "nodejs";

const VALID_KINDS: Post["kind"][] = [
  "receipt",
  "hack-win",
  "hack-launch",
  "build",
  "ship",
  "discuss",
];

export async function GET(req: NextRequest) {
  const author = req.nextUrl.searchParams.get("author");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const posts = await getPosts({
    limit: Math.min(100, Math.max(1, limit)),
    authorUsername: author ?? undefined,
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  type Body = {
    kind?: Post["kind"];
    headline?: string;
    subtext?: string;
    href?: string;
    badges?: string[];
    metric?: { label: string; value: string };
  };
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const kind = body.kind ?? "build";
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }
  const headline = (body.headline ?? "").trim();
  if (headline.length < 3 || headline.length > 200) {
    return NextResponse.json({ error: "invalid_headline" }, { status: 400 });
  }

  // Resolve author identity from the authenticated session. Falls back to
  // a stable derivative of the user id when the profile row doesn't exist
  // yet (just-signed-up users post before claiming a username).
  const { data: profile } = await sb
    .from("profiles")
    .select("username, full_name, gradient")
    .eq("id", user.id)
    .single();

  const username = profile?.username ?? `u_${user.id.slice(0, 8)}`;
  const name = profile?.full_name ?? username;
  const gradient =
    profile?.gradient ??
    "linear-gradient(135deg, #C6F135 0%, #8AB91D 100%)";

  const verb =
    kind === "build"
      ? "is building"
      : kind === "ship"
        ? "shipped"
        : kind === "discuss"
          ? "asked"
          : kind === "receipt"
            ? "minted a Receipt"
            : kind === "hack-win"
              ? "topped the leaderboard"
              : "launched";

  const post = await createPost({
    authorId: user.id,
    authorUsername: username,
    authorName: name,
    authorGradient: gradient,
    kind,
    verb,
    headline,
    subtext: body.subtext?.slice(0, 400),
    href: body.href?.slice(0, 200),
    badges: body.badges?.slice(0, 5),
    metric: body.metric,
  });

  return NextResponse.json({ post });
}
