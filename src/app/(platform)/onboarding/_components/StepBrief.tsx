"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { demoBriefs } from "@/lib/receipts/demo-data";
import type { BriefDifficulty } from "@/lib/receipts/types";
import { markOnboardingCompleted } from "@/lib/onboarding/state";

// Curated picks for first-time users. Order matters — easiest first,
// then a mix of categories so a builder can pick what looks like
// their lane.
const CURATED_SLUGS = [
  "bug-fix-from-failing-test",
  "idempotent-webhook-processor",
  "typed-extractor-validation",
  "prompt-compressor-budget",
] as const;

const DIFFICULTY_BG: Record<BriefDifficulty, string> = {
  intro: "#A7F3D0",
  mid: "#BFDBFE",
  senior: "#DDD6FE",
  staff: "#FBCFE8",
};
const DIFFICULTY_FG: Record<BriefDifficulty, string> = {
  intro: "#065F46",
  mid: "#1E3A8A",
  senior: "#4C1D95",
  staff: "#831843",
};

function formatTimeCap(seconds: number): string {
  if (seconds >= 3600) {
    const h = seconds / 3600;
    return `${h % 1 === 0 ? h : h.toFixed(1)}h cap`;
  }
  return `${Math.round(seconds / 60)}m cap`;
}

/**
 * Step 4 — Pick a first Brief. Four curated cards; each links to its
 * full page in /briefs/<slug>. The "Finish" button marks onboarding
 * complete and bounces back to the feed, even if the user didn't
 * click a card.
 */
export function StepBrief({ onFinish }: { onFinish: () => void }) {
  const picks = CURATED_SLUGS.map((slug) =>
    demoBriefs.find((b) => b.slug === slug),
  ).filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <div>
      <h1
        className="font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.05]"
        style={{ fontSize: "clamp(1.6rem, 3.6vw, 2rem)" }}
      >
        Try one of these to start.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-gray-600">
        Open a Brief in a new tab, then come back to finish.
      </p>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {picks.map((b) => (
          <li key={b.id}>
            <Link
              href={`/briefs/${b.slug}`}
              // Open in a new tab so the user keeps onboarding state.
              target="_blank"
              rel="noopener"
              onClick={() => {
                // Treat clicking a Brief as activation — mark complete
                // even if they don't return to hit "Finish". They've
                // engaged with the product.
                markOnboardingCompleted();
              }}
              className="group block rounded-[12px] p-4 h-full transition-colors hover:bg-[#FAFAF7]"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center px-2 h-5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    background: DIFFICULTY_BG[b.difficulty],
                    color: DIFFICULTY_FG[b.difficulty],
                  }}
                >
                  {b.difficulty}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500"
                >
                  <Clock className="w-3 h-3" />
                  {formatTimeCap(b.time_cap_seconds)}
                </span>
              </div>
              <h3 className="text-[14px] font-bold tracking-[-0.005em] text-[#0A0A0A] leading-[1.3] group-hover:underline underline-offset-2">
                {b.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-gray-600 line-clamp-2">
                {b.tagline}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-5 h-11 text-[14px] font-bold transition-all hover:-translate-y-0.5"
          style={{ background: "#C6F135", color: "#0A0A0A" }}
          data-cta="lime"
        >
          Finish <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <Link
          href="/"
          onClick={() => markOnboardingCompleted()}
          className="text-[13px] font-semibold text-gray-500 hover:text-[#0A0A0A] transition-colors"
        >
          Skip — take me to the feed
        </Link>
      </div>
    </div>
  );
}
