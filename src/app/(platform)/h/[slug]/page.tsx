import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Trophy, Clock, Shield, ArrowRight, Code2, Users, Receipt as ReceiptIcon } from "lucide-react";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { getHackathonBySlug } from "@/lib/hackathons/store";
import { LiveStatus } from "./_components/LiveStatus";
import { ShareButton } from "./_components/ShareButton";

type PageProps = { params: Promise<{ slug: string }> };

// Static export: prebuild a representative set of vibe-hackathon pages.
// Any slug renders (the store falls back to a prettified title), so this
// is just the curated set shipped on the static demo.
export async function generateStaticParams() {
  return [
    { slug: "agent-cup-summer" },
    { slug: "speedrun-night" },
    { slug: "weekend-build-mode" },
    { slug: "build-night-rag" },
  ];
}

/**
 * Vibe Hackathon landing + live leaderboard.
 *
 * Light editorial — matches the feed/profile aesthetic. The hackathon's
 * vibe color is the single accent (left stripe + leaderboard top-card
 * border). No dark hero, no decorative gradients.
 */

const VIBE_ACCENT: Record<string, string> = {
  speedrun: "#FF6B35",
  "build-night": "#C6F135",
  "weekend-mode": "#7C3AED",
  "agent-cup": "#3B82F6",
};

