"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import {
  dismissOnboardingBanner,
  isFirstVisit,
  isOnboardingBannerDismissed,
} from "@/lib/onboarding/state";

/**
 * "First time? Mint your first Receipt → /onboarding" banner.
 *
 * Renders nothing on the server (and on first paint) to avoid a
 * hydration flash. Once mounted, we check the two localStorage flags:
 *   - first visit (onboarding not yet completed)
 *   - banner not already dismissed
 *
 * Dismissal is sticky across sessions — the user said no, we listen.
 */
export function HomeOnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isFirstVisit() && !isOnboardingBannerDismissed());
  }, []);

  if (!show) return null;

  const onDismiss = () => {
    dismissOnboardingBanner();
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Onboarding"
      className="rounded-[14px] p-3 sm:p-3.5 mb-3 flex items-center gap-3"
      style={{
        background: "rgba(198,241,53,0.10)",
        border: "1px solid rgba(198,241,53,0.4)",
      }}
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0"
        style={{ background: "#C6F135", color: "#0A0A0A" }}
      >
        <Sparkles className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] sm:text-[14px] font-bold text-[#0A0A0A] leading-[1.3]">
          First time on Antry?
        </p>
        <p className="text-[12px] text-gray-600 leading-[1.4]">
          Claim a handle, install the MCP, mint your first Receipt.
        </p>
      </div>
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-1 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-all hover:-translate-y-0.5 shrink-0"
        style={{ background: "#0A0A0A", color: "#FFFFFF" }}
      >
        <span className="hidden sm:inline">Start</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-black/[0.04] text-gray-500 hover:text-[#0A0A0A] shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
