import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, Trophy, Zap, Shield, Cpu } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import {
  getDemoBrief,
  getDemoReceiptsForBrief,
  demoBriefs,
} from "@/lib/receipts/demo-data";
import { BuilderFingerprint, FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { CursorStartPanel } from "@/components/CursorStartPanel";

// Briefs are a fixed demo set with no creation UI — any slug outside this
// list is a real 404 (resolved at the routing layer, before streaming).
export const dynamicParams = false;

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
      <main className="bg-white">
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
          <div className="relative mx-auto max-w-[1080px] px-6 pt-14 pb-28 sm:px-10 sm:pt-18 sm:pb-32">
            <Link
              href="/briefs"
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] mb-6 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ← All Briefs
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_360px] gap-10 lg:gap-14 items-start">
              <div className="min-w-0">
                {brief.sponsor_label && (
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.22em] mb-4"
                    style={{ color: brief.company.sponsor_color }}
                  >
                    {brief.sponsor_label}
                  </p>
                )}
                <h1
                  className="font-display max-w-[760px] text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance"
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

                <div className="mt-8 grid max-w-[620px] grid-cols-1 gap-3 border-y border-white/10 py-4 sm:grid-cols-3">
                  <HeroStep number="1" label="Read constraints" />
                  <HeroStep number="2" label="Start in IDE" />
                  <HeroStep number="3" label="Mint Receipt" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                  <Link
                    href={`/briefs/${brief.slug}/leaderboard`}
                    className="font-semibold hover:underline underline-offset-4 transition-colors"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    See leaderboard →
                  </Link>
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Every step signed at the Antry gateway
                  </span>
                </div>
              </div>

              {/* Constraints panel */}
              <div className="space-y-4">
                <div
                  className="rounded-lg p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Attempt snapshot
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
                      value={brief.median_score?.toString() ?? "-"}
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
                <CursorStartPanel briefSlug={brief.slug} />
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
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
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
                      border: "1px solid #E5E7EB",
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
                  className="mt-5 rounded-lg p-5"
                  style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                    Sponsor
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-[14px]"
                      style={{
                        background: brief.company.sponsor_color,
                        color: brief.company.sponsor_color === "#0A0A0A" || brief.company.sponsor_color === "#000000" ? "#20F5A0" : "#FFFFFF",
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
          <section style={{ background: "#F7F8FA" }}>
            <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-20 sm:py-24">
              <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
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
                      className="group rounded-lg p-5 bg-white transition-all duration-300 hover:-translate-y-1"
                      style={{
                        border: "1px solid #E5E7EB",
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
  );
}

function HeroStep({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] font-semibold text-white/68">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/8 text-[11px] text-white">
        {number}
      </span>
      {label}
    </div>
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

// Safe lightweight markdown renderer. Returns React nodes — never uses
// dangerouslySetInnerHTML, so a Brief authored with raw <script> can't
// execute. Handles headings, lists, paragraphs, bold, inline code, em.
function BriefMarkdown({ md }: { md: string }) {
  const blocks = md.split("\n\n");
  return (
    <div className="space-y-4 text-[15px] leading-[1.7] text-gray-700">
      {blocks.flatMap((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith("# ")) {
          return [(
            <h1
              key={i}
              className="text-[24px] font-bold tracking-[-0.02em] text-black font-display mt-2"
            >
              {renderInline(trimmed.slice(2))}
            </h1>
          )];
        }
        if (trimmed.startsWith("## ")) {
          return [(
            <h2
              key={i}
              className="text-[18px] font-bold tracking-[-0.015em] text-black font-display mt-4"
            >
              {renderInline(trimmed.slice(3))}
            </h2>
          )];
        }
        if (trimmed.startsWith("```")) {
          const code = trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
          return [(
            <pre
              key={i}
              className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-4 text-[12px] leading-[1.55] text-gray-800"
            >
              <code>{code}</code>
            </pre>
          )];
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^- /, ""));
          return [(
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {items.map((it, k) => (
                <li key={k}>{renderInline(it)}</li>
              ))}
            </ul>
          )];
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s/, ""));
          return [(
            <ol key={i} className="list-decimal pl-5 space-y-1.5">
              {items.map((it, k) => (
                <li key={k}>{renderInline(it)}</li>
              ))}
            </ol>
          )];
        }
        return renderMixedBlock(trimmed, i);
      })}
    </div>
  );
}

function renderMixedBlock(block: string, blockIndex: number): React.ReactElement[] {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const nodes: React.ReactElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].replace(/^- /, ""));
        i += 1;
      }
      nodes.push(
        <ul key={`${blockIndex}-${i}-ul`} className="list-disc pl-5 space-y-1.5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i += 1;
      }
      nodes.push(
        <ol key={`${blockIndex}-${i}-ol`} className="list-decimal pl-5 space-y-1.5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    nodes.push(<p key={`${blockIndex}-${i}`}>{renderInline(line)}</p>);
    i += 1;
  }

  return nodes;
}

/**
 * Render inline markdown as React nodes — no dangerouslySetInnerHTML.
 * Tokens are tried in priority order so `**bold**` doesn't get eaten by `*em*`.
 */
function renderInline(text: string): React.ReactNode[] {
  const patterns: { re: RegExp; render: (m: RegExpExecArray, key: number) => React.ReactNode }[] = [
    {
      re: /\*\*(.+?)\*\*/,
      render: (m, key) => <strong key={key}>{m[1]}</strong>,
    },
    {
      re: /`([^`]+)`/,
      render: (m, key) => (
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-gray-100 text-[13px]"
        >
          {m[1]}
        </code>
      ),
    },
    {
      re: /\*([^*]+)\*/,
      render: (m, key) => <em key={key}>{m[1]}</em>,
    },
  ];

  function tokenize(src: string, keyBase = 0): React.ReactNode[] {
    let earliest: { pattern: typeof patterns[number]; match: RegExpExecArray } | null =
      null;
    for (const p of patterns) {
      const m = p.re.exec(src);
      if (m && (!earliest || m.index < earliest.match.index)) {
        earliest = { pattern: p, match: m };
      }
    }
    if (!earliest) return [src];
    const before = src.slice(0, earliest.match.index);
    const after = src.slice(earliest.match.index + earliest.match[0].length);
    return [
      ...(before ? [before] : []),
      earliest.pattern.render(earliest.match, keyBase),
      ...tokenize(after, keyBase + 1),
    ];
  }

  return tokenize(text);
}
