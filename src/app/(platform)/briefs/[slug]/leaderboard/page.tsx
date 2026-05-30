import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy, Shield, Zap } from "lucide-react";
import { getDemoBrief, getDemoReceiptsForBrief } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";

type PageProps = { params: Promise<{ slug: string }> };

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
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          {receipts.length === 0 ? (
            <div
              className="rounded-[14px] px-6 py-10 text-center"
              style={{ background: "#FAFAF7", border: "1px dashed #EBEBEB" }}
            >
              <Trophy
                className="w-6 h-6 mx-auto mb-3"
                style={{ color: accent }}
              />
              <p className="text-[14px] text-gray-600">
                No public Receipts yet. Be the first.
              </p>
              <Link
                href={`/briefs/${slug}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                Start in Cursor
              </Link>
            </div>
          ) : (
            <ol className="space-y-2">
              {receipts.map((r, idx) => (
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
                          @{r.builder.username} ·{" "}
                          {new Date(r.signed_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
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
                          color: r.composite_score >= 80 ? accent : "#0A0A0A",
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

          <div
            className="mt-8 rounded-[14px] p-5 flex items-center gap-4 flex-wrap"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "#0A0A0A" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#C6F135" }} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-[14px] font-bold tracking-[-0.005em] text-black">
                Compete on this Brief
              </h3>
              <p className="mt-0.5 text-[12px] leading-[1.5] text-gray-600">
                Install Antry MCP in Cursor, run{" "}
                <code className="font-mono text-black">
                  start_attempt(&quot;{slug}&quot;)
                </code>
                .
              </p>
            </div>
            <Link
              href={`/briefs/${slug}`}
              className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
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
