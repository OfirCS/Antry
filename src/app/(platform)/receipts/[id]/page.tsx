import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Droplet,
  ExternalLink,
  Leaf,
  Share2,
  ShieldCheck,
  Sparkles,
  Twitter,
  Zap,
} from "lucide-react";
import {
  co2EquivalentLine,
  energyEquivalentLine,
  type ComputeFootprint,
} from "@/lib/receipts/compute-footprint";
import { CountUp } from "@/components/design/CountUp";
import { Tooltip } from "@/components/design/Tooltip";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import {
  getDemoReceipt,
  getDemoBrief,
  demoReceipts,
} from "@/lib/receipts/demo-data";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import {
  fingerprintTier,
  ALL_DIMENSIONS,
} from "@/lib/receipts/fingerprint";
import {
  DIMENSION_LABELS,
  DIMENSION_BLURB,
  DIMENSION_ANTAGONIST,
} from "@/lib/receipts/types";

export async function generateStaticParams() {
  return demoReceipts.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = getDemoReceipt(id);
  if (!r) return { title: "Receipt not found", robots: { index: false, follow: true } };
  const path = `/receipts/${id}`;
  const tier = fingerprintTier(r.composite_score);
  const title = `${r.builder.name}'s Receipt · ${r.brief_title}`;
  const description = `${tier.label} · composite ${r.composite_score} · ${r.tokens_spent.toLocaleString()} tokens · sponsored by ${r.company.name}.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({
      title,
      description,
      path,
      image: ogImageUrl({
        title: `${r.builder.name} · ${r.composite_score}`,
        subtitle: `${r.brief_title} — ${r.company.name} Brief · ${tier.label}`,
        eyebrow: "Antry Receipt",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = getDemoReceipt(id);
  if (!r) notFound();
  const brief = getDemoBrief(r.brief_slug);
  const tier = fingerprintTier(r.composite_score);
  const signedAt = new Date(r.signed_at);

  return (
    <>
      <Nav />
      <main>
        <ReceiptHero
          builder={r.builder}
          companyColor={r.company.sponsor_color}
          companyName={r.company.name}
          briefTitle={r.brief_title}
          tier={tier}
          composite={r.composite_score}
          signedAt={signedAt}
        />

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-24 sm:-mt-28 pb-24 relative z-10">
            {/* Main fingerprint card */}
            <div
              className="rounded-[28px] bg-white overflow-hidden"
              style={{
                border: "1px solid #EBEBEB",
                boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 32px 64px -32px rgba(0,0,0,0.12)",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
                {/* Fingerprint */}
                <div className="p-6 sm:p-8 flex flex-col items-center justify-center" style={{ background: "#FAFAF7", borderRight: "1px solid #EBEBEB" }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
                    Builder Fingerprint
                  </p>
                  <p className="text-[12px] text-gray-500 mb-6">
                    Solid line: this Receipt · Dashed: Brief&apos;s ideal shape
                  </p>
                  <BuilderFingerprint
                    fingerprint={r.fingerprint}
                    ideal={brief?.ideal_fingerprint}
                    size={340}
                    primaryColor={r.company.sponsor_color}
                    idealColor="#0A0A0A"
                  />
                </div>

                {/* Highlights + meters */}
                <div className="p-6 sm:p-8 lg:p-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
                    What this Receipt shows
                  </p>
                  <ul className="space-y-3.5">
                    {r.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: r.company.sponsor_color }}
                        >
                          <CheckCircle2 className="w-3 h-3" style={{ color: "#FFFFFF" }} />
                        </div>
                        <p className="text-[14px] leading-[1.55] text-gray-700">{h}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    <Stat
                      icon={<Cpu className="w-3.5 h-3.5" />}
                      label="Tokens"
                      value={r.tokens_spent.toLocaleString()}
                    />
                    <Stat
                      icon={<Clock className="w-3.5 h-3.5" />}
                      label="Duration"
                      value={`${Math.round(r.attempt_duration_seconds / 60)}m`}
                    />
                    <Stat
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                      label="Cost"
                      value={`$${(r.cost_usd_cents / 100).toFixed(2)}`}
                    />
                  </div>

                  <ShareRow receiptId={r.id} brief={r.brief_title} score={r.composite_score} />
                </div>
              </div>
            </div>

            {/* Dimension breakdown — score + 1-line label, blurb on hover */}
            <div className="mt-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
                Dimension breakdown
              </p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-bold tracking-[-0.025em] text-black leading-[1.1]">
                Each axis. The score.
              </h2>
              <p className="mt-3 text-[13px] text-gray-500">
                Hover any card for the formula and antagonist.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_DIMENSIONS.map((d) => {
                  const score = r.fingerprint[d];
                  const dimTier = fingerprintTier(score);
                  const antagonist = DIMENSION_ANTAGONIST[d];
                  return (
                    <Tooltip
                      key={d}
                      className="block w-full"
                      content={
                        <>
                          <p className="font-bold text-[12px] mb-1 text-white">
                            {DIMENSION_LABELS[d]}
                          </p>
                          <p className="text-white/80 leading-[1.5]">
                            {DIMENSION_BLURB[d]}
                          </p>
                          {antagonist && (
                            <p className="mt-2 text-[11px] text-white/55">
                              Antagonist: {DIMENSION_LABELS[antagonist]}
                            </p>
                          )}
                        </>
                      }
                    >
                      <div
                        className="rounded-[16px] p-4 bg-white w-full transition-transform duration-200 hover:-translate-y-0.5"
                        style={{
                          border: "1px solid #EBEBEB",
                          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                        }}
                      >
                        <div className="flex items-baseline justify-between gap-3 mb-2.5">
                          <p
                            className="text-[28px] font-bold tracking-tight font-display tabular-nums"
                            style={{ color: "#0A0A0A", lineHeight: 1 }}
                          >
                            <CountUp to={score} durationMs={900} />
                          </p>
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                            style={{ background: dimTier.bg, color: dimTier.color }}
                          >
                            {dimTier.label}
                          </span>
                        </div>
                        <div
                          className="h-1 rounded-full overflow-hidden mb-2"
                          style={{ background: "#F5F5F5" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${score}%`,
                              background: r.company.sponsor_color,
                            }}
                          />
                        </div>
                        <p className="text-[12px] font-semibold tracking-[-0.005em] text-black">
                          {DIMENSION_LABELS[d]}
                        </p>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Compute footprint — what this trace burned */}
            {r.compute_footprint && (
              <div className="mt-12">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
                  Compute footprint
                </p>
                <h2
                  className="font-display font-bold tracking-[-0.025em] text-black leading-[1.1] mb-6"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}
                >
                  How much energy this trace burned.
                </h2>
                <ComputeFootprintGrid footprint={r.compute_footprint} />
              </div>
            )}

            {/* Verification block */}
            <div className="mt-10">
              <div
                className="rounded-[20px] p-6 sm:p-7"
                style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#0A0A0A" }}
                  >
                    <ShieldCheck className="w-4 h-4" style={{ color: "#C6F135" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      Receipt integrity
                    </p>
                    <p className="mt-1 text-[15px] font-bold tracking-[-0.01em] text-black">
                      Signed by Antry · verifiable on-demand
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                      <KV label="Receipt ID" value={r.id} mono />
                      <KV label="Content hash" value={r.content_hash} mono />
                      <KV label="Signed at" value={signedAt.toLocaleString()} />
                      <KV label="Visibility" value={r.trace_visibility} />
                    </div>
                  </div>
                  <Link
                    href={`/api/v1/receipts/${r.id}/verify`}
                    className="inline-flex items-center gap-1.5 rounded-[12px] px-4 h-[40px] text-[12px] font-semibold whitespace-nowrap"
                    style={{ background: "#0A0A0A", color: "#fff" }}
                  >
                    Verify <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
              <CTACard
                eyebrow="See the Brief"
                title={r.brief_title}
                desc={`From ${r.company.name}. Anyone can attempt it.`}
                href={`/briefs/${r.brief_slug}`}
                cta="Open Brief"
                tone="light"
              />
              <CTACard
                eyebrow="Want one of these?"
                title="Earn your own Receipt."
                desc="Pick a Brief, enter the Lab, mint your Fingerprint."
                href="/briefs"
                cta="Browse Briefs"
                tone="dark"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ReceiptHero({
  builder,
  companyColor,
  companyName,
  briefTitle,
  tier,
  composite,
  signedAt,
}: {
  builder: { username: string; name: string; gradient: string };
  companyColor: string;
  companyName: string;
  briefTitle: string;
  tier: { label: string; color: string; bg: string };
  composite: number;
  signedAt: Date;
}) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${companyColor}26 0%, transparent 55%)`,
        }}
      />
      <div className="relative mx-auto max-w-[1080px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <Link
            href="/briefs"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] hover:opacity-80 transition-opacity"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Briefs
          </Link>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Antry Receipt · {signedAt.toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-10 items-center">
          <div
            className="w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-[28px] font-bold font-display"
            style={{
              background: builder.gradient,
              color: "#FFFFFF",
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.4)",
            }}
          >
            {builder.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em] mb-2"
              style={{ color: companyColor }}
            >
              {companyName} Brief · 001
            </p>
            <h1
              className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em]"
              style={{ color: "#FFFFFF" }}
            >
              <Link
                href={`/builders/${builder.username}`}
                className="hover:opacity-90 transition-opacity"
              >
                {builder.name}
              </Link>{" "}
              shipped <span style={{ color: "#C6F135" }}>{briefTitle}</span>
            </h1>
            <p
              className="mt-3 text-[14px]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              @{builder.username}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center sm:items-end">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-md mb-2"
              style={{ background: tier.bg, color: tier.color }}
            >
              {tier.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className="font-bold tracking-tight font-display tabular-nums"
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
                  lineHeight: 0.95,
                }}
              >
                <CountUp to={composite} durationMs={1100} />
              </span>
              <span
                className="text-[14px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                / 100
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl p-3 bg-[#FAFAF7] border border-gray-100">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-[16px] font-bold tabular-nums text-black">{value}</p>
    </div>
  );
}

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p>
      <p
        className={`mt-0.5 text-gray-700 truncate ${mono ? "font-mono text-[11px]" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function ComputeFootprintGrid({ footprint }: { footprint: ComputeFootprint }) {
  // Energy is in kWh — show in Wh when small for readability.
  const energyWh = footprint.energy_kwh * 1000;
  const energyShowsKwh = footprint.energy_kwh >= 1;
  const wallSec = footprint.wall_clock_seconds;
  const wallMin = Math.floor(wallSec / 60);
  const wallRem = wallSec % 60;

  const cells: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    sub: string;
    tint: string;
  }[] = [
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Energy",
      value: energyShowsKwh ? (
        <>
          <CountUp to={footprint.energy_kwh} durationMs={900} decimals={2} /> kWh
        </>
      ) : (
        <>
          <CountUp to={energyWh} durationMs={900} decimals={1} /> Wh
        </>
      ),
      sub: energyEquivalentLine(footprint.energy_kwh),
      tint: "#C6F135",
    },
    {
      icon: <Leaf className="w-4 h-4" />,
      label: "CO₂",
      value:
        footprint.co2_grams >= 1000 ? (
          <>
            <CountUp
              to={footprint.co2_grams / 1000}
              durationMs={900}
              decimals={2}
            />{" "}
            kg
          </>
        ) : (
          <>
            <CountUp
              to={footprint.co2_grams}
              durationMs={900}
              decimals={1}
            />{" "}
            g
          </>
        ),
      sub: co2EquivalentLine(footprint.co2_grams),
      tint: "#22C55E",
    },
    {
      icon: <Droplet className="w-4 h-4" />,
      label: "Water (cooling)",
      value: (
        <>
          <CountUp to={footprint.water_litres} durationMs={900} decimals={2} /> L
        </>
      ),
      sub: "data-centre cooling proxy",
      tint: "#06B6D4",
    },
    {
      icon: <Code2 className="w-4 h-4" />,
      label: "Lines of code",
      value: <CountUp to={footprint.lines_of_code} durationMs={900} />,
      sub: `${footprint.constants.tokens_per_loc} tokens/line, est.`,
      tint: "#A78BFA",
    },
    {
      icon: <Cpu className="w-4 h-4" />,
      label: "Tokens",
      value: <CountUp to={footprint.total_tokens} durationMs={1000} />,
      sub: `${footprint.input_tokens.toLocaleString()} in · ${footprint.output_tokens.toLocaleString()} out`,
      tint: "#0A0A0A",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Wall-clock",
      value: (
        <>
          <CountUp to={wallMin} durationMs={800} />m{" "}
          <CountUp to={wallRem} durationMs={800} />s
        </>
      ),
      sub: `peak ~${footprint.peak_memory_mb} MB`,
      tint: "#F59E0B",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Total cost",
      value: (
        <>
          $
          <CountUp
            to={footprint.cost_usd_cents / 100}
            durationMs={1000}
            decimals={2}
          />
        </>
      ),
      sub: "API + Antry overhead",
      tint: "#EC4899",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-[16px] p-4 bg-white"
            style={{ border: "1px solid #EBEBEB" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-7 h-7 rounded-md inline-flex items-center justify-center"
                style={{
                  background: c.tint === "#0A0A0A" ? "rgba(10,10,10,0.08)" : `${c.tint}1F`,
                  color: c.tint === "#0A0A0A" ? "#0A0A0A" : c.tint,
                }}
              >
                {c.icon}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                {c.label}
              </p>
            </div>
            <p className="text-[20px] font-bold tracking-[-0.015em] text-black tabular-nums leading-none">
              {c.value}
            </p>
            <p className="mt-2 text-[11px] text-gray-500 leading-[1.45]">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed max-w-[640px]">
        Estimates from gateway telemetry. Grid intensity{" "}
        <span className="font-mono">
          {footprint.constants.co2_grams_per_kwh}g CO₂/kWh
        </span>
        , LOC at{" "}
        <span className="font-mono">
          {footprint.constants.tokens_per_loc} tokens/line
        </span>
        . Full methodology on{" "}
        <Link href="/receipts/methodology" className="underline">
          /receipts/methodology
        </Link>
        .
      </p>
    </>
  );
}

function ShareRow({
  receiptId,
  brief,
  score,
}: {
  receiptId: string;
  brief: string;
  score: number;
}) {
  const shareText = encodeURIComponent(
    `I just minted a ${score} on the ${brief} Antry Brief. Show your receipts → `
  );
  const shareUrl = encodeURIComponent(`https://antry.com/receipts/${receiptId}`);
  const xLink = `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  return (
    <div className="mt-7 pt-6 border-t border-gray-100 flex items-center gap-3 flex-wrap">
      <a
        href={xLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-[12px] px-4 h-[40px] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: "#0A0A0A", color: "#fff" }}
      >
        <Twitter className="w-3.5 h-3.5" />
        Post on X
      </a>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-[12px] px-4 h-[40px] text-[13px] font-semibold border border-gray-200 hover:border-gray-400 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Copy embed
      </button>
    </div>
  );
}

function CTACard({
  eyebrow,
  title,
  desc,
  href,
  cta,
  tone,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  tone: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <Link
      href={href}
      className="group relative rounded-[24px] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: isDark ? "#0A0A0A" : "#FAFAF7",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #EBEBEB",
        color: isDark ? "#fff" : "#111",
      }}
    >
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px] overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(198,241,53,0.12) 0%, transparent 60%)",
          }}
        />
      )}
      <p
        className="relative text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
        style={{ color: isDark ? "#C6F135" : "rgba(0,0,0,0.55)" }}
      >
        {eyebrow}
      </p>
      <h3 className="relative text-[17px] sm:text-[18px] font-bold tracking-[-0.015em]">{title}</h3>
      <p
        className="relative mt-1.5 text-[13px] leading-[1.55]"
        style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" }}
      >
        {desc}
      </p>
      <p
        className="relative mt-4 text-[13px] font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
        style={{ color: isDark ? "#C6F135" : "#0A0A0A" }}
      >
        {cta} →
      </p>
    </Link>
  );
}
