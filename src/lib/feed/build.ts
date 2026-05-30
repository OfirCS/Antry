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

export type BuildFeedOptions = {
  /** Restrict the synth feed to a single post kind. Omit for all. */
  kind?: PostKind;
};

export function buildFeed(options: BuildFeedOptions = {}): Post[] {
  const posts: Post[] = [];

  // ── Receipts → "minted Receipt" posts ────────────────
  for (const r of demoReceipts) {
    if (r.display_visibility !== "public") continue;
    const tier = fingerprintTier(r.composite_score);
    const kind: PostKind = r.composite_score >= 80 ? "hack-win" : "receipt";
    posts.push({
      id: `feed_r_${r.id}`,
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
      reactions: pseudoReactions(r.id),
    });
  }

  // ── Briefs → "launched Brief" posts ──────────────────
  // Use the brief's company as the "author" so the feed has source diversity.
  for (const b of demoBriefs) {
    posts.push({
      id: `feed_b_${b.id}`,
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
      reactions: pseudoReactions(b.id),
    });
  }

  // Sort newest-first (mostly — receipts/briefs are timestamped)
  posts.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  if (options.kind) {
    return posts.filter((p) => p.kind === options.kind);
  }
  return posts;
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
