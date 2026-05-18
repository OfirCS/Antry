/**
 * Recommended-builders engine for the dashboard.
 *
 * Replaces the previous hardcoded `RECOMMENDED_BUILDERS` constant with a
 * real, personalized ranking computed from Supabase data.
 *
 * Ranking model: skill-overlap (weighted Jaccard) between the viewing
 * user's profile skills and each candidate builder's skills, blended with
 * a light popularity prior (project count + total likes) so that new
 * users with no skills still get a sensible "popular builders" list.
 *
 * Designed to never throw: any failure (no Supabase, no user, query
 * error) degrades gracefully to popularity-only ranking or an empty list.
 *
 * @module recommendations
 */

import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * A single recommended builder, shaped for direct rendering in a
 * dashboard "Recommended builders" card. Every field is non-null and
 * render-safe — callers do not need to guard.
 */
export type RecommendedBuilder = {
  /** Profile UUID. */
  id: string;
  /** URL-safe handle. Links to `/builders/{username}`. */
  username: string;
  /** Display name (falls back to username if the profile has none). */
  name: string;
  /** One-line tagline derived from the builder's bio (may be empty string). */
  tagline: string;
  /** Up to 4 skill tags, ordered with shared-with-viewer skills first. */
  skills: string[];
  /** CSS gradient string for the avatar fallback. */
  gradient: string;
  /** Avatar image URL, or null if the builder has none. */
  avatarUrl: string | null;
  /** Number of projects this builder has shipped. */
  projectCount: number;
  /**
   * Human-readable reason this builder was surfaced, e.g.
   * "Shares React, TypeScript with you" or "Popular this week".
   */
  reason: string;
  /** Match score 0-100 (skill overlap blended with popularity). */
  matchScore: number;
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  skills: string[] | null;
  gradient: string | null;
  avatar_url: string | null;
};

const DEFAULT_GRADIENT = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

/** Normalize a skill label for comparison (lowercase, trimmed). */
function normSkill(s: string): string {
  return s.trim().toLowerCase();
}

/** First sentence of a bio, used as a compact tagline. */
function taglineFromBio(bio: string | null): string {
  if (!bio) return "";
  const trimmed = bio.trim();
  if (!trimmed) return "";
  const dot = trimmed.indexOf(".");
  const first = dot > 0 ? trimmed.slice(0, dot + 1) : trimmed;
  return first.length > 110 ? first.slice(0, 107).trimEnd() + "…" : first;
}

/**
 * Weighted skill-overlap score between a viewer's skills and a
 * candidate's skills. Returns 0-1 (Jaccard-style: intersection over
 * union, so it rewards focused overlap rather than long skill lists).
 */
function skillOverlap(viewer: Set<string>, candidate: Set<string>): number {
  if (viewer.size === 0 || candidate.size === 0) return 0;
  let shared = 0;
  for (const s of candidate) if (viewer.has(s)) shared++;
  const union = viewer.size + candidate.size - shared;
  return union === 0 ? 0 : shared / union;
}

/**
 * Compute recommended builders for the dashboard.
 *
 * @param userId  The viewing user's profile/auth id, or null when the
 *                viewer is logged out. When null (or the profile has no
 *                skills) the result is a popularity-ranked list.
 * @param limit   Max number of builders to return. Default 3.
 * @returns       An array of {@link RecommendedBuilder}, length 0..limit,
 *                ordered best-match first. Never throws.
 */
