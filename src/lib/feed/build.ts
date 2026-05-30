/**
 * v0 feed builder.
 *
 * Synthesizes the social feed from existing demo data: each public Receipt
 * becomes a feed post; the live Brief catalog becomes Build/Hack-launch
 * posts; demo hackathons become Hack-launch posts.
 *
 * When real user-generated content lands (`posts` table in a future
 * migration), this module gets a `getFeedFromDb()` sibling and pages
 * pick whichever has data. The `Post` shape is the contract.
 */

import type { Post, PostKind } from "@/components/feed/FeedCard";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { getMemReactionCounts } from "@/lib/posts/interactions";

export type FeedSort = "new" | "hot";

export type BuildFeedOptions = {
  /** Restrict the synth feed to a single post kind. Omit for all. */
  kind?: PostKind;
  /** Ordering: "new" (default) by `at` desc, or "hot" by engagement score. */
  sort?: FeedSort;
};

export function buildFeed(options: BuildFeedOptions = {}): Post[] {
  const posts: Post[] = [];

  // ── Receipts → "minted Receipt" posts ────────────────
  for (const r of demoReceipts) {
    if (r.display_visibility !== "public") continue;
    const tier = fingerprintTier(r.composite_score);
    const kind: PostKind = r.composite_score >= 80 ? "hack-win" : "receipt";
    const feedId = `feed_r_${r.id}`;
    posts.push({
      id: feedId,
      kind,
      author: {
        username: r.builder.username,
        name: r.builder.name,
        gradient: r.builder.gradient,
      },
      verb:
        kind === "hack-win"
          ? `topped the leaderboard on`
          : `minted a Receipt on`,
      headline: r.brief_title,
      subtext: r.highlights[0],
      badges: [r.company.name.toLowerCase(), tier.label.toLowerCase()],
      href: `/receipts/${r.id}`,
      at: r.signed_at,
      metric: { label: "Score", value: String(r.composite_score) },
      // Prefer real engagement counts from the interactions store; fall
      // back to deterministic pseudo-values so the demo still looks alive.
      reactions: realOrPseudoReactions(feedId, r.id),
    });
  }

  // ── Briefs → "launched Brief" posts ──────────────────
  // Use the brief's company as the "author" so the feed has source diversity.
  for (const b of demoBriefs) {
    const feedId = `feed_b_${b.id}`;
    posts.push({
      id: feedId,
      kind: "hack-launch",
      author: {
        username: b.company.slug,
        name: b.company.name,
        gradient: `linear-gradient(135deg, ${b.company.sponsor_color} 0%, #0A0A0A 100%)`,
      },
      verb: "launched a new Brief",
      headline: b.title,
      subtext: b.tagline,
      badges: [b.difficulty, b.category],
      href: `/briefs/${b.slug}`,
      at: b.created_at,
      metric: {
        label: "Cap",
        value: `${Math.round(b.time_cap_seconds / 60)}m`,
      },
      reactions: realOrPseudoReactions(feedId, b.id),
    });
  }

  // ── Sort ─────────────────────────────────────────────
  const sort: FeedSort = options.sort ?? "new";
  if (sort === "hot") {
    const now = Date.now();
    posts.sort((a, b) => hotScore(b, now) - hotScore(a, now));
  } else {
    // Newest-first (default).
    posts.sort((x, y) => +new Date(y.at) - +new Date(x.at));
  }

  if (options.kind) {
    return posts.filter((p) => p.kind === options.kind);
  }
  return posts;
}

/**
 * Best-effort lookup of real interaction counts for a synth post id.
 * Falls back to a deterministic pseudo value when the interactions
 * store is empty (fresh process, demo mode), so the feed never looks
 * dead. Defensive try/catch — never let an interactions failure break
 * the feed render.
 */
function realOrPseudoReactions(
  feedId: string,
  sourceId: string
): { likes: number; comments: number } {
  try {
    const real = getMemReactionCounts(feedId);
    if (real && (real.likes > 0 || real.comments > 0)) {
      return real;
    }
  } catch {
    // Interactions store unavailable — fall through to pseudo.
  }
  return pseudoReactions(sourceId);
}

/**
 * Hot score: rewards engagement, decays with age.
 *   score = likes*3 + comments*2 + recencyBoost
 * Recency boost gives a 0..20 bump for posts within the last 7 days.
 */
function hotScore(p: Post, now: number): number {
  const ageMs = Math.max(0, now - new Date(p.at).getTime());
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 20 - ageDays * (20 / 7));
  return (
    p.reactions.likes * 3 + p.reactions.comments * 2 + recencyBoost
  );
}

/** Deterministic pseudo-engagement counts seeded from the post id, so
 *  the feed doesn't randomly reorder on every render. */
function pseudoReactions(seed: string): { likes: number; comments: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(h);
  return {
    likes: 5 + (abs % 47),
    comments: abs % 13,
  };
}
