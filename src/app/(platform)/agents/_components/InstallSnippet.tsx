"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Tabbed install snippet for Cursor / Claude Code. Two tabs, one copy button.
 * Stripe-docs visual: dark code block, white text, hairline border. Light tab row.
 *
 * Kept tightly local — only used on /agents. If a second docs page needs the
 * same pattern, lift to shared components.
 */

type Tab = {
  id: string;
  label: string;
  path: string;
  snippet: string;
};

const TABS: Tab[] = [
  {
    id: "cursor",
    label: "Cursor",
    path: "~/.cursor/mcp.json",
    snippet: `{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ant_YOUR_TOKEN"
      }
    }
  }
}`,
  },
  {
    id: "claude",
    label: "Claude Code",
    path: "~/.claude.json",
    snippet: `{
  "mcpServers": {
    "antry": {
      "type": "http",
      "url": "https://antry.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ant_YOUR_TOKEN"
      }
    }
  }
}`,
  },
];

export function InstallSnippet() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const [copied, setCopied] = useState(false);
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0];

  async function copy() {
    try {
      await navigator.clipboard.writeText(active.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard blocked — silent. Users can still select + copy by hand.
    }
  }

  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{ border: "1px solid #EBEBEB", background: "#FFFFFF" }}
    >
      {/* Tab row */}
      <div
        className="flex items-center justify-between gap-3 px-3 sm:px-4 h-11"
        style={{ borderBottom: "1px solid #EBEBEB", background: "#FAFAF7" }}
      >
        <div role="tablist" aria-label="MCP client" className="flex items-center gap-1">
          {TABS.map((t) => {
            const isActive = t.id === activeId;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(t.id)}
                className="text-[12px] font-semibold rounded-md px-2.5 h-7 transition-colors"
                style={{
                  background: isActive ? "#FFFFFF" : "transparent",
                  color: isActive ? "#0A0A0A" : "#6B6B6B",
                  border: isActive ? "1px solid #EBEBEB" : "1px solid transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <code className="hidden sm:inline text-[11px] font-mono" style={{ color: "#6B6B6B" }}>
            {active.path}
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy snippet"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2 h-7 transition-colors"
            style={{
              background: "#FFFFFF",
              color: "#0A0A0A",
              border: "1px solid #EBEBEB",
            }}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" style={{ color: "#0A0A0A" }} />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <pre
        className="m-0 px-5 py-5 text-[12.5px] leading-[1.6] font-mono overflow-x-auto whitespace-pre"
        style={{ background: "#0A0A0A", color: "#FFFFFF" }}
      >
        {active.snippet}
      </pre>
    </div>
  );
}