export async function getRecommendedBuilders(
  userId: string | null,
  limit = 3
): Promise<RecommendedBuilder[]> {
  try {
    // Admin client bypasses RLS so the dashboard can rank across all
    // public builder profiles regardless of the viewer's session. When
    // the service-role key is absent we fall back to the RLS-scoped
    // client (profiles are publicly selectable, so ranking still works).
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // Viewer's own skills (for the overlap signal).
    let viewerSkills = new Set<string>();
    if (userId) {
      const { data: me } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", userId)
        .maybeSingle();
      const raw = (me?.skills as string[] | null) || [];
      viewerSkills = new Set(raw.map(normSkill).filter(Boolean));
    }

    // Candidate pool: every builder except the viewer. Capped at 200 to
    // keep the in-memory ranking cheap.
    let query = supabase
      .from("profiles")
      .select("id, username, full_name, bio, skills, gradient, avatar_url")
      .order("created_at", { ascending: false })
      .limit(200);
    if (userId) query = query.neq("id", userId);

    const { data: profiles, error } = await query;
    if (error || !profiles || profiles.length === 0) return [];

    const candidates = (profiles as ProfileRow[]).filter((p) => p.username);

    // Popularity prior: project count + total likes per builder.
    const ids = candidates.map((c) => c.id);
    const popularity = new Map<string, { count: number; likes: number }>();
    if (ids.length > 0) {
      const { data: projectRows } = await supabase
        .from("projects")
        .select("builder_id, likes_count")
        .in("builder_id", ids);
      for (const row of (projectRows as { builder_id: string; likes_count: number | null }[]) || []) {
        const cur = popularity.get(row.builder_id) || { count: 0, likes: 0 };
        cur.count += 1;
        cur.likes += row.likes_count || 0;
        popularity.set(row.builder_id, cur);
      }
    }

    const maxLikes = Math.max(1, ...[...popularity.values()].map((p) => p.likes));
    const maxCount = Math.max(1, ...[...popularity.values()].map((p) => p.count));

    const ranked = candidates
      .map((c) => {
        const candSkillsRaw = (c.skills || []).filter(Boolean);
        const candSkills = new Set(candSkillsRaw.map(normSkill));
        const overlap = skillOverlap(viewerSkills, candSkills);

        const pop = popularity.get(c.id) || { count: 0, likes: 0 };
        const popularityScore =
          0.5 * (pop.count / maxCount) + 0.5 * (pop.likes / maxLikes);

        // Skill overlap dominates when the viewer has skills; otherwise
        // the list is purely popularity-driven.
        const blended =
          viewerSkills.size > 0
            ? 0.75 * overlap + 0.25 * popularityScore
            : popularityScore;

        // Shared skills first, then the rest — for display + reason text.
        const sharedSkills = candSkillsRaw.filter((s) =>
          viewerSkills.has(normSkill(s))
        );
        const otherSkills = candSkillsRaw.filter(
          (s) => !viewerSkills.has(normSkill(s))
        );
        const orderedSkills = [...sharedSkills, ...otherSkills].slice(0, 4);

        let reason: string;
        if (sharedSkills.length > 0) {
          reason = `Shares ${sharedSkills.slice(0, 2).join(", ")} with you`;
        } else if (pop.count > 0) {
          reason =
            pop.likes > 0
              ? `${pop.count} project${pop.count === 1 ? "" : "s"} · ${pop.likes} signal${pop.likes === 1 ? "" : "s"}`
              : `Shipped ${pop.count} project${pop.count === 1 ? "" : "s"}`;
        } else {
          reason = "New to Antry";
        }

        const builder: RecommendedBuilder = {
          id: c.id,
          username: c.username as string,
          name: c.full_name?.trim() || (c.username as string),
          tagline: taglineFromBio(c.bio),
          skills: orderedSkills,
          gradient: c.gradient || DEFAULT_GRADIENT,
          avatarUrl: c.avatar_url || null,
          projectCount: pop.count,
          reason,
          matchScore: Math.round(blended * 100),
        };
        return { builder, blended, popularityScore };
      })
      // Tie-break by popularity so equal-overlap builders order sensibly.
      .sort(
        (a, b) =>
          b.blended - a.blended || b.popularityScore - a.popularityScore
      )
      .slice(0, Math.max(0, limit))
      .map((r) => r.builder);

    return ranked;
  } catch {
    // Any unexpected failure — never break the dashboard render.
    return [];
  }
}
