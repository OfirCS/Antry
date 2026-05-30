"use client";

/**
 * Share affordance next to the page title.
 *
 * - On mobile (Web Share API available): triggers the native share sheet
 *   with the page URL.
 * - On desktop (no Web Share API): copies the URL and flashes a "Copied"
 *   confirmation for 1.6s.
 *
 * Keeps the visual weight of a secondary editorial chip — black border on
 * white, no background tint — so the button doesn't compete with the title.
 */

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type Props = {
  title: string;
  text?: string;
};

export function ShareButton({ title, text }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    // Prefer the native share sheet on platforms that expose it (mobile).
    // navigator.share isn't typed strictly in older lib.dom — feature-detect.
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title, text, url });
        return;
      } catch {
        // User cancelled the share sheet — fall through to copy as a no-op.
        return;
      }
    }

    // Desktop fallback: copy to clipboard, flash confirmation.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API rejected (e.g., insecure context). Silent fail — user
      // can still copy the URL from the address bar.
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-colors"
      style={{
        background: "#FFFFFF",
        color: "#0A0A0A",
        border: "1px solid #EBEBEB",
      }}
      aria-label="Share this hackathon"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
          Copied
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );
}
