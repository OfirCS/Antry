"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileSignature,
  Sparkles,
  Telescope,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

/**
 * First-visit home hero — answers "what is this?" in plain English
 * before the feed starts. The old HeroStrip was one cryptic line
 * ("shipping replays, not interview replays") that assumed you already
 * knew what a Receipt was; this spells out the loop for both sides of
 * the marketplace and routes each audience to its first action.
 *
 * Visibility rules:
 *   - Signed-in users never see it (they already get it).
 *   - Signed-out users see it until they dismiss; dismissal persists
 *     in localStorage. The key is versioned so meaningful copy changes
 *     re-surface the hero once.
 *   - Rendered visible on the server so it's crawlable and paints with
 *     the static shell; hides after hydration if dismissed.
 */

const STORAGE_KEY = "antry.hero.v2.dismissed";

const STEPS: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}[] = [
  {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    title: "Take a Brief",
    body: "A real, timed challenge from a hiring company — not LeetCode.",
    accent: "#FF6B35",
  },
  {
    icon: <FileSignature className="w-3.5 h-3.5" />,
    title: "Build with AI",
    body: "Work how you actually work. Antry records how you drive the model.",
    accent: "#3B82F6",
  },
  {
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    title: "Mint your Receipt",
    body: "Signed, verifiable proof of skill. Companies search it and reach out.",
    accent: "#C6F135",
  },
];

export function HomeHero() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
      } catch {
        // localStorage unavailable — leave visible.
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  if (user || dismissed) return null;

  function onDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — still hide for this session.
    }
    setDismissed(true);
  }

  return (
    <section
      aria-label="What is Antry"
      className="relative rounded-[14px] mb-4 overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      {/* Brand stripe — the three product accents in one line. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #FF6B35 0%, #C6F135 50%, #3B82F6 100%)",
        }}
      />

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss intro"
        className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-[8px] text-gray-400 hover:text-[#0A0A0A] hover:bg-[#FAFAF7] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="px-5 sm:px-7 pt-7 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
          Antry · Proof of AI-native skill
        </p>
        <h1
          className="mt-2 font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
          style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.5rem)" }}
        >
          Show receipts. Get hired.
        </h1>
        <p className="mt-3 max-w-[58ch] text-[14px] sm:text-[15px] leading-[1.6] text-gray-600">
          Resumes can&apos;t prove you can build with AI.{" "}
          <span className="font-semibold text-black">Receipts can.</span>{" "}
          Builders take real challenges from hiring companies; Antry signs a
          verifiable record of how they work — and companies hire on that
          evidence instead of interviews.
        </p>

        {/* Dual-audience CTAs — each side gets its first action. */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Link
            href="/briefs"
            className="inline-flex items-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#0A0A0A", color: "#FFFFFF" }}
          >
            I&apos;m a builder — take a Brief
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/scout"
            className="inline-flex items-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{
              background: "#FFFFFF",
              border: "1px solid #EBEBEB",
              color: "#0A0A0A",
            }}
          >
            <Telescope className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
            I&apos;m hiring — scout talent
          </Link>
          <Link
            href="/for-companies"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-black transition-colors px-1 h-10"
          >
            <Building2 className="w-3 h-3" />
            Pricing for companies
          </Link>
        </div>
      </div>

      {/* How it works — three steps, one line each. */}
      <div
        className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EBEBEB]"
        style={{ borderTop: "1px solid #EBEBEB", background: "#FAFAF7" }}
      >
        {STEPS.map((s, i) => (
          <div key={s.title} className="px-5 sm:px-6 py-4 flex gap-3">
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBEBEB",
                color: s.accent === "#C6F135" ? "#0A0A0A" : s.accent,
              }}
            >
              {s.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-black">
                <span
                  className="font-mono text-[10px] mr-1.5"
                  style={{ color: "#9CA3AF" }}
                >
                  {i + 1}
                </span>
                {s.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-[1.5] text-gray-500">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
