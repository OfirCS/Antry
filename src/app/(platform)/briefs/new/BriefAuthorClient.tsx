"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clock,
  Cpu,
  Wand2,
  Wrench,
  ArrowUp,
  RefreshCw,
  BookmarkPlus,
  Check,
} from "lucide-react";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import type { Fingerprint } from "@/lib/receipts/types";

type Draft = {
  title: string;
  tagline: string;
  slug: string;
  category: string;
  difficulty: "intro" | "mid" | "senior" | "staff";
  time_cap_seconds: number;
  token_cap: number;
  allowed_tools: string[];
  prompt_md: string;
  rubric: { criterion: string; weight: number }[];
  ideal_fingerprint: Fingerprint;
};

const DIFFICULTY_BG: Record<string, string> = {
  intro: "#A7F3D0",
  mid: "#3B82F6",
  senior: "#8B5CF6",
  staff: "#EC4899",
};

const DIFFICULTY_FG: Record<string, string> = {
  intro: "#0A0A0A",
  mid: "#FFFFFF",
  senior: "#FFFFFF",
  staff: "#FFFFFF",
};

// Sequence of staged labels shown during the perceived-progress flow.
// Each line surfaces a step the agent is doing; CSS keyframes animate
// them in one-by-one. Done in <2s perceived time even when the real
// API call takes 10+.
const DRAFT_STEPS = [
  "Reading the problem statement",
  "Choosing difficulty + category",
  "Picking time / token caps",
  "Sketching the prompt + rubric",
  "Tuning the ideal Fingerprint",
];

