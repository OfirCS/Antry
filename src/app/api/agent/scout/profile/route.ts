import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/discovery/admin";
import { scoutBuilderProfile } from "@/lib/discovery/scout-profile";

/**
 * Scout-on-a-person — POST { username } and Scout fetches that GitHub user's
 * public repos via the free GitHub API, builds an AI-first profile, and
 * persists their AI portfolio into discovered_projects.
 *
 * Access is admin-only (or cron secret) for now. This route is the single
 * gate to widen later (e.g. allow paid accounts) — the engine in
 * lib/discovery/scout-profile.ts stays untouched.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret) {
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Invalid cron secret" }, { status: 401 });
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized — Scout profiling is admin-only." },
        { status: 401 }
      );
    }
  }

  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  if (!username) {
    return NextResponse.json(
      { error: "Provide a GitHub username (e.g. { \"username\": \"torvalds\" })." },
      { status: 400 }
    );
  }

  const result = await scoutBuilderProfile(username);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json(result);
}
