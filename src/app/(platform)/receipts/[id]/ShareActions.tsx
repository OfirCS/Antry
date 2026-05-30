"use client";

// Top-right Share row for the Receipt detail page. The Receipt is the
// most-shared link on Antry — when a builder posts it to LinkedIn this is
// the page recruiters land on, so the share affordances are first-class.
//
// Three actions:
//   1. Copy URL (clipboard with transient "Copied" state)
//   2. Share on LinkedIn (sharing-share-offsite link — opens in new tab)
//   3. Download as PDF — placeholder that triggers window.print() until
//      we wire a real PDF export route.

import { useState } from "react";
import { Check, Copy, Linkedin, Printer } from "lucide-react";

type Props = {
  receiptId: string;
  builderName: string;
  briefTitle: string;
  score: number;
};

export function ShareActions({ receiptId, builderName, briefTitle, score }: Props) {
  const [copied, setCopied] = useState(false);

  const url = `https://antry.com/receipts/${receiptId}`;
  const liTitle = encodeURIComponent(
    `${builderName} shipped ${briefTitle} — Antry Receipt ${score}/100`
  );
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}&title=${liTitle}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const onPrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap print:hidden">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[36px] text-[12px] font-semibold transition-colors"
        style={{
          background: "#FFFFFF",
          border: "1px solid #EBEBEB",
          color: "#0A0A0A",
        }}
        aria-label="Copy Receipt URL"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Copied
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copy link
          </>
        )}
      </button>
      <a
        href={liUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[36px] text-[12px] font-semibold transition-colors"
        style={{
          background: "#FFFFFF",
          border: "1px solid #EBEBEB",
          color: "#0A0A0A",
        }}
      >
        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
      </a>
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[36px] text-[12px] font-semibold transition-colors"
        style={{
          background: "#0A0A0A",
          color: "#FFFFFF",
        }}
        title="Save as PDF via your browser's print dialog"
      >
        <Printer className="w-3.5 h-3.5" /> Save as PDF
      </button>
    </div>
  );
}