function prettify(slug: string): string {
  return slug
    .replace(/-+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 60);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = `${prettify(slug)} · Vibe Hackathon`;
  const description = `Live leaderboard. Builders enter via Cursor + Antry MCP. Receipts mint to this page in real time.`;
  return {
    title,
    description,
    alternates: { canonical: `/h/${slug}` },
    openGraph: defaultOpenGraph({
      title,
      description,
      path: `/h/${slug}`,
      image: ogImageUrl({
        title: prettify(slug),
        subtitle: "Live leaderboard · signed Receipts",
        eyebrow: "ANTRY · VIBE HACKATHON",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function VibeHackathonPage({ params }: PageProps) {
  const { slug } = await params;

  const record = await getHackathonBySlug(slug);
  const briefs = record
    ? demoBriefs.filter((b) => record.brief_ids.includes(b.id))
    : demoBriefs.slice(0, 3);
  const briefIds = new Set(briefs.map((b) => b.id));
  const headerName = record?.name ?? prettify(slug);
  const accent = record ? VIBE_ACCENT[record.vibe] ?? "#0A0A0A" : "#0A0A0A";

  // Pull public Receipts across the bundled Briefs, ranked by composite.
  const receipts = demoReceipts
    .filter(
      (r) => briefIds.has(r.brief_id) && r.display_visibility === "public"
    )
    .sort((a, b) => b.composite_score - a.composite_score);

  const seen = new Set<string>();
  const board = receipts.filter((r) => {
    if (seen.has(r.builder.username)) return false;
    seen.add(r.builder.username);
    return true;
  });

  // Per-brief Receipt count for the progress chip on each Brief card.
  // For now we count all public Receipts on that brief (not filtered by
  // this hackathon window) — the spec calls this out as intentional.
  const receiptCountByBriefId = new Map<string, number>();
  for (const r of demoReceipts) {
    if (r.display_visibility !== "public") continue;
    receiptCountByBriefId.set(
      r.brief_id,
      (receiptCountByBriefId.get(r.brief_id) ?? 0) + 1
    );
  }

  // Participant + Receipt totals shown under the live indicator.
  const builderCount = board.length;
  const receiptCount = receipts.length;

  const totalMinutes = Math.round(
    briefs.reduce((s, b) => s + b.time_cap_seconds, 0) / 60
  );

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
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-8">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2"
            style={{ color: accent }}
          >
            <Sparkles className="w-3 h-3" />
            Vibe Hackathon
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1
              className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05] flex-1 min-w-0"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
            >
              {headerName}
            </h1>
            <div className="shrink-0">
              <ShareButton
                title={`${headerName} · Vibe Hackathon`}
                text="Live leaderboard · signed Receipts"
              />
            </div>
          </div>

          {/* Live · ends in / started ago — client component, ticks every 60s */}
          <LiveStatus
            startsAt={record?.starts_at ?? null}
            endsAt={record?.ends_at ?? null}
            accent={accent}
          />

          {/* Participant + Receipt count line */}
          <p className="mt-1.5 text-[12px] text-gray-500 inline-flex items-center gap-x-3 gap-y-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              <span className="font-semibold text-black tabular-nums">
                {builderCount}
              </span>{" "}
              builder{builderCount === 1 ? "" : "s"}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ReceiptIcon className="w-3 h-3" />
              <span className="font-semibold text-black tabular-nums">
                {receiptCount}
              </span>{" "}
              Receipt{receiptCount === 1 ? "" : "s"} minted
            </span>
          </p>

          <div className="mt-4 flex items-center gap-x-5 gap-y-1.5 flex-wrap text-[13px] text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              {briefs.length} Brief{briefs.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {totalMinutes}m total
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Gateway-signed
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Install MCP <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={briefs[0] ? `/briefs/${briefs[0].slug}` : "/briefs"}
              className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold transition-colors"
              style={{
                background: "#FFFFFF",
                color: "#0A0A0A",
                border: "1px solid #EBEBEB",
              }}
            >
              See Briefs
            </Link>
          </div>
        </div>
      </section>

      {/* Briefs in this hack */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
            Briefs in this hack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {briefs.map((b) => {
              const minted = receiptCountByBriefId.get(b.id) ?? 0;
              return (
                <Link
                  key={b.id}
                  href={`/briefs/${b.slug}`}
                  className="group rounded-[14px] p-4 transition-colors hover:bg-[#FAFAF7]"
                  style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: accent }}
                    >
                      {b.difficulty}
                    </span>
                    <span className="ml-auto text-[10px] inline-flex items-center gap-1 text-gray-500">
                      <Clock className="w-2.5 h-2.5" />
                      {Math.round(b.time_cap_seconds / 60)}m
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold tracking-[-0.005em] text-black leading-[1.3]">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-[1.5] text-gray-500 line-clamp-2">
                    {b.tagline}
                  </p>
                  <div
                    className="mt-3 pt-3 flex items-center justify-between text-[11px]"
                    style={{ borderTop: "1px solid #F1F1F1" }}
                  >
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <ReceiptIcon className="w-3 h-3" />
                      <span className="font-bold text-black tabular-nums">
                        {minted}
                      </span>{" "}
                      minted
                    </span>
                    <span
                      className="font-bold uppercase tracking-[0.14em] text-[9px]"
                      style={{ color: accent }}
                    >
                      Open →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live leaderboard */}
      <section
        className="py-10 sm:py-12"
        style={{ background: "#FFFFFF", borderTop: "1px solid #EBEBEB" }}
      >
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          {/* Prize callout — small but distinctive. Sits above the leaderboard. */}
          {record?.prize && (
            <div
              className="mb-5 rounded-[12px] px-4 py-3 inline-flex items-center gap-2.5"
              style={{
                background: "#FAFAF7",
                border: `1px solid ${accent}`,
              }}
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                style={{ background: accent }}
              >
                <Trophy
                  className="w-3.5 h-3.5"
                  strokeWidth={2.5}
                  style={{ color: "#0A0A0A" }}
                />
              </span>
              <div className="leading-[1.25]">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Winner gets
                </p>
                <p className="text-[14px] font-bold tracking-[-0.005em] text-black">
                  {record.prize}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
            <h2
              className="font-display font-bold tracking-[-0.02em] text-black"
              style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)" }}
            >
              Top builders
            </h2>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: accent }}
              />
              Live
            </span>
          </div>

          {board.length === 0 ? (
            <div
              className="rounded-[14px] px-6 py-10 text-center"
              style={{ background: "#FAFAF7", border: "1px dashed #EBEBEB" }}
            >
              <Trophy
                className="w-6 h-6 mx-auto mb-3"
                style={{ color: accent }}
              />
              <p className="text-[14px] text-gray-600">
                No Receipts on the board yet. First mint wins eyeballs.
              </p>
            </div>
          ) : (
            <ol className="space-y-2">
              {board.map((r, idx) => (
                <li
                  key={r.id}
                  className="rounded-[14px] transition-colors hover:bg-[#FAFAF7]"
                  style={{
                    background: "#FFFFFF",
                    border: `1px solid ${idx === 0 ? accent : "#EBEBEB"}`,
                  }}
                >
                  <Link
                    href={`/receipts/${r.id}`}
                    className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[40px_1fr_auto_auto] items-center gap-3 p-4"
                  >
                    <div
                      className="font-display font-bold text-[18px] sm:text-[20px] tabular-nums"
                      style={{
                        color:
                          idx === 0
                            ? accent
                            : idx < 3
                              ? "#0A0A0A"
                              : "#A3A3A3",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: r.builder.gradient }}
                      >
                        {r.builder.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold tracking-[-0.005em] text-black truncate">
                          {r.builder.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {r.brief_title}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <FingerprintGlyph fingerprint={r.fingerprint} size={32} />
                    </div>
                    <div className="text-right">
                      <div
                        className="font-display font-bold text-[20px] leading-none tabular-nums"
                        style={{
                          color:
                            r.composite_score >= 80 ? accent : "#0A0A0A",
                        }}
                      >
                        {r.composite_score}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500 mt-0.5">
                        {fingerprintTier(r.composite_score).label}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
