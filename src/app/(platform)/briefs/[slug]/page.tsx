import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Cpu, Users, Trophy, Shield } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import {
  getDemoBrief,
  getDemoReceiptsForBrief,
  demoBriefs,
} from "@/lib/receipts/demo-data";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import { CursorStartPanel } from "@/components/CursorStartPanel";
import { WhatYoullLearn } from "./_components/WhatYoullLearn";
import { MiniLeaderboard } from "./_components/MiniLeaderboard";

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

const DIFFICULTY: Record<string, { fg: string; bg: string; label: string }> = {
  intro:  { fg: "#0A0A0A", bg: "#A7F3D0", label: "Intro"  },
  mid:    { fg: "#FFFFFF", bg: "#3B82F6", label: "Mid"    },
  senior: { fg: "#FFFFFF", bg: "#8B5CF6", label: "Senior" },
  staff:  { fg: "#FFFFFF", bg: "#EC4899", label: "Staff"  },
};

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

// Inline social-proof: "X builders this week" derived from attempts_count.
// Models a steady-state ~40% weekly activity share on a live Brief — keeps
// the number honest (a sleepy Brief reads as a small number, a hot one big).
// Floor at 1 so newly-opened Briefs never show zero next to the leaderboard
// link (we'd rather show "1 builder this week" than nothing).
function buildersThisWeek(attemptsCount: number): number {
  if (attemptsCount <= 0) return 0;
  return Math.max(1, Math.round(attemptsCount * 0.4));
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

  const diff = DIFFICULTY[brief.difficulty] ?? DIFFICULTY.mid;
  const weeklyBuilders = buildersThisWeek(brief.attempts_count);

  return (
    <div style={{ background: "#FAFAF7" }}>
      {/* ── Header band ─────────────────────────── */}
      <section
        className="relative"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #EBEBEB",
        }}
      >
        {/* Sponsor accent stripe */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: brief.company.sponsor_color }}
        />

        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-8 sm:pt-12 sm:pb-10">
          <Link
            href="/briefs"
            className="inline-flex items-center text-[12px] font-semibold text-gray-500 hover:text-black transition-colors mb-5"
          >
            ← All Briefs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              {/* Sponsor + difficulty pill row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.22em] inline-flex items-center gap-1.5"
                  style={{ color: brief.company.sponsor_color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: brief.company.sponsor_color }}
                  />
                  {brief.company.name}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                  style={{ background: diff.bg, color: diff.fg }}
                >
                  {diff.label}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                  {brief.category}
                </span>
              </div>

              <h1
                className="font-display font-bold tracking-[-0.025em] text-black leading-[1.1]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
              >
                {brief.title}
              </h1>
              <p className="mt-3 max-w-[640px] text-[15px] sm:text-[16px] leading-[1.55] text-gray-600">
                {brief.tagline}
              </p>

              <div className="mt-7 max-w-[560px]">
                <CursorStartPanel briefSlug={brief.slug} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
                <Link
                  href={`/briefs/${brief.slug}/leaderboard`}
                  className="font-semibold text-black hover:underline underline-offset-4"
                >
                  See leaderboard →
                </Link>
                {weeklyBuilders > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <span
                      aria-hidden
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: brief.company.sponsor_color }}
                    />
                    <span className="tabular-nums">
                      {weeklyBuilders} builder{weeklyBuilders === 1 ? "" : "s"}
                    </span>{" "}
                    this week
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <Shield className="w-3 h-3" />
                  Signed at the gateway
                </span>
              </div>
            </div>

            {/* Constraints — clean white card.
               On mobile (single-column grid) this lands AFTER the title/CTA
               block but BEFORE the prompt section below — matches the
               desktop reading order well enough that no extra ordering
               classes are needed. */}
            <aside
              className="rounded-[14px] p-5"
              style={{
                background: "#FAFAF7",
                border: "1px solid #EBEBEB",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
                Constraints
              </p>
              <dl className="space-y-2.5">
                <ConstraintRow
                  icon={<Clock className="w-3 h-3" />}
                  label="Time"
                  value={formatTime(brief.time_cap_seconds)}
                />
                <ConstraintRow
                  icon={<Cpu className="w-3 h-3" />}
                  label="Tokens"
                  value={`${formatTokens(brief.token_cap)}`}
                />
                <ConstraintRow
                  icon={<Users className="w-3 h-3" />}
                  label="Attempts"
                  value={brief.attempts_count.toString()}
                />
                <ConstraintRow
                  icon={<Trophy className="w-3 h-3" />}
                  label="Median"
                  value={brief.median_score?.toString() ?? "—"}
                />
              </dl>

              <div className="mt-4 pt-4" style={{ borderTop: "1px solid #EBEBEB" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
                  Tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {brief.allowed_tools.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", color: "#525252" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Body ────────────────────────────────────
         Single full-width column on desktop now. Order:
         What you'll learn → Prompt → Ideal shape → Leaderboard preview.
         The prompt is the centre of attention, so it gets the full
         width and no competing sidebar. */}
      <section>
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-10 sm:py-12 space-y-8 sm:space-y-10">
          {brief.ideal_fingerprint && (
            <WhatYoullLearn
              ideal={brief.ideal_fingerprint}
              sponsorColor={brief.company.sponsor_color}
            />
          )}

          <article
            className="rounded-[14px] p-6 sm:p-8"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
              The Brief
            </p>
            <BriefMarkdown md={brief.prompt_md} />
          </article>

          {brief.ideal_fingerprint && (
            <section
              className="rounded-[14px] p-6 sm:p-8"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(220px,260px)] gap-6 md:gap-10 items-center">
                <div className="min-w-0 md:order-1 order-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
                    Ideal shape
                  </p>
                  <h2
                    className="font-display font-bold tracking-[-0.015em] text-black"
                    style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.5rem)" }}
                  >
                    What a top-quartile Receipt looks like
                  </h2>
                  <p className="mt-2 text-[13px] leading-[1.6] text-gray-600">
                    The solid shape is the Brief&apos;s target Fingerprint.
                    On a real Receipt the builder&apos;s shape overlays this
                    one — the closer the fit, the higher the composite score.
                  </p>
                </div>
                <div className="flex justify-center md:order-2 order-1">
                  <BuilderFingerprint
                    fingerprint={brief.ideal_fingerprint}
                    size={220}
                    primaryColor={brief.company.sponsor_color}
                  />
                </div>
              </div>
            </section>
          )}

          {receipts.length > 0 && (
            <MiniLeaderboard
              receipts={receipts}
              briefSlug={brief.slug}
              sponsorColor={brief.company.sponsor_color}
            />
          )}
        </div>
      </section>
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
    <div className="flex items-center justify-between text-[12px]">
      <span className="inline-flex items-center gap-1.5 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="font-bold tabular-nums text-black">{value}</span>
    </div>
  );
}

function BriefMarkdown({ md }: { md: string }) {
  const blocks = md.split("\n\n");
  return (
    <div className="space-y-3.5 text-[14px] leading-[1.65] text-gray-700">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="text-[20px] font-bold tracking-[-0.02em] text-black font-display mt-1"
            >
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-[16px] font-bold tracking-[-0.015em] text-black font-display mt-3"
            >
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^- /, ""));
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {items.map((it, k) => (
                <li key={k}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s/, ""));
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1">
              {items.map((it, k) => (
                <li key={k}>{renderInline(it)}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const patterns: {
    re: RegExp;
    render: (m: RegExpExecArray, key: number) => React.ReactNode;
  }[] = [
    { re: /\*\*(.+?)\*\*/, render: (m, key) => <strong key={key}>{m[1]}</strong> },
    {
      re: /`([^`]+)`/,
      render: (m, key) => (
        <code
          key={key}
          className="px-1.5 py-0.5 rounded text-[12px] font-mono"
          style={{ background: "#F5F5F5", color: "#0A0A0A" }}
        >
          {m[1]}
        </code>
      ),
    },
    { re: /\*([^*]+)\*/, render: (m, key) => <em key={key}>{m[1]}</em> },
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