export function BriefAuthorClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [problem, setProblem] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redraftNonce, setRedraftNonce] = useState(0);
  const [saved, setSaved] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  // Trigger a redraft when the nonce changes (set by "Re-draft" button).
  useEffect(() => {
    if (redraftNonce === 0) return;
    void onDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redraftNonce]);

  const onDraft = async () => {
    if (problem.trim().length < 10) return;
    setDrafting(true);
    setError(null);
    setDraft(null);
    setSaved(false);
    setPromptOpen(false);
    try {
      const res = await fetch("/api/briefs/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problem.trim(),
          // Server ignores this for now; lets us nudge prompts later
          // without bumping the API surface. Harmless if dropped.
          nudge: redraftNonce > 0 ? "vary" : undefined,
        }),
      });
      const j = (await res.json()) as
        | { draft: Draft }
        | { error: string; message?: string };
      if ("error" in j) {
        setError(j.message ?? humanError(j.error));
      } else {
        setDraft(j.draft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setDrafting(false);
    }
  };

  const scrollToInput = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* Inline keyframes so we don't pull framer-motion into a client
          component. Kept scoped to this surface — the page styling is
          otherwise driven by Tailwind. */}
      <style jsx>{`
        @keyframes draftRise {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes skeletonShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes draftStepTick {
          0% {
            opacity: 0;
            transform: translateX(-4px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .skeleton-line {
          background: linear-gradient(
            90deg,
            #f1f1ea 0%,
            #ffffff 40%,
            #f1f1ea 80%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.6s ease-in-out infinite;
        }
        .draft-step {
          opacity: 0;
          animation: draftStepTick 0.4s ease-out forwards;
        }
        .draft-rise {
          opacity: 0;
          animation: draftRise 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .pulse-dot {
          animation: dotPulse 1s ease-in-out infinite;
        }
      `}</style>

      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#C6F135" }}
        />
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 pt-10 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2 text-[#0A0A0A]">
            <Sparkles className="w-3 h-3" />
            Brief Author
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            Describe it. Get a Brief.
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-gray-600">
            One sentence about what you want to test. Antry drafts a full
            Brief — rubric, caps, ideal Fingerprint — in 10 seconds.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 grid gap-6">
          {/* Input */}
          <div
            className="rounded-[14px] p-5"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2 block">
              Problem
            </label>
            <textarea
              ref={inputRef}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. We need someone who can ship a webhook receiver that handles retries idempotently under 300 events with concurrency."
              maxLength={600}
              rows={3}
              className="w-full px-3 py-2 text-[15px] leading-[1.5] outline-none resize-none rounded-[10px]"
              style={{
                background: "#FAFAF7",
                border: "1.5px solid #EBEBEB",
                color: "#0A0A0A",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#0A0A0A")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#EBEBEB")
              }
            />
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onDraft}
                disabled={drafting || problem.trim().length < 10}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                {drafting ? (
                  "Drafting…"
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Draft Brief
                  </>
                )}
              </button>
              <span className="text-[11px] text-gray-500">
                {problem.length}/600
              </span>
              {error && (
                <span className="text-[12px] text-red-600 font-semibold">
                  {error}
                </span>
              )}
            </div>
          </div>

          {/* Example chips when no draft yet */}
          {!draft && !drafting && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                Try
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ship a webhook receiver that handles 300 events with retries safely",
                  "Optimize a 12-table query taking 8s p95 down to under 200ms",
                  "Multi-step agent answers 20 research questions under a 4K-token budget",
                  "Bug fix from one failing test — minimal diff, all tests green",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setProblem(q)}
                    className="text-left text-[12px] rounded-[10px] px-3 h-9 transition-colors hover:bg-[#FFFFFF]"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #EBEBEB",
                      color: "#0A0A0A",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drafting skeleton — perceived progress under 2s */}
          {drafting && <DraftingSkeleton />}

          {/* Preview */}
          {draft && !drafting && (
            <>
              {/* Edit affordances above the card */}
              <div className="flex items-center gap-2 flex-wrap draft-rise">
                <button
                  type="button"
                  onClick={scrollToInput}
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-colors"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    color: "#0A0A0A",
                  }}
                >
                  <ArrowUp className="w-3 h-3" />
                  Edit problem
                </button>
                <button
                  type="button"
                  onClick={() => setRedraftNonce((n) => n + 1)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-colors"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    color: "#0A0A0A",
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-draft
                </button>
                <button
                  type="button"
                  onClick={() => setSaved(true)}
                  disabled={saved}
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-colors disabled:cursor-default"
                  style={{
                    background: saved ? "#C6F135" : "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    color: "#0A0A0A",
                  }}
                >
                  {saved ? (
                    <>
                      <Check className="w-3 h-3" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3 h-3" />
                      Save draft
                    </>
                  )}
                </button>
                <span className="text-[10px] uppercase tracking-[0.16em] text-gray-400 ml-auto font-mono">
                  /{draft.slug}
                </span>
              </div>

              <div
                className="rounded-[14px] relative draft-rise"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  animationDelay: "60ms",
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] rounded-t-[14px]"
                  style={{ background: "#C6F135" }}
                />

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-6">
                  {/* Left column — title + tagline + pills + caps + body */}
                  <div className="min-w-0">
                    {/* Top row: pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                        style={{
                          background: DIFFICULTY_BG[draft.difficulty],
                          color: DIFFICULTY_FG[draft.difficulty],
                        }}
                      >
                        {draft.difficulty}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                        style={{
                          background: "#FAFAF7",
                          border: "1px solid #EBEBEB",
                          color: "#0A0A0A",
                        }}
                      >
                        {draft.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Draft preview
                      </span>
                    </div>

                    <h2 className="mt-3 text-[22px] font-bold tracking-[-0.015em] text-black leading-[1.15] font-display">
                      {draft.title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-[1.55] text-gray-600">
                      {draft.tagline}
                    </p>

                    {/* Middle: caps (icon-led, prominent) */}
                    <div
                      className="mt-5 grid grid-cols-3 gap-3"
                      role="group"
                      aria-label="Brief caps"
                    >
                      <CapTile
                        icon={<Clock className="w-3.5 h-3.5" />}
                        label="Time"
                        value={`${Math.round(draft.time_cap_seconds / 60)}m`}
                      />
                      <CapTile
                        icon={<Cpu className="w-3.5 h-3.5" />}
                        label="Tokens"
                        value={`${(draft.token_cap / 1000).toFixed(0)}K`}
                      />
                      <CapTile
                        icon={<Wrench className="w-3.5 h-3.5" />}
                        label="Tools"
                        value={String(draft.allowed_tools.length)}
                        sub={draft.allowed_tools.slice(0, 2).join(", ")}
                      />
                    </div>

                    {/* Body — prompt md, collapsed by default */}
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => setPromptOpen((o) => !o)}
                        aria-expanded={promptOpen}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-black"
                      >
                        <span
                          aria-hidden
                          className="inline-block transition-transform"
                          style={{
                            transform: promptOpen
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          ▸
                        </span>
                        Prompt + rubric
                        <span className="text-[10px] font-mono text-gray-400 ml-1">
                          {draft.rubric.length} criteria
                        </span>
                      </button>
                      {promptOpen && (
                        <div className="mt-2 draft-rise">
                          <pre
                            className="rounded-[10px] p-3 text-[12px] leading-[1.55] whitespace-pre-wrap font-mono"
                            style={{
                              background: "#FAFAF7",
                              border: "1px solid #EBEBEB",
                              color: "#0A0A0A",
                            }}
                          >
                            {draft.prompt_md}
                          </pre>
                          <ul className="mt-2 space-y-1 text-[12px] text-gray-700">
                            {draft.rubric.map((r, i) => (
                              <li
                                key={i}
                                className="flex items-baseline gap-2"
                              >
                                <span className="font-mono text-[11px] text-gray-500">
                                  {(r.weight * 100).toFixed(0)}%
                                </span>
                                <span>{r.criterion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right column — mini fingerprint radar */}
                  <div className="md:w-[160px] flex flex-col items-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2 text-center">
                      Ideal
                    </p>
                    <FingerprintGlyph
                      fingerprint={draft.ideal_fingerprint}
                      size={120}
                      primaryColor="#C6F135"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex items-center gap-2 flex-wrap px-6 py-4"
                  style={{ borderTop: "1px solid #EBEBEB" }}
                >
                  <button
                    type="button"
                    onClick={() => router.push("/hackathons/new")}
                    className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                    style={{ background: "#0A0A0A", color: "#FFFFFF" }}
                  >
                    Bundle in a Hack
                  </button>
                  <Link
                    href={`/briefs/${draft.slug}`}
                    className="text-[12px] font-semibold text-gray-500 hover:text-black transition-colors ml-auto"
                  >
                    Preview as Brief →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function CapTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-[10px] px-3 py-2.5"
      style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display font-bold text-[18px] tracking-[-0.015em] text-black leading-none">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[10px] text-gray-500 truncate" title={sub}>
          {sub}
        </div>
      )}
    </div>
  );
}

function DraftingSkeleton() {
  return (
    <div
      className="rounded-[14px] p-6 relative draft-rise"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[14px]"
        style={{ background: "#C6F135" }}
      />
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ background: "#C6F135" }}
        />
        Drafting…
      </div>

      {/* Step ticker — staggered fade-ins so the agent feels palpable */}
      <ol className="space-y-1.5 mb-5">
        {DRAFT_STEPS.map((s, i) => (
          <li
            key={s}
            className="draft-step text-[12px] text-gray-700 inline-flex items-center gap-2"
            style={{ animationDelay: `${i * 220}ms` }}
          >
            <span
              aria-hidden
              className="inline-block w-3 h-3 rounded-full"
              style={{
                background: i < DRAFT_STEPS.length - 1 ? "#C6F135" : "#FAFAF7",
                border: "1px solid #EBEBEB",
              }}
            />
            {s}
          </li>
        ))}
      </ol>

      {/* Skeleton rows — sequenced for perceived layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
        <div className="min-w-0 space-y-3">
          <div className="flex gap-2">
            <SkeletonChip />
            <SkeletonChip width={56} />
          </div>
          <SkeletonBar
            height={20}
            width="65%"
            delay={120}
          />
          <SkeletonBar height={12} width="92%" delay={240} />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <SkeletonTile delay={360} />
            <SkeletonTile delay={440} />
            <SkeletonTile delay={520} />
          </div>
          <SkeletonBar height={10} width="40%" delay={620} />
        </div>
        <div className="md:w-[160px] flex flex-col items-center pt-1">
          <SkeletonBar height={10} width={32} delay={140} />
          <div
            className="mt-3 rounded-full skeleton-line"
            style={{ width: 120, height: 120, animationDelay: "260ms" }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function SkeletonChip({ width = 44 }: { width?: number }) {
  return (
    <span
      className="inline-block h-4 rounded skeleton-line"
      style={{ width }}
      aria-hidden
    />
  );
}

function SkeletonBar({
  height,
  width,
  delay = 0,
}: {
  height: number;
  width: number | string;
  delay?: number;
}) {
  return (
    <div
      className="rounded-[6px] skeleton-line"
      style={{
        height,
        width,
        animationDelay: `${delay}ms`,
      }}
      aria-hidden
    />
  );
}

function SkeletonTile({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="rounded-[10px] skeleton-line"
      style={{ height: 64, animationDelay: `${delay}ms` }}
      aria-hidden
    />
  );
}

function humanError(code: string): string {
  switch (code) {
    case "rate_limited":
      return "Too many drafts — try again in a moment.";
    case "invalid_json":
      return "Couldn't parse the request.";
    case "invalid_problem":
      return "Problem must be 10–600 characters.";
    default:
      return "Drafting failed. Try once more.";
  }
}
