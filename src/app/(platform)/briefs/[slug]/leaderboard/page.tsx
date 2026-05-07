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

  return (
    <main style={{ background: "#0A0A0A" }} className="min-h-screen">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(198,241,53,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px] px-6 sm:px-10 pt-14 pb-10">
          <Link
            href={`/briefs/${slug}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-7 transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Brief
          </Link>

          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-5 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Trophy className="w-3.5 h-3.5" style={{ color: "#C6F135" }} />
            Live leaderboard
          </p>
          <h1
            className="font-display font-bold leading-[0.96] tracking-[-0.04em] text-white"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
          >
            {brief.title}
          </h1>
          <div
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <span>
              <span className="text-white font-bold">
                {brief.attempts_count}
              </span>{" "}
              attempts
            </span>
            <span>
              <span className="text-white font-bold">
                {brief.receipts_count}
              </span>{" "}
              Receipts minted
            </span>
            <span>
              Median{" "}
              <span className="text-white font-bold">
                {brief.median_score ?? "—"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              All entries signed
            </span>
          </div>
        </div>
      </section>

      <section
        className="pb-24"
        style={{
          background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)",
        }}
      >
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          {receipts.length === 0 ? (
            <div
              className="rounded-[20px] p-10 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                No public Receipts yet. Be the first to mint one.
              </p>
              <Link
                href={`/briefs/${slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: "#C6F135", color: "#0A0A0A" }}
                data-cta="lime"
              >
                Start in Cursor
              </Link>
            </div>
          ) : (
            <ol className="space-y-2.5">
              {receipts.map((r, idx) => (
                <li
                  key={r.id}
                  className="rounded-[18px] p-5 transition-colors hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${idx === 0 ? "rgba(198,241,53,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <Link
                    href={`/receipts/${r.id}`}
                    className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[48px_1fr_auto_auto] items-center gap-4"
                  >
                    <div
                      className="font-display font-bold text-[20px] sm:text-[24px]"
                      style={{
                        color:
                          idx === 0
                            ? "#C6F135"
                            : idx < 3
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                          style={{ background: r.builder.gradient }}
                        >
                          {r.builder.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold tracking-[-0.005em] text-white truncate">
                            {r.builder.name}
                          </div>
                          <div
                            className="text-[11px] truncate"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            @{r.builder.username} ·{" "}
                            {new Date(r.signed_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <FingerprintGlyph fingerprint={r.fingerprint} size={36} />
                    </div>

                    <div className="text-right">
                      <div
                        className="font-display font-bold text-[24px] leading-none"
                        style={{
                          color:
                            r.composite_score >= 80
                              ? "#C6F135"
                              : r.composite_score >= 60
                                ? "rgba(255,255,255,0.9)"
                                : "rgba(255,255,255,0.55)",
                        }}
                      >
                        {r.composite_score}
                      </div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-[0.18em] mt-0.5"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {fingerprintTier(r.composite_score).label}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <div
            className="mt-12 rounded-[20px] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-5"
            style={{
              background: "rgba(198,241,53,0.06)",
              border: "1px solid rgba(198,241,53,0.3)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "#0A0A0A" }}
            >
              <Zap className="w-5 h-5" style={{ color: "#C6F135" }} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.01em] text-white">
                Compete on this Brief
              </h3>
              <p
                className="mt-1 text-[13px] leading-[1.55] max-w-[480px]"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Install Antry MCP in Cursor, run{" "}
                <code className="font-mono text-white">
                  start_attempt(&quot;{slug}&quot;)
                </code>
                , and your Receipt will join this leaderboard the moment you
                submit.
              </p>
            </div>
            <Link
              href={`/briefs/${slug}`}
              className="inline-flex items-center gap-2 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 self-start sm:self-center"
              style={{ background: "#C6F135", color: "#0A0A0A" }}
              data-cta="lime"
            >
              Start in Cursor
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
