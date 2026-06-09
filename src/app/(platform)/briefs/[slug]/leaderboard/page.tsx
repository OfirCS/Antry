import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy, Shield, Zap } from "lucide-react";
import { demoBriefs, getDemoBrief, getDemoReceiptsForBrief } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { ScoreDistribution } from "../_components/ScoreDistribution";
import { SortableLeaderboard } from "../_components/SortableLeaderboard";

type PageProps = { params: Promise<{ slug: string }> };

// Static export: one leaderboard per Brief.
export async function generateStaticParams() {
  return demoBriefs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brief = getDemoBrief(slug);
  if (!brief) return { title: "Leaderboard" };
  const title = `${brief.title} — Leaderboard`;
  const description = `Top builders ranked by composite Fingerprint on the ${brief.title} Brief. Receipts signed at the Antry gateway.`;
  return {
    title,
    description,
    alternates: { canonical: `/briefs/${slug}/leaderboard` },
    openGraph: defaultOpenGraph({
      title,
      description,
      path: `/briefs/${slug}/leaderboard`,
      image: ogImageUrl({
        title: brief.title,
        subtitle: "Live leaderboard · ranked by composite Fingerprint",
        eyebrow: "ANTRY · LEADERBOARD",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function BriefLeaderboardPage({ params }: PageProps) {
  const { slug } = await params;
  const brief = getDemoBrief(slug);
  if (!brief) notFound();

  const receipts = getDemoReceiptsForBrief(brief.id).sort(
    (a, b) => b.composite_score - a.composite_score
  );

  const accent = brief.company.sponsor_color;

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* Header band */}
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: accent }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-6">
          <Link
            href={`/briefs/${slug}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Brief
          </Link>

          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2 inline-flex items-center gap-2"
            style={{ color: accent }}
          >
            <Trophy className="w-3 h-3" />
            Live leaderboard
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.2rem)" }}
          >
            {brief.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-gray-600">
            <span>
              <span className="font-bold text-black tabular-nums">
                {brief.attempts_count}
              </span>{" "}
              attempts
            </span>
            <span>
              <span className="font-bold text-black tabular-nums">
                {brief.receipts_count}
              </span>{" "}
              Receipts
            </span>
            <span>
              Median{" "}
              <span className="font-bold text-black tabular-nums">
                {brief.median_score ?? "—"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <Shield className="w-3 h-3" />
              All signed
            </span>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 space-y-6">
          {/* Score distribution sparkline. Only render when there's data
             to plot — an empty histogram would be misleading. */}
          {receipts.length > 0 && (
            <ScoreDistribution receipts={receipts} sponsorColor={accent} />
          )}

          {receipts.length === 0 ? (
            <div
              className="rounded-[14px] px-6 py-12 text-center"
              style={{ background: "#FFFFFF", border: "1px dashed #EBEBEB" }}
            >
              <Trophy
                className="w-7 h-7 mx-auto mb-3"
                style={{ color: accent }}
              />
              <p className="font-display font-bold text-[18px] tracking-[-0.015em] text-black">
                First Receipt wins eyeballs
              </p>
              <p className="mt-2 max-w-[420px] mx-auto text-[13px] leading-[1.55] text-gray-600">
                No one has minted a public Receipt yet. The first builder
                to ship lands on top of this leaderboard — and stays on the
                Brief preview card.
              </p>
              <Link
                href={`/briefs/${slug}`}
                className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                Start in Cursor
              </Link>
            </div>
          ) : (
            <SortableLeaderboard receipts={receipts} sponsorColor={accent} />
          )}

          {/* Compete-on-this-Brief footer — single dense row on desktop,
             wraps to two lines on mobile. */}
          <div
            className="rounded-[14px] px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 flex-wrap"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "#0A0A0A" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#C6F135" }} />
            </div>
            <div className="flex-1 min-w-[200px] text-[12px] leading-[1.5] text-gray-600">
              <span className="font-bold text-black">Compete on this Brief —</span>{" "}
              install Antry MCP and run{" "}
              <code className="font-mono text-black">
                start_attempt(&quot;{slug}&quot;)
              </code>
              .
            </div>
            <Link
              href={`/briefs/${slug}`}
              className="inline-flex items-center justify-center rounded-[10px] px-4 h-9 text-[12px] font-bold transition-all hover:-translate-y-0.5 shrink-0"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Start in Cursor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
