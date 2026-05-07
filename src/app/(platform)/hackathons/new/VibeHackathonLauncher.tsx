"use client";

/**
 * Vibe Hackathon Launcher — light editorial version.
 *
 * Hosts: name → vibe → Briefs → prize → mint. Five fields, one screen.
 * Sticky live-preview card on the right reflects exactly what the share
 * URL will render. Vibe-accent color drives a single visual hint across
 * the form so the host knows which preset is active without re-reading.
 */

import { useMemo, useState } from "react";
import {
  Sparkles,
  Clock,
  Trophy,
  Rocket,
  Check,
  Copy,
  ChevronRight,
  Hourglass,
  Brain,
  Code2,
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
  durationHours: number;
  defaultBriefSlugs: string[];
  accent: string;
  icon: React.ReactNode;
};

const VIBES: Vibe[] = [
  {
    id: "speedrun",
    name: "Speedrun",
    pitch: "4h · single Brief · fastest signed Receipt wins",
    durationHours: 4,
    defaultBriefSlugs: ["bug-fix-from-failing-test"],
    accent: "#FF6B35",
    icon: <Rocket className="w-3.5 h-3.5" />,
  },
  {
    id: "build-night",
    name: "Build Night",
    pitch: "8h · pick 2 of 4 · composite Fingerprint ranks",
    durationHours: 8,
    defaultBriefSlugs: [
      "idempotent-webhook-processor",
      "typed-extractor-validation",
    ],
    accent: "#C6F135",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: "weekend-mode",
    name: "Weekend Mode",
    pitch: "24h · 3 mandatory + 2 optional · top median wins",
    durationHours: 24,
    defaultBriefSlugs: [
      "streaming-rag-pipeline",
      "multistep-tool-agent-budget",
      "prompt-compressor-budget",
    ],
    accent: "#7C3AED",
    icon: <Hourglass className="w-3.5 h-3.5" />,
  },
  {
    id: "agent-cup",
    name: "Agent Cup",
    pitch: "12h · agent-only Briefs · Tool-Choice IQ tiebreaker",
    durationHours: 12,
    defaultBriefSlugs: [
      "edge-agent-cold-start",
      "multistep-tool-agent-budget",
      "transactional-email-engine",
    ],
    accent: "#3B82F6",
    icon: <Brain className="w-3.5 h-3.5" />,
  },
];

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
  const [copied, setCopied] = useState(false);

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

  const previewSlug = mintedUrl ? mintedUrl.replace(/^.*\/h\//, "") : slug;
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
    <div style={{ background: "#FAFAF7" }} className="min-h-screen pb-16">
      {/* Header band */}
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: vibe.accent }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-6">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2"
            style={{ color: vibe.accent }}
          >
            <Sparkles className="w-3 h-3" />
            For hosts · Vibe Hackathon
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            Bundle Briefs. Set a vibe.
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-gray-600">
            Builders enter via Cursor + Antry MCP. Receipts mint to the
            leaderboard live. Setup takes about three minutes.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-8">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Form column */}
          <div className="space-y-8">
            <Step n={1} title="Name your hack">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anthropic Agent Cup · May 2026"
                maxLength={60}
                className="w-full px-4 h-[48px] rounded-[10px] text-[15px] outline-none transition-colors"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #EBEBEB",
                  color: "#0A0A0A",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = vibe.accent)
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#EBEBEB")}
              />
              <p className="mt-2 text-[11px] inline-flex items-center gap-1.5 text-gray-500">
                <LinkIcon className="w-3 h-3" />
                Share URL: <code className="font-mono text-black">/h/{slug}</code>
              </p>
            </Step>

            <Step n={2} title="Pick a vibe">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VIBES.map((v) => {
                  const active = v.id === vibe.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onPickVibe(v)}
                      className="text-left rounded-[12px] p-3.5 transition-all hover:-translate-y-0.5"
                      style={{
                        background: "#FFFFFF",
                        border: `1.5px solid ${active ? v.accent : "#EBEBEB"}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md"
                          style={{
                            background: active ? v.accent : "#F5F5F5",
                            color: active ? "#0A0A0A" : v.accent,
                          }}
                        >
                          {v.icon}
                        </span>
                        <h3 className="text-[14px] font-bold tracking-[-0.005em] text-black">
                          {v.name}
                        </h3>
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 tabular-nums">
                          {v.durationHours}h
                        </span>
                      </div>
                      <p className="text-[12px] leading-[1.5] text-gray-600">
                        {v.pitch}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n={3} title="Pick the Briefs">
              <p className="mb-3 text-[12px] text-gray-500">
                Selected{" "}
                <span style={{ color: vibe.accent, fontWeight: 700 }}>
                  {selectedBriefs.size}
                </span>{" "}
                of {briefs.length} ·{" "}
                <span className="text-black font-semibold">
                  {Math.round(totalSeconds / 60)} minutes
                </span>{" "}
                total
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {briefs.map((b) => {
                  const active = selectedBriefs.has(b.slug);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBrief(b.slug)}
                      className="text-left rounded-[10px] p-3 transition-colors hover:bg-[#FAFAF7]"
                      style={{
                        background: "#FFFFFF",
                        border: `1.5px solid ${active ? vibe.accent : "#EBEBEB"}`,
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] mt-0.5 shrink-0 transition-colors"
                          style={{
                            background: active ? vibe.accent : "#FAFAF7",
                            border: active ? "none" : "1.5px solid #D4D4D4",
                          }}
                        >
                          {active ? (
                            <Check
                              className="w-2.5 h-2.5"
                              strokeWidth={3.5}
                              style={{ color: "#0A0A0A" }}
                            />
                          ) : null}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <h4 className="text-[13px] font-bold tracking-[-0.005em] text-black truncate">
                              {b.title}
                            </h4>
                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
                              {b.difficulty}
                            </span>
                          </div>
                          <p className="text-[11px] leading-[1.5] text-gray-500 line-clamp-2">
                            {b.tagline}
                          </p>
                          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {Math.round(b.time_cap_seconds / 60)}m
                            </span>
                            <span>{b.category}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n={4} title="Set the prize">
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="$1,000 + interview fast-pass"
                maxLength={120}
                className="w-full px-4 h-[48px] rounded-[10px] text-[15px] outline-none transition-colors"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #EBEBEB",
                  color: "#0A0A0A",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = vibe.accent)
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#EBEBEB")}
              />
            </Step>

            <div className="pt-2">
              <button
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
                    if ("error" in j) setMintError(j.error);
                    else {
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
                className="inline-flex items-center justify-center gap-2 rounded-[12px] px-6 h-[52px] text-[14px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                {minting ? "Minting…" : "Mint hackathon"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {mintError && (
                <p className="mt-2 text-[12px] text-red-600 font-semibold">
                  {mintError}
                </p>
              )}
              {!canMint && !mintError && (
                <p className="mt-2 text-[12px] text-gray-500">
                  Need a name (3+ chars) and 1+ Brief.
                </p>
              )}
            </div>
          </div>

          {/* Live preview column */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div
              className="rounded-[14px] overflow-hidden"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <span
                aria-hidden
                className="block h-[3px]"
                style={{ background: vibe.accent }}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-md"
                    style={{ background: vibe.accent }}
                  >
                    {vibe.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                    {vibe.name} · {vibe.durationHours}h
                  </span>
                </div>
                <h2 className="text-[18px] font-bold tracking-[-0.015em] text-black leading-[1.2] min-h-[44px]">
                  {name || "Your hackathon name"}
                </h2>
                <p className="mt-1 text-[11px] font-mono text-gray-500">
                  /h/{slug}
                </p>

                <div
                  className="mt-4 pt-4 space-y-1.5"
                  style={{ borderTop: "1px solid #EBEBEB" }}
                >
                  {Array.from(selectedBriefs).slice(0, 4).map((s) => {
                    const b = briefsBySlug.get(s);
                    if (!b) return null;
                    return (
                      <div
                        key={s}
                        className="flex items-center gap-2 text-[12px]"
                      >
                        <Code2
                          className="w-3 h-3 shrink-0"
                          style={{ color: vibe.accent }}
                        />
                        <span className="text-black truncate">{b.title}</span>
                      </div>
                    );
                  })}
                  {selectedBriefs.size > 4 && (
                    <p className="text-[11px] pl-5 text-gray-400">
                      + {selectedBriefs.size - 4} more
                    </p>
                  )}
                  {selectedBriefs.size === 0 && (
                    <p className="text-[12px] text-gray-400">
                      No Briefs selected.
                    </p>
                  )}
                </div>

                {prize && (
                  <div
                    className="mt-4 pt-4 flex items-start gap-2"
                    style={{ borderTop: "1px solid #EBEBEB" }}
                  >
                    <Trophy
                      className="w-3 h-3 mt-0.5 shrink-0"
                      style={{ color: vibe.accent }}
                    />
                    <p className="text-[12px] leading-[1.5] text-black">
                      {prize}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Share modal — minimal */}
      {showShare && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(10,10,10,0.5)" }}
          onClick={() => setShowShare(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-[14px] p-6 max-w-[420px] w-full"
            style={{ background: "#FFFFFF" }}
          >
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
              style={{ background: vibe.accent }}
            >
              <Check
                className="w-4 h-4"
                strokeWidth={3}
                style={{ color: "#0A0A0A" }}
              />
            </div>
            <h3 className="text-[18px] font-bold tracking-[-0.015em] text-black">
              Hackathon minted
            </h3>
            <p className="mt-1 text-[13px] leading-[1.5] text-gray-600">
              Builders install Antry MCP, run start_attempt, and Receipts
              stream to your leaderboard.
            </p>
            <div
              className="mt-4 rounded-[10px] p-2.5 flex items-center gap-2"
              style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
            >
              <code className="flex-1 font-mono text-[12px] truncate text-black">
                {shareUrl}
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                style={{ background: vibe.accent, color: "#0A0A0A" }}
                aria-label="Copy"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={mintedUrl ?? "#"}
                className="inline-flex items-center justify-center rounded-[10px] px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                Open page
              </a>
              <button
                type="button"
                onClick={() => setShowShare(false)}
                className="text-[13px] font-semibold text-gray-500 hover:text-black px-3 h-9"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold font-display tabular-nums"
          style={{
            background: "#0A0A0A",
            color: "#FFFFFF",
          }}
        >
          {n}
        </span>
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-black">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
