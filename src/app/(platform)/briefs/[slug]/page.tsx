import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Users, Trophy, Zap, Shield, Cpu } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import {
  getDemoBrief,
  getDemoReceiptsForBrief,
  demoBriefs,
} from "@/lib/receipts/demo-data";
import { BuilderFingerprint, FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";

export async function generateStaticParams() {
  return demoBriefs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brief = getDemoBrief(slug);
  if (!brief) {
    return { title: "Brief not found", robots: { index: false, follow: true } };
  }
  const path = `/briefs/${slug}`;
  const title = `${brief.title} — ${brief.company.name} Brief`;
  const description = brief.tagline;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({
      title,
      description,
      path,
      image: ogImageUrl({
        title: brief.title,
        subtitle: `${brief.sponsor_label} · ${brief.attempts_count} attempts · median ${brief.median_score ?? "—"}`,
        eyebrow: "Antry Brief",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

function formatTime(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m - h * 60;
  return rest > 0 ? `${h}h ${rest}m` : `${h}h`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brief = getDemoBrief(slug);
  if (!brief) notFound();

  const receipts = getDemoReceiptsForBrief(brief.id).sort(
    (a, b) => b.composite_score - a.composite_score
  );

  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ─────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${brief.company.sponsor_color}24 0%, transparent 55%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative mx-auto max-w-[1080px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
            <Link
              href="/briefs"
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] mb-6 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ← All Briefs
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-start">
              <div>
                {brief.sponsor_label && (
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
                    style={{ color: brief.company.sponsor_color }}
                  >
                    {brief.sponsor_label}
                  </p>
                )}
                <h1
                  className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em]"
                  style={{ color: "#FFFFFF" }}
                >
                  {brief.title}
                </h1>
                <p
                  className="mt-6 max-w-[620px] text-[16px] sm:text-[17px] leading-[1.6]"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {brief.tagline}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/briefs/${brief.slug}/lab`}
                    className="inline-flex items-center justify-center gap-2 rounded-[14px] px-5 h-[52px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                    style={{
                      background: "#C6F135",
                      color: "#0A0A0A",
                      boxShadow: "0 8px 24px rgba(198,241,53,0.35)",
                    }}
                  >
                    Enter the Lab <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span
                    className="text-[13px] inline-flex items-center gap-1.5"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Instrumented sandbox · trace stays private until you mint
                  </span>
                </div>
              </div>

              {/* Constraints panel */}
              <div
                className="rounded-[20px] p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Constraints
                </p>
                <dl className="space-y-3.5">
                  <ConstraintRow
                    icon={<Clock className="w-3.5 h-3.5" />}
                    label="Time cap"
                    value={formatTime(brief.time_cap_seconds)}
                  />
                  <ConstraintRow
                    icon={<Cpu className="w-3.5 h-3.5" />}
                    label="Token cap"
                    value={`${formatTokens(brief.token_cap)} tokens`}
                  />
                  <ConstraintRow
                    icon={<Users className="w-3.5 h-3.5" />}
                    label="Attempts"
                    value={brief.attempts_count.toString()}
                  />
                  <ConstraintRow
                    icon={<Trophy className="w-3.5 h-3.5" />}
                    label="Median score"
                    value={brief.median_score?.toString() ?? "—"}
                  />
                  <ConstraintRow
                    icon={<Zap className="w-3.5 h-3.5" />}
                    label="Difficulty"
                    value={brief.difficulty.charAt(0).toUpperCase() + brief.difficulty.slice(1)}
                  />
                </dl>

                <div className="mt-5 pt-5 border-t border-white/10">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Allowed tools
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brief.allowed_tools.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-mono px-2 py-1 rounded-md"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ─────────────────────────────── */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12 items-start">
              {/* Brief markdown */}
              <article
                className="rounded-[24px] p-7 sm:p-9 bg-white"
                style={{
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-3">
                  The Brief
                </p>
                <BriefMarkdown md={brief.prompt_md} />
              </article>

              {/* Ideal fingerprint sidebar */}
              <aside className="lg:sticky lg:top-24">
                {brief.ideal_fingerprint && (
                  <div
                    className="rounded-[24px] p-6 bg-white"
                    style={{
                      border: "1px solid #EBEBEB",
                      boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                      Ideal candidate
                    </p>
                    <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black mb-4">
                      What a top quartile shape looks like
                    </h3>
                    <div className="flex justify-center">
                      <BuilderFingerprint
                        fingerprint={brief.ideal_fingerprint}
                        size={260}
                        primaryColor={brief.company.sponsor_color}
                      />
                    </div>
                    <p className="mt-4 text-[12px] text-gray-500 leading-relaxed">
                      Companies see this shape before you start. The dashed outline on your
                      Receipt shows how close you came.
                    </p>
                  </div>
                )}

                <div
                  className="mt-5 rounded-[20px] p-5"
                  style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                    Sponsor
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px]"
                      style={{
                        background: brief.company.sponsor_color,
                        color: brief.company.sponsor_color === "#0A0A0A" || brief.company.sponsor_color === "#000000" ? "#C6F135" : "#FFFFFF",
                      }}
                    >
                      {brief.company.name.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/c/${brief.company.slug}`}
                        className="text-[14px] font-bold text-black hover:underline"
                      >
                        {brief.company.name}
                      </Link>
                      <p className="text-[12px] text-gray-500">authored this Brief</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Leaderboard ─────────────────────── */}
        {receipts.length > 0 && (
          <section style={{ background: "#FAFAF7" }}>
            <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-20 sm:py-24">
              <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Receipts
                  </p>
                  <h2 className="mt-2 text-[clamp(1.6rem,3.5vw,2.2rem)] font-bold tracking-[-0.025em] text-black">
                    Top fingerprints on this Brief
                  </h2>
                </div>
                <span className="text-[13px] text-gray-500">{receipts.length} public Receipts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {receipts.map((r) => {
                  const tier = fingerprintTier(r.composite_score);
                  return (
                    <Link
                      key={r.id}
                      href={`/receipts/${r.id}`}
                      className="group rounded-[20px] p-5 bg-white transition-all duration-300 hover:-translate-y-1"
                      style={{
                        border: "1px solid #EBEBEB",
                        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <FingerprintGlyph
                            fingerprint={r.fingerprint}
                            size={120}
                            primaryColor={brief.company.sponsor_color}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded"
                              style={{ background: tier.bg, color: tier.color }}
                            >
                              {tier.label}
                            </span>
                            <span className="text-[12px] font-bold tabular-nums text-gray-700">
                              {r.composite_score}
                            </span>
                          </div>
                          <p className="text-[15px] font-bold tracking-[-0.01em] text-black truncate">
                            {r.builder.name}
                          </p>
                          <p className="text-[12px] text-gray-500">@{r.builder.username}</p>
                          <p className="mt-3 text-[11px] text-gray-500 line-clamp-2">
                            {r.highlights[0]}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function ConstraintRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="inline-flex items-center gap-2" style={{ color: "rgba(255,255,255,0.55)" }}>
        {icon}
        {label}
      </span>
      <span className="font-bold tabular-nums" style={{ color: "#FFFFFF" }}>
        {value}
      </span>
    </div>
  );
}

// Lightweight markdown renderer — handles headings, lists, paragraphs, bold, code, em.
function BriefMarkdown({ md }: { md: string }) {
  const blocks = md.split("\n\n");
  return (
    <div className="space-y-4 text-[15px] leading-[1.7] text-gray-700">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="text-[24px] font-bold tracking-[-0.02em] text-black font-display mt-2">
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-[18px] font-bold tracking-[-0.015em] text-black font-display mt-4"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^- /, ""));
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {items.map((it, k) => (
                <li key={k} dangerouslySetInnerHTML={{ __html: inlineMd(it) }} />
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s/, ""));
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1.5">
              {items.map((it, k) => (
                <li key={k} dangerouslySetInnerHTML={{ __html: inlineMd(it) }} />
              ))}
            </ol>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: inlineMd(trimmed) }} />;
      })}
    </div>
  );
}

function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-[13px]">$1</code>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
