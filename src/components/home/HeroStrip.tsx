"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * First-visit hero strip — one sentence that answers "what is this?".
 *
 * Editorial, no decorative noise. Dismissible: state persists in
 * localStorage under `antry.hero.dismissed`. To keep the static shell
 * intact we render visible by default on the server and only hide
 * after hydration if the user has dismissed it; that avoids a layout
 * flash and keeps the band crawlable for SEO.
 */

const STORAGE_KEY = "antry.hero.dismissed";

export function HeroStrip() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch {
      // localStorage unavailable (private mode, SSR) — leave visible.
    }
  }, []);

  if (dismissed) return null;

  function onDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — we still hide in this session.
    }
    setDismissed(true);
  }

  return (
    <div
      className="rounded-[14px] mb-4 flex items-center gap-3 px-4 sm:px-5 py-3.5"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
      }}
    >
      <span
        aria-hidden
        className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shrink-0"
      >
        Antry
      </span>
      <span
        aria-hidden
        className="hidden sm:inline-block w-px h-3 shrink-0"
        style={{ background: "#EBEBEB" }}
      />
      <p className="text-[13px] sm:text-[14px] leading-[1.45] text-[#0A0A0A] flex-1 min-w-0">
        The resume for the AI era —{" "}
        <span className="text-gray-500">
          ship in public, mint signed Receipts, get hired.
        </span>
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-[8px] text-gray-400 hover:text-[#0A0A0A] hover:bg-[#FAFAF7] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
