/**
 * Hackathon mint endpoint.
 *
 * POST /api/hackathons
 *   { name, vibe, durationHours, prize, briefSlugs[] }
 *   → returns { slug, url }
 *
 * Authenticated only — host_user_id is the caller's auth.uid(). DB-backed
 * when SUPABASE configured, in-memory otherwise (slug still works for
 * /h/<slug> lookup in dev mode).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHackathon } from "@/lib/hackathons/store";
import { demoBriefs } from "@/lib/receipts/demo-data";

export const runtime = "nodejs";

const VALID_VIBES = ["speedrun", "build-night", "weekend-mode", "agent-cup"];

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "hack"
  );
}

export async function POST(req: NextRequest) {
  // Optional auth — anonymous mint is allowed (host_user_id will be null).
  // This keeps the launcher demoable before the user has logged in.
  const sb = await createClient();
  let hostUserId: string | null = null;
  try {
    const {
      data: { user },
    } = await sb.auth.getUser();
    hostUserId = user?.id ?? null;
  } catch {
    hostUserId = null;
  }

  type Body = {
    name?: string;
    vibe?: string;
    durationHours?: number;
    prize?: string;
    briefSlugs?: string[];
  };
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (name.length < 3 || name.length > 80) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  const vibe = body.vibe ?? "build-night";
  if (!VALID_VIBES.includes(vibe)) {
    return NextResponse.json({ error: "invalid_vibe" }, { status: 400 });
  }
  const durationHours = Math.max(
    1,
    Math.min(168, Number(body.durationHours ?? 8))
  );
  const briefSlugs = Array.isArray(body.briefSlugs)
    ? body.briefSlugs.filter((s) => typeof s === "string")
    : [];
  if (briefSlugs.length < 1 || briefSlugs.length > 10) {
    return NextResponse.json({ error: "invalid_briefs" }, { status: 400 });
  }

  // Resolve brief slugs to brief IDs (using the demo catalog as source of
  // truth for now; real DB-backed lookup drops in via getBriefs() once
  // /briefs is migrated off mock-data).
  const slugToBrief = new Map(demoBriefs.map((b) => [b.slug, b]));
  const briefIds: string[] = [];
  for (const s of briefSlugs) {
    const b = slugToBrief.get(s);
    if (!b) {
      return NextResponse.json(
        { error: `unknown_brief:${s}` },
        { status: 400 }
      );
    }
    briefIds.push(b.id);
  }

  const record = await createHackathon({
    slug: slugify(name),
    name,
    vibe: vibe as "speedrun" | "build-night" | "weekend-mode" | "agent-cup",
    duration_hours: durationHours,
    prize: (body.prize ?? "").slice(0, 200),
    brief_ids: briefIds,
    host_user_id: hostUserId,
  });

  return NextResponse.json({
    slug: record.slug,
    id: record.id,
    url: `/h/${record.slug}`,
  });
}
