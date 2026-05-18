"use client";

/**
 * OnboardingWizard — a unified, guided onboarding stepper for the dashboard.
 *
 * Replaces the old fragmented 3-journey checklist. Instead of three peer
 * links the builder could attack in any order (or ignore), this walks them
 * through a single sequence:
 *
 *   1. Finish your profile   → /settings
 *   2. Ship your first work  → /submit  (or import via /claim-card)
 *   3. Join an Antathon      → /hackathons
 *
 * Design intent:
 *   - One focused "current step" at a time — no decision paralysis.
 *   - Completed steps collapse; upcoming steps are visible but muted.
 *   - Progress (which steps the user has *visited*) persists to
 *     localStorage so returning users resume where they left off, and
 *     the wizard can be dismissed permanently once dismissed or finished.
 *   - Actual completion is derived from real data (passed in as `steps`),
 *     so a step auto-checks the moment the underlying task is done.
 *
 * This component is purely presentational + local state; the dashboard
 * owns the data fetching and passes completion booleans in.
 */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  Sparkles,
  UserCircle,
  Rocket,
  Trophy,
  ChevronDown,
  X,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────── */

export type OnboardingStepKey = "profile" | "project" | "hackathon";

export interface OnboardingStep {
  key: OnboardingStepKey;
  /** Whether the underlying task is genuinely complete (derived from data). */
  done: boolean;
}

interface StepCopy {
  title: string;
  /** Shown when the step is the active focus. */
  detail: string;
  /** Primary call-to-action label. */
  cta: string;
  href: string;
  /** Optional secondary action (e.g. "Import from GitHub"). */
  secondary?: { label: string; href: string };
  icon: typeof UserCircle;
}

const STEP_COPY: Record<OnboardingStepKey, StepCopy> = {
  profile: {
    title: "Finish your profile",
    detail:
      "Add a bio, your skills, and a link or two. A complete profile is what Scout indexes — and what recruiters see first.",
    cta: "Complete profile",
    href: "/settings",
    icon: UserCircle,
  },
  project: {
    title: "Ship your first project",
    detail:
      "Submit something you built — or import your top repos straight from GitHub. This is the proof of work the whole network runs on.",
    cta: "Submit a project",
    href: "/submit",
    secondary: { label: "Import from GitHub", href: "/claim-card" },
    icon: Rocket,
  },
  hackathon: {
    title: "Join the next Antathon",
    detail:
      "Ship something real in 48 hours alongside other builders. It's the fastest way to get on the leaderboard.",
    cta: "Browse hackathons",
    href: "/hackathons",
    icon: Trophy,
  },
};

const STEP_ORDER: OnboardingStepKey[] = ["profile", "project", "hackathon"];
const DISMISS_KEY = "antry-onboarding-dismissed";

/* ── Component ──────────────────────────────────────────── */

const noopSubscribe = () => () => {};

/** False during SSR + the first client render, true once hydrated. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function OnboardingWizard({ steps }: { steps: OnboardingStep[] }) {
  // Lazy initializer: reads localStorage once. Safe against hydration
  // mismatch because the component renders null until `hydrated` flips.
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // localStorage unavailable — treat as not dismissed.
      return false;
    }
  });
  /** Step the user has manually expanded (overrides the auto-focused one). */
  const [expandedKey, setExpandedKey] = useState<OnboardingStepKey | null>(null);
  const hydrated = useHydrated();

  const doneByKey = useMemo(() => {
    const map = new Map<OnboardingStepKey, boolean>();
    for (const s of steps) map.set(s.key, s.done);
    return map;
  }, [steps]);

  const completedCount = STEP_ORDER.filter((k) => doneByKey.get(k)).length;
  const allDone = completedCount === STEP_ORDER.length;

  // The first incomplete step is the natural focus of the sequence.
  const focusKey = useMemo(
    () => STEP_ORDER.find((k) => !doneByKey.get(k)) ?? null,
    [doneByKey],
  );

  const activeKey = expandedKey ?? focusKey;

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — dismissal just won't persist across reloads.
    }
  }, []);

  // Avoid a flash before we know the dismissed state.
  if (!hydrated) return null;
  if (dismissed) return null;

  // ── All steps complete: a one-time celebratory cap ──────
  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4"
        style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.03)" }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "rgba(32,245,160,0.18)" }}
        >
          <PartyPopper className="h-5 w-5 text-[#0A0A0A]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#111111]">
            You&rsquo;re all set up
          </p>
          <p className="text-[12px] text-[#6B7280]">
            Profile complete, project shipped, hackathon joined. Nice work.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
        >
          Dismiss
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-10 overflow-hidden rounded-lg bg-white"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 12px 32px -16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(32,245,160,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 8, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "rgba(32,245,160,0.18)" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#0A0A0A]" />
          </motion.div>
          <div>
            <p className="text-[13px] font-bold tracking-tight text-[#111111]">
              Get set up
            </p>
            <p className="text-[11px] tabular-nums text-[#9CA3AF]">
              Step {Math.min(completedCount + 1, STEP_ORDER.length)} of{" "}
              {STEP_ORDER.length} &middot; {completedCount} done
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss onboarding"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-[#F3F4F6]">
        <motion.div
          className="h-full"
          style={{ background: "#20F5A0" }}
          initial={false}
          animate={{ width: `${(completedCount / STEP_ORDER.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Steps */}
      <ul className="divide-y divide-[#F3F4F6]">
        {STEP_ORDER.map((key, i) => {
          const copy = STEP_COPY[key];
          const done = doneByKey.get(key) ?? false;
          const isActive = key === activeKey && !done;
          const Icon = copy.icon;

          return (
            <li key={key}>
              <button
                type="button"
                onClick={() =>
                  setExpandedKey((prev) => (prev === key ? null : key))
                }
                className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
              >
                {/* Status bubble */}
                <motion.span
                  initial={false}
                  animate={{
                    background: done ? "#20F5A0" : "transparent",
                    borderColor: done
                      ? "#20F5A0"
                      : isActive
                        ? "#111111"
                        : "#D1D5DB",
                  }}
                  transition={{ duration: 0.35 }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                  style={{ color: done ? "#0A0A0A" : "#6B7280" }}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : isActive ? (
                    <Icon className="h-4 w-4 text-[#111111]" />
                  ) : (
                    <span className="text-[12px] font-bold tabular-nums">
                      {i + 1}
                    </span>
                  )}
                </motion.span>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-[14px] font-semibold transition-all"
                    style={{
                      textDecoration: done ? "line-through" : "none",
                      color: done
                        ? "#9CA3AF"
                        : isActive
                          ? "#111111"
                          : "#4B5563",
                    }}
                  >
                    {copy.title}
                  </p>
                  {done && (
                    <p className="text-[12px] text-[#9CA3AF]">Completed</p>
                  )}
                </div>

                {!done && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                      key === activeKey && "rotate-180",
                    )}
                  />
                )}
              </button>

              {/* Expanded detail — only one step open at a time */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pl-[60px]">
                      <p className="mb-3.5 text-[13px] leading-relaxed text-[#6B7280]">
                        {copy.detail}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Button href={copy.href} size="sm" variant="default">
                          {copy.cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        {copy.secondary && (
                          <Button
                            href={copy.secondary.href}
                            size="sm"
                            variant="outline"
                          >
                            {copy.secondary.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export default OnboardingWizard;
