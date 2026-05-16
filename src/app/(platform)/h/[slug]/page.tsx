import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Trophy, Clock, Shield, ArrowRight, Code2 } from "lucide-react";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { getHackathonBySlug } from "@/lib/hackathons/store";
import { getDemoHackathon } from "@/lib/hackathons/demo";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Vibe Hackathon landing + live leaderboard.
 *
 * Looks up the hackathon by slug from the store (DB-backed when SUPABASE
 * is configured, in-memory otherwise — see src/lib/hackathons/store.ts).
 * If no record exists, falls back to a synthesized hackathon over the
 * first 3 demo Briefs so the page never 404s on a stale share URL.
 */

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

  // Look up real hackathon record (DB or in-memory). Fall back to the
  // built-in demo hackathons so /hackathons always links to a working page.
  const record = await getHackathonBySlug(slug);
  const demoHackathon = record ? null : getDemoHackathon(slug);
  const briefs = record
    ? demoBriefs.filter((b) => record.brief_ids.includes(b.id))
    : demoHackathon
      ? demoBriefs.filter((b) => demoHackathon.briefSlugs.includes(b.slug))
      : demoBriefs.slice(0, 3);
  const briefIds = new Set(briefs.map((b) => b.id));
  const headerName = record?.name ?? demoHackathon?.title ?? prettify(slug);
  const prize = record?.prize ?? demoHackathon?.prize;

  // Pull public Receipts across the bundled Briefs, ranked by composite.
  const receipts = demoReceipts
    .filter(
      (r) =>
        briefIds.has(r.brief_id) && r.display_visibility === "public"
    )
    .sort((a, b) => b.composite_score - a.composite_score);

  // De-dupe on builder username — show their best Receipt.
  const seen = new Set<string>();
  const board = receipts.filter((r) => {
    if (seen.has(r.builder.username)) return false;
    seen.add(r.builder.username);
    return true;
  });

  const totalMinutes = Math.round(
    briefs.reduce((s, b) => s + b.time_cap_seconds, 0) / 60
  );

  return (
    <main style={{ background: "#0A0A0A" }} className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(32,245,160,0.16) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px] px-6 sm:px-10 pt-16 pb-12">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-5 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#20F5A0" }} />
            Vibe Hackathon · Live
          </p>
          <h1
            className="font-display font-bold leading-[0.96] tracking-[-0.04em] text-white"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
          >
            {headerName}
          </h1>
          {prize && (
            <p
              className="mt-3 text-[14px] inline-flex items-center gap-2"
              style={{ color: "rgba(32,245,160,0.85)" }}
            >
              <Trophy className="w-3.5 h-3.5" />
              {prize}
            </p>
          )}
          <p
            className="mt-6 max-w-[640px] text-[15px] sm:text-[17px] leading-[1.6]"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {briefs.length} Briefs · {totalMinutes} minutes total time cap.
            Builders enter via Cursor + Antry MCP. Every submission is a
            signed Receipt and lands on the leaderboard below in real time.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-7 h-[56px] text-[15px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{
                background: "#20F5A0",
                color: "#0A0A0A",
                boxShadow: "0 12px 30px rgba(32,245,160,0.32)",
              }}
              data-cta="lime"
            >
              Install Antry MCP <ArrowRight className="w-4 h-4" />
            </Link>
            <span
              className="text-[13px] inline-flex items-center gap-1.5"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <Shield className="w-3.5 h-3.5" />
              All entries protocol-signed at the gateway
            </span>
          </div>
        </div>
      </section>

      {/* Briefs in this hack */}
      <section
        className="py-12 sm:py-16"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.22em] mb-5"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Briefs in this hack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {briefs.map((b) => (
              <Link
                key={b.id}
                href={`/briefs/${b.slug}`}
                className="rounded-lg p-5 transition-all hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Code2
                    className="w-3.5 h-3.5"
                    style={{ color: "#20F5A0" }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {b.difficulty}
                  </span>
                  <span
                    className="ml-auto text-[10px] inline-flex items-center gap-1"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {Math.round(b.time_cap_seconds / 60)}m
                  </span>
                </div>
                <h3 className="text-[14px] font-bold tracking-[-0.005em] text-white leading-[1.3]">
                  {b.title}
                </h3>
                <p
                  className="mt-1.5 text-[12px] leading-[1.55] line-clamp-2"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {b.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live leaderboard */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)",
        }}
      >
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <div className="flex items-baseline justify-between mb-7 flex-wrap gap-2">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em] mb-1.5"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Live leaderboard
              </p>
              <h2
                className="font-display font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}
              >
                Top builders · ranked by composite Fingerprint
              </h2>
            </div>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "rgba(32,245,160,0.85)" }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#20F5A0" }}
              />
              Live
            </span>
          </div>

          {board.length === 0 ? (
            <div
              className="rounded-lg p-10 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Trophy
                className="w-8 h-8 mx-auto mb-3"
                style={{ color: "rgba(32,245,160,0.55)" }}
              />
              <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                Nobody on the board yet. First Receipt wins eyeballs.
              </p>
            </div>
          ) : (
            <ol className="space-y-2.5">
              {board.map((r, idx) => (
                <li
                  key={r.id}
                  className="rounded-[18px] p-5 transition-colors hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${idx === 0 ? "rgba(32,245,160,0.4)" : "rgba(255,255,255,0.08)"}`,
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
                            ? "#20F5A0"
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
                            {r.brief_title}
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
                              ? "#20F5A0"
                              : "rgba(255,255,255,0.9)",
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
        </div>
      </section>
    </main>
  );
}
