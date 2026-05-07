import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoReceipts } from "@/lib/receipts/demo-data";
import { FeedCard, type Post } from "@/components/feed/FeedCard";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { ProfileTabs } from "./ProfileTabs";

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

  // Synthesize the user's feed: their public Receipts + (later) their posts
  const feed: Post[] = sorted.map((r) => ({
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
    reactions: { likes: 12 + (r.composite_score % 30), comments: r.composite_score % 7 },
  }));

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* Banner */}
      <div
        style={{
          background: builder.gradient,
          height: 120,
        }}
      />
      <div className="mx-auto max-w-[920px] px-4 sm:px-6">
        {/* Identity */}
        <div className="-mt-12 mb-6">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center text-[28px] font-bold text-white shadow-lg"
            style={{
              background: builder.gradient,
              borderColor: "#FAFAF7",
            }}
          >
            {builder.name.charAt(0)}
          </div>

          <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-black leading-[1.1]">
                {builder.name}
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">@{builder.username}</p>
            </div>

            <Link
              href="/login?redirect=/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Follow
            </Link>
          </div>

          {/* Stats line */}
          <div className="mt-4 flex items-center gap-x-5 gap-y-1.5 flex-wrap text-[13px]">
            <Stat label="Receipts" value={receipts.length} />
            <Stat label="Median" value={median} />
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ background: tier.bg, color: tier.color }}
            >
              {tier.label}
            </span>
          </div>
        </div>

        <ProfileTabs
          tabs={[
            { key: "feed", label: "Feed", count: feed.length },
            { key: "receipts", label: "Receipts", count: receipts.length },
            { key: "hackathons", label: "Hackathons", count: 0 },
          ]}
        />

        {/* Feed */}
        <div
          className="rounded-[14px] overflow-hidden mt-4"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          {feed.map((p) => (
            <FeedCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-display font-bold text-[16px] text-black">
        {value}
      </span>
      <span className="text-[12px] text-gray-500">{label}</span>
    </span>
  );
}
