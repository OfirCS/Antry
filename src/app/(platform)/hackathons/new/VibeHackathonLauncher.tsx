"use client";

/**
 * Vibe Hackathon Launcher.
 *
 * One-page wizard for hosts. They name it, pick a vibe (preset bundle of
 * Briefs + duration + tone), customize the Brief mix, set prizes, and
 * mint a shareable URL. Builders enter via Cursor + Antry MCP — every
 * submission is a signed Receipt that lands on a live leaderboard the
 * host owns.
 *
 * Why "vibe": these aren't 48-hour endurance hackathons. They're
 * 4–24 hour pop-ups built around a theme. Distinct vibe presets ship
 * with sane defaults so hosts don't get decision fatigue.
 *
 * v0: client-side state only; the "Mint" CTA shows the share-link
 * preview and the host can copy it. Real persistence wires through
 * /api/hackathons (POST) when SUPABASE is configured — same DB pattern
 * as the Antry domain (companies / briefs / brief_attempts).
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  Trophy,
  Rocket,
  Check,
  Copy,
  ChevronRight,
  Zap,
  Code2,
  Brain,
  Beaker,
  Hourglass,
  Link as LinkIcon,
} from "lucide-react";

type BriefCard = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  difficulty: string;
  category: string;
  time_cap_seconds: number;
  token_cap: number;
  sponsor_color: string;
  sponsor_name: string;
};

type Vibe = {
  id: string;
  name: string;
  pitch: string;
  tone: string;
  durationHours: number;
  defaultBriefSlugs: string[];
  accent: string;
  icon: React.ReactNode;
};

const VIBES: Vibe[] = [
  {
    id: "speedrun",
    name: "Speedrun",
    pitch: "4 hours. One Brief. Fastest signed Receipt wins.",
    tone: "High pressure, single artifact.",
    durationHours: 4,
    defaultBriefSlugs: ["bug-fix-from-failing-test"],
    accent: "#FF6B35",
    icon: <Rocket className="w-4 h-4" />,
  },
  {
    id: "build-night",
    name: "Build Night",
    pitch: "8 hours. Pick any 2 of 4 Briefs. Composite Fingerprint ranks.",
    tone: "Casual, evening pace.",
    durationHours: 8,
    defaultBriefSlugs: [
      "idempotent-webhook-processor",
      "typed-extractor-validation",
    ],
    accent: "#C6F135",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "weekend-mode",
    name: "Weekend Mode",
    pitch: "24 hours. 3 Briefs mandatory + 2 optional. Top median wins.",
    tone: "Endurance + judgment.",
    durationHours: 24,
    defaultBriefSlugs: [
      "streaming-rag-pipeline",
      "multistep-tool-agent-budget",
      "prompt-compressor-budget",
    ],
    accent: "#7C3AED",
    icon: <Hourglass className="w-4 h-4" />,
  },
  {
    id: "agent-cup",
    name: "Agent Cup",
    pitch: "12 hours. Agent-only Briefs. Tool-Choice IQ tiebreaker.",
    tone: "AI-engineering specialty.",
    durationHours: 12,
    defaultBriefSlugs: [
      "edge-agent-cold-start",
      "multistep-tool-agent-budget",
      "transactional-email-engine",
    ],
    accent: "#3B82F6",
    icon: <Brain className="w-4 h-4" />,
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  intro: "#10B981",
  mid: "#3B82F6",
  senior: "#8B5CF6",
  staff: "#EC4899",
};

export function VibeHackathonLauncher({ briefs }: { briefs: BriefCard[] }) {
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState<Vibe>(VIBES[1]);
  const [selectedBriefs, setSelectedBriefs] = useState<Set<string>>(
    () => new Set(VIBES[1].defaultBriefSlugs)
  );
  const [prize, setPrize] = useState("$1,000 + Antry Pro for 12 months");
  const [showShare, setShowShare] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintedUrl, setMintedUrl] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  const briefsBySlug = useMemo(() => {
    const m = new Map<string, BriefCard>();
    for (const b of briefs) m.set(b.slug, b);
    return m;
  }, [briefs]);

  const toggleBrief = (slug: string) => {
    setSelectedBriefs((s) => {
      const next = new Set(s);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const onPickVibe = (v: Vibe) => {
    setVibe(v);
    setSelectedBriefs(new Set(v.defaultBriefSlugs));
  };

  const slug = useMemo(
    () =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32) || "untitled-hack",
    [name]
  );

  const previewSlug = mintedUrl
    ? mintedUrl.replace(/^.*\/h\//, "")
    : slug;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/h/${previewSlug}`
      : `/h/${previewSlug}`;
  const totalSeconds = selectedBriefs.size
    ? Array.from(selectedBriefs).reduce(
        (sum, s) => sum + (briefsBySlug.get(s)?.time_cap_seconds ?? 0),
        0
      )
    : 0;

  const canMint = name.trim().length >= 3 && selectedBriefs.size >= 1;

  return (
    <main className="min-h-screen" style={{ background: "#0A0A0A" }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${vibe.accent}26 0%, transparent 60%)`,
            transition: "background 600ms ease",
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 sm:px-10 pt-16 pb-12">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-5 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: vibe.accent }} />
            For hosts · Vibe Hackathon
          </p>
          <h1
            className="font-display font-bold leading-[0.96] tracking-[-0.04em] text-white"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
          >
            Bundle Briefs.
            <br />
            <span style={{ color: vibe.accent }}>Set a vibe.</span> Ship one URL.
          </h1>
          <p
            className="mt-6 max-w-[640px] text-[15px] sm:text-[17px] leading-[1.6]"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Builders enter via Cursor + Antry MCP. Every submission is a
            signed Receipt — composite scores stream to your leaderboard
            in real time. Setup takes about three minutes.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section
        className="pb-24"
        style={{
          background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)",
        }}
      >
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 grid lg:grid-cols-[1fr_400px] gap-10">
          {/* Form column */}
          <div className="space-y-12">
            {/* 1. Name + slug */}
            <Step n={1} title="Name your hack">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anthropic Agent Cup · May 2026"
                maxLength={60}
                className="w-full px-5 h-[58px] rounded-[16px] text-[16px] outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(255,255,255,0.10)",
                  color: "#fff",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = vibe.accent)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.10)")
                }
              />
              <p
                className="mt-3 text-[12px] inline-flex items-center gap-1.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <LinkIcon className="w-3 h-3" />
                Share URL preview:{" "}
                <code
                  className="font-mono"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  antry.com/h/{slug}
                </code>
              </p>
            </Step>

            {/* 2. Vibe presets */}
            <Step n={2} title="Pick a vibe">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VIBES.map((v) => {
                  const active = v.id === vibe.id;
                  return (
                    <motion.button
                      key={v.id}
                      type="button"
                      onClick={() => onPickVibe(v)}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="text-left rounded-[18px] p-5 transition-all"
                      style={{
                        background: active
                          ? `${v.accent}1A`
                          : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${
                          active ? v.accent : "rgba(255,255,255,0.08)"
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                          style={{
                            background: active
                              ? v.accent
                              : "rgba(255,255,255,0.08)",
                            color: active ? "#0A0A0A" : v.accent,
                          }}
                        >
                          {v.icon}
                        </span>
                        <h3 className="text-[15px] font-bold tracking-[-0.005em] text-white">
                          {v.name}
                        </h3>
                        <span
                          className="ml-auto text-[10px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {v.durationHours}h
                        </span>
                      </div>
                      <p
                        className="text-[13px] leading-[1.55]"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {v.pitch}
                      </p>
                      <p
                        className="mt-2 text-[11px]"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {v.tone}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </Step>

            {/* 3. Briefs */}
            <Step n={3} title="Pick the Briefs">
              <p
                className="mb-4 text-[13px]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Selected{" "}
                <span style={{ color: vibe.accent, fontWeight: 700 }}>
                  {selectedBriefs.size}
                </span>{" "}
                of {briefs.length}. Most hosts pick 1–4. Total time cap:{" "}
                <span style={{ color: "rgba(255,255,255,0.85)" }}>
                  {Math.round(totalSeconds / 60)} minutes
                </span>
                .
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {briefs.map((b) => {
                  const active = selectedBriefs.has(b.slug);
                  const diffColor =
                    DIFFICULTY_COLOR[b.difficulty] ?? "#888";
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBrief(b.slug)}
                      className="text-left rounded-[14px] p-4 transition-colors"
                      style={{
                        background: active
                          ? `${vibe.accent}14`
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          active ? vibe.accent : "rgba(255,255,255,0.08)"
                        }`,
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-md mt-0.5 shrink-0 transition-colors"
                          style={{
                            background: active
                              ? vibe.accent
                              : "rgba(255,255,255,0.05)",
                            color: active
                              ? "#0A0A0A"
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {active ? (
                            <Check className="w-3 h-3" strokeWidth={3} />
                          ) : null}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-[13px] font-bold tracking-[-0.005em] text-white truncate">
                              {b.title}
                            </h4>
                            <span
                              className="text-[9px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                              style={{
                                background: `${diffColor}22`,
                                color: diffColor,
                              }}
                            >
                              {b.difficulty}
                            </span>
                          </div>
                          <p
                            className="text-[11px] leading-[1.5] line-clamp-2"
                            style={{ color: "rgba(255,255,255,0.55)" }}
                          >
                            {b.tagline}
                          </p>
                          <div
                            className="mt-2 flex items-center gap-3 text-[10px]"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {Math.round(b.time_cap_seconds / 60)}m
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              {(b.token_cap / 1000).toFixed(0)}K tok
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Beaker className="w-2.5 h-2.5" />
                              {b.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* 4. Prize */}
            <Step n={4} title="Set the prize">
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="$1,000 + interview fast-pass"
                maxLength={120}
                className="w-full px-5 h-[58px] rounded-[16px] text-[16px] outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(255,255,255,0.10)",
                  color: "#fff",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = vibe.accent)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.10)")
                }
              />
              <p
                className="mt-3 text-[12px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Cash works best, but interview fast-passes, mentor sessions,
                and gear all convert. Goes on the share card.
              </p>
            </Step>

            {/* 5. Mint */}
            <div className="pt-4">
              <motion.button
                type="button"
                disabled={!canMint || minting}
                onClick={async () => {
                  if (!canMint || minting) return;
                  setMinting(true);
                  setMintError(null);
                  try {
                    const res = await fetch("/api/hackathons", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        vibe: vibe.id,
                        durationHours: vibe.durationHours,
                        prize,
                        briefSlugs: Array.from(selectedBriefs),
                      }),
                    });
                    const j = (await res.json()) as
                      | { url: string; slug: string }
                      | { error: string };
                    if ("error" in j) {
                      setMintError(j.error);
                    } else {
                      setMintedUrl(j.url);
                      setShowShare(true);
                    }
                  } catch (e) {
                    setMintError(
                      e instanceof Error ? e.message : "Network error"
                    );
                  } finally {
                    setMinting(false);
                  }
                }}
                whileHover={canMint && !minting ? { y: -2 } : {}}
                whileTap={canMint && !minting ? { scale: 0.98 } : {}}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center justify-center gap-2 rounded-[16px] px-8 h-[60px] text-[15px] font-bold whitespace-nowrap transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: vibe.accent,
                  color: "#0A0A0A",
                  boxShadow:
                    canMint && !minting
                      ? `0 16px 36px ${vibe.accent}55`
                      : "none",
                }}
                data-cta="lime"
              >
                {minting ? "Minting…" : "Mint hackathon"}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              {mintError && (
                <p className="mt-3 text-[12px] text-red-400 font-semibold">
                  {mintError}
                </p>
              )}
              {!canMint && (
                <p
                  className="mt-3 text-[12px]"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Need a name (3+ chars) and at least 1 Brief.
                </p>
              )}
            </div>
          </div>

          {/* Live preview column */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div
              className="rounded-[24px] overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${vibe.accent}1F 0%, rgba(255,255,255,0.02) 100%)`,
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{ background: vibe.accent, color: "#0A0A0A" }}
                  >
                    {vibe.icon}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {vibe.name} · {vibe.durationHours}h
                  </span>
                </div>
                <h2 className="text-[22px] font-bold tracking-[-0.02em] text-white leading-[1.15] min-h-[60px]">
                  {name || "Your hackathon name"}
                </h2>
                <p
                  className="mt-2 text-[12px] font-mono"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  antry.com/h/{slug}
                </p>

                <div
                  className="mt-5 pt-5 space-y-2.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {Array.from(selectedBriefs).slice(0, 4).map((s) => {
                    const b = briefsBySlug.get(s);
                    if (!b) return null;
                    return (
                      <div
                        key={s}
                        className="flex items-center gap-2.5 text-[12px]"
                      >
                        <Code2
                          className="w-3 h-3 shrink-0"
                          style={{ color: vibe.accent }}
                        />
                        <span
                          className="text-white truncate"
                          style={{
                            color: "rgba(255,255,255,0.85)",
                          }}
                        >
                          {b.title}
                        </span>
                      </div>
                    );
                  })}
                  {selectedBriefs.size > 4 && (
                    <p
                      className="text-[11px] pl-5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      + {selectedBriefs.size - 4} more
                    </p>
                  )}
                  {selectedBriefs.size === 0 && (
                    <p
                      className="text-[12px]"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      No Briefs selected yet.
                    </p>
                  )}
                </div>

                {prize && (
                  <div
                    className="mt-5 pt-5 flex items-start gap-2.5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Trophy
                      className="w-3.5 h-3.5 mt-0.5 shrink-0"
                      style={{ color: vibe.accent }}
                    />
                    <p
                      className="text-[12px] leading-[1.55]"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {prize}
                    </p>
                  </div>
                )}
              </div>

              <div
                className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-center"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Live preview · share card
              </div>
            </div>

            <p
              className="mt-4 text-[11px] leading-[1.55]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Builders join via Cursor + Antry MCP. The leaderboard mints
              from signed Receipts — same primitive your candidates use to
              apply. No duplicate eval pipeline.
            </p>
          </aside>
        </div>
      </section>

      {/* Share modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-6 z-50"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowShare(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-[24px] p-8 max-w-[480px] w-full"
              style={{
                background: "#0F0F0F",
                border: `1px solid ${vibe.accent}55`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${vibe.accent}22`, color: vibe.accent }}
              >
                <Check className="w-5 h-5" strokeWidth={3} />
              </div>
              <h3 className="text-[24px] font-bold tracking-[-0.02em] text-white">
                Hackathon minted
              </h3>
              <p
                className="mt-2 text-[14px] leading-[1.6]"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Share this URL with your candidate pool. They install Antry
                MCP, run <code className="font-mono">start_attempt</code>, and
                their Receipts stream to your leaderboard.
              </p>
              <div
                className="mt-5 rounded-[12px] p-3 flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <code
                  className="flex-1 font-mono text-[13px] truncate"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {shareUrl}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    void navigator.clipboard.writeText(shareUrl)
                  }
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors"
                  style={{
                    background: vibe.accent,
                    color: "#0A0A0A",
                  }}
                  aria-label="Copy URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowShare(false)}
                className="mt-6 w-full inline-flex items-center justify-center rounded-[14px] h-[48px] text-[14px] font-semibold transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-[12px] font-bold font-display"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {n}
        </span>
        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-white">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
