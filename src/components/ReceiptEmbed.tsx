"use client";

import { useState } from "react";
import { Code2, Check, Copy, Twitter, Link as LinkIcon } from "lucide-react";

type Props = { receiptId: string };

const BASE = "https://antry.com";

const TABS = [
  { key: "embed", label: "Embed", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "markdown", label: "Markdown", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "link", label: "Link", icon: <LinkIcon className="w-3.5 h-3.5" /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ReceiptEmbed({ receiptId }: Props) {
  const [tab, setTab] = useState<TabKey>("embed");
  const [copied, setCopied] = useState(false);

  const url = `${BASE}/receipts/${receiptId}`;
  const snippets: Record<TabKey, string> = {
    embed: `<script async src="${BASE}/embed/receipt/${receiptId}.js"></script>`,
    markdown: `[![Antry Receipt](${BASE}/api/og?receipt=${receiptId})](${url})`,
    link: url,
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore — fall back to manual select */
    }
  };

  const xText = encodeURIComponent(
    `I minted a Receipt on Antry. Show your receipts → `
  );
  const xLink = `https://x.com/intent/tweet?text=${xText}&url=${encodeURIComponent(url)}`;

  return (
    <div
      className="rounded-lg p-6 sm:p-7 flex flex-col"
      style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "#0A0A0A" }}
        >
          <Code2 className="w-4 h-4" style={{ color: "#20F5A0" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            Share
          </p>
          <p className="mt-1 text-[15px] font-bold tracking-[-0.01em] text-black">
            Embed this Receipt
          </p>
          <p className="mt-0.5 text-[12px] text-gray-500">
            Drop the badge in your README, blog, or portfolio.
          </p>
        </div>
      </div>

      <div
        className="mt-4 inline-flex rounded-[10px] p-0.5 self-start"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
        role="tablist"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.14em] inline-flex items-center gap-1.5 transition-colors"
              style={{
                background: active ? "#0A0A0A" : "transparent",
                color: active ? "#FFFFFF" : "#4B5563",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        className="mt-3 flex-1 rounded-[12px] p-3 font-mono text-[11px] leading-[1.5] text-gray-700 break-all overflow-x-auto"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
      >
        {snippets[tab]}
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[34px] text-[12px] font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "#0A0A0A", color: "#FFFFFF" }}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy snippet
            </>
          )}
        </button>
        <a
          href={xLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[34px] text-[12px] font-semibold border border-gray-200 hover:border-gray-400 transition-colors text-black"
        >
          <Twitter className="w-3.5 h-3.5" />
          Share on X
        </a>
      </div>
    </div>
  );
}
