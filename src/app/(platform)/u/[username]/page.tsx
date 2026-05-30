import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Share2 } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoReceipts } from "@/lib/receipts/demo-data";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { getPosts } from "@/lib/posts/store";
import { ProfileTabs } from "./ProfileTabs";
import { TopDimensions } from "./TopDimensions";
import { RecentBriefs } from "./RecentBriefs";
import { SocialLinks } from "./SocialLinks";
import { Achievements } from "./Achievements";
import type { Post } from "@/components/feed/FeedCard";

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const u = decodeURIComponent(username).replace(/^@/, "");
  const receipts = demoReceipts.filter((r) => r.builder.username === u);
  const builder = receipts[0]?.builder;
  const title = builder ? `@${u} · ${builder.name}` : `@${u}`;
  const desc = builder
    ? `${builder.name}'s feed on Antry — Receipts, builds, and hackathons.`
    : `Profile of @${u}.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/u/${u}` },
    openGraph: defaultOpenGraph({
      title,
      description: desc,
      path: `/u/${u}`,
      image: ogImageUrl({
        title: builder?.name ?? `@${u}`,
        subtitle: `${receipts.length} Receipts on Antry`,
        eyebrow: "ANTRY · BUILDER",
      }),
    }),
    twitter: defaultTwitter({ title, description: desc }),
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const u = decodeURIComponent(username).replace(/^@/, "");
  const receipts = demoReceipts.filter((r) => r.builder.username === u);
  if (receipts.length === 0) notFound();

  const builder = receipts[0].builder;
  const sorted = [...receipts].sort(
    (a, b) => b.composite_score - a.composite_score
  );
  const median = sorted[Math.floor(sorted.length / 2)].composite_score;
  const tier = fingerprintTier(median);
  // Best Receipt drives the Top Dimensions chips. The strongest single
  // Receipt is the best signal of where this builder shines today.
  const bestReceipt = sorted[0];

  // Receipts close to the 80-composite win threshold — used in the Wins
  // empty state to give an encouraging "you're climbing" message.
  const closeToWin = receipts.filter(
    (r) => r.composite_score >= 70 && r.composite_score < 80
  ).length;

  // Real posts authored by this user (DB or memory) + synthesized
  // Receipt posts. Real always on top.
  const realPosts = await getPosts({ authorUsername: u, limit: 50 });
  const synthFeed: Post[] = sorted.map((r) => ({
    id: `feed_p_${r.id}`,
    kind: r.composite_score >= 80 ? "hack-win" : "receipt",
    author: {
      username: r.builder.username,
      name: r.builder.name,
      gradient: r.builder.gradient,
    },
    verb:
      r.composite_score >= 80
        ? "topped the leaderboard on"
        : "minted a Receipt on",
    headline: r.brief_title,
    subtext: r.highlights[0],
    badges: [r.company.name.toLowerCase()],
    href: `/receipts/${r.id}`,
    at: r.signed_at,
    metric: { label: "Score", value: String(r.composite_score) },
    reactions: {
      likes: 12 + (r.composite_score % 30),
      comments: r.composite_score % 7,
    },
  }));
  const feed = [...realPosts, ...synthFeed];

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* Slim 96px banner — gradient sourced from the builder's avatar so
          each profile has a unique color identity. Kept short so the
          content lands above the fold on small viewports. */}
      <div
        style={{ background: builder.gradient, height: 96 }}
        aria-hidden
      />

      <div className="mx-auto max-w-[920px] px-4 sm:px-6">
        {/* Identity — avatar overlaps the banner by ~half its height so
            the silhouette is centered on the seam. */}
        <section className="-mt-8 sm:-mt-10 mb-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center text-[28px] sm:text-[32px] font-bold text-white"
              style={{
                background: builder.gradient,
                borderColor: "#FAFAF7",
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
              }}
            >
              {builder.name.charAt(0)}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                aria-label="Share"
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 sm:px-4 h-11 sm:h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: "#FFFFFF",
                  color: "#0A0A0A",
                  border: "1px solid #EBEBEB",
                }}
              >
                <Share2 className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[10px] px-4 h-11 sm:h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                Follow
              </button>
            </div>
          </div>

          <h1 className="mt-3 text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] text-black leading-[1.1]">
            {builder.name}
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">@{builder.username}</p>

          {/* Bio — synthesized from Receipt activity (factual, terse).
              Real version pulls from profiles.bio. */}
          <p className="mt-2.5 max-w-[560px] text-[14px] leading-[1.55] text-gray-700">
            {receipts.length} signed Receipt{receipts.length === 1 ? "" : "s"} on
            Antry. Median composite{" "}
            <span className="font-bold text-black tabular-nums">{median}</span>.
            {bestReceipt.composite_score >= 85
              ? ` Topped the leaderboard on ${bestReceipt.brief_title}.`
              : ""}
          </p>

          {/* Top Dimensions — strongest 3 axes from the best Receipt. */}
          <TopDimensions fingerprint={bestReceipt.fingerprint} />

          {/* Recent Briefs strip — mini-card per Receipt with score + glyph. */}
          <RecentBriefs receipts={receipts} />

          {/* Social/website row — placeholders derived from the username. */}
          <SocialLinks username={builder.username} />

          {/* Achievement badges (skipped entirely if none qualify). */}
          <Achievements receipts={receipts} />

          {/* Stat row */}
          <div className="mt-4 flex items-center gap-x-5 gap-y-1.5 flex-wrap text-[13px]">
            <Stat label="Receipts" value={receipts.length} />
            <Stat label="Median" value={median} />
            <Stat label="Best" value={bestReceipt.composite_score} />
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: tier.bg, color: tier.color }}
            >
              {tier.label}
            </span>
          </div>
        </section>

        {/* Tabs (functional — actually filter the feed) */}
        <ProfileTabs
          feed={feed}
          totalReceipts={receipts.length}
          closeToWin={closeToWin}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-display font-bold text-[16px] text-black tabular-nums">
        {value}
      </span>
      <span className="text-[12px] text-gray-500">{label}</span>
    </span>
  );
}
