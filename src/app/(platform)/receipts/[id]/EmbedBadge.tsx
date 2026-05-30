"use client";

// Portable embed snippet. The narrative is "signed artifacts must travel" —
// a Receipt that only lives on antry.com is half a credential. The snippet
// below is the GitHub README / LinkedIn / portfolio hook.
//
// The badge.svg endpoint isn't wired yet — this surface just exposes the
// snippet so builders can adopt the convention early.

import { useState } from "react";
import { Check, Code2, Copy } from "lucide-react";

const BASE = "https://antry.com";

export function EmbedBadge({ receiptId }: { receiptId: string }) {
  const [copied, setCopied] = useState(false);

  const snippet = `<a href="${BASE}/receipts/${receiptId}">
  <img src="${BASE}/api/receipts/${receiptId}/badge.svg" alt="Antry Receipt" />
</a>`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="rounded-[16px] p-5 sm:p-6 print:hidden"
      style={{
        background: "#0A0A0A",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(198,241,53,0.12)" }}
        >
          <Code2 className="w-4 h-4" style={{ color: "#C6F135" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Embed badge
          </p>
          <p
            className="mt-0.5 text-[14px] font-bold tracking-[-0.01em]"
            style={{ color: "#FFFFFF" }}
          >
            Drop this Receipt into your README or portfolio.
          </p>
        </div>
      </div>

      <pre
        className="mt-4 rounded-[10px] p-3 text-[11px] leading-[1.55] overflow-x-auto font-mono"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <code>{snippet}</code>
      </pre>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Portable to LinkedIn, GitHub, Linear, anywhere.
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-[10px] px-3 h-[32px] text-[11px] font-semibold transition-colors"
          style={{
            background: copied ? "#C6F135" : "#FFFFFF",
            color: "#0A0A0A",
          }}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy snippet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
