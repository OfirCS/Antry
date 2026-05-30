"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Key,
  Terminal,
} from "lucide-react";

const CLIENT_TABS = [
  { key: "cursor", label: "Cursor", path: "~/.cursor/mcp.json" },
  { key: "claude", label: "Claude Code", path: "~/.claude.json" },
] as const;

type ClientKey = (typeof CLIENT_TABS)[number]["key"];

const SNIPPETS: Record<ClientKey, string> = {
  cursor: `{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp",
      "headers": { "Authorization": "Bearer ant_YOUR_TOKEN" }
    }
  }
}`,
  claude: `{
  "mcpServers": {
    "antry": {
      "type": "http",
      "url": "https://antry.com/api/mcp",
      "headers": { "Authorization": "Bearer ant_YOUR_TOKEN" }
    }
  }
}`,
};

/**
 * Step 3 — Install the Antry MCP. We don't verify the install; the
 * user clicks "I'm connected" when they say so. Same shape as the
 * /agents doc panel, so a builder who's been here once recognizes it.
 */
export function StepConnect({ onNext }: { onNext: () => void }) {
  const [tab, setTab] = useState<ClientKey>("cursor");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPETS[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore — clipboard is best-effort */
    }
  };

  return (
    <div>
      <h1
        className="font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.05]"
        style={{ fontSize: "clamp(1.6rem, 3.6vw, 2rem)" }}
      >
        Connect Cursor.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-gray-600">
        Three steps. You stay in your IDE.
      </p>

      <ol className="mt-6 space-y-3">
        <MicroStep
          n={1}
          icon={<Key className="w-3.5 h-3.5" />}
          title="Mint a bearer token"
          body="Tokens scope your trace to your account. Shown once at mint time."
          action={
            <Link
              href="/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[8px] px-3 h-8 text-[12px] font-bold transition-all hover:-translate-y-0.5"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Open settings <ExternalLink className="w-3 h-3" />
            </Link>
          }
        />

        <MicroStep
          n={2}
          icon={<Terminal className="w-3.5 h-3.5" />}
          title={`Add to ${CLIENT_TABS.find((c) => c.key === tab)!.path}`}
          body="Paste the snippet. Replace ant_YOUR_TOKEN with the one you just minted."
        >
          <div className="mt-3">
            <div
              className="inline-flex rounded-[8px] p-0.5"
              style={{ background: "#F5F5F5" }}
              role="tablist"
              aria-label="MCP client"
            >
              {CLIENT_TABS.map((c) => {
                const active = tab === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(c.key)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors"
                    style={{
                      background: active ? "#0A0A0A" : "transparent",
                      color: active ? "#FFFFFF" : "#737373",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div className="relative mt-2">
              <pre
                className="rounded-[10px] p-3 pr-12 text-[11px] leading-[1.55] font-mono text-[#0A0A0A] overflow-x-auto whitespace-pre"
                style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
              >
                {SNIPPETS[tab]}
              </pre>
              <button
                type="button"
                onClick={onCopy}
                aria-label={copied ? "Copied" : "Copy snippet"}
                className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-[#EBEBEB]"
                style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </MicroStep>

        <MicroStep
          n={3}
          icon={<Terminal className="w-3.5 h-3.5" />}
          title="Restart your IDE. Then ask:"
          body={
            <code
              className="inline-block mt-1.5 px-2 py-1 rounded text-[12px] font-mono text-[#0A0A0A]"
              style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
            >
              Use Antry to start_attempt on streaming-rag-pipeline
            </code>
          }
        />
      </ol>

      <button
        type="button"
        onClick={onNext}
        className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-[10px] px-5 h-11 text-[14px] font-bold transition-all hover:-translate-y-0.5"
        style={{ background: "#0A0A0A", color: "#FFFFFF" }}
      >
        I&apos;m connected <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function MicroStep({
  n,
  icon,
  title,
  body,
  action,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <li
      className="rounded-[12px] p-4"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0 mt-0.5 font-display font-bold text-[11px]"
          style={{ background: "#C6F135", color: "#0A0A0A" }}
        >
          {n}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#0A0A0A] inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-flex text-gray-500"
            >
              {icon}
            </span>
            {title}
          </p>
          <div className="mt-1 text-[12.5px] leading-[1.55] text-gray-600">
            {body}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </li>
  );
}
