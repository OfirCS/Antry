"use client";

import { useState } from "react";
import { Code2, Copy, Check, Terminal } from "lucide-react";

const CLIENT_TABS = [
  { key: "cursor", label: "Cursor", path: "~/.cursor/mcp.json" },
  { key: "claude", label: "Claude Code", path: "~/.claude.json" },
] as const;

type ClientKey = (typeof CLIENT_TABS)[number]["key"];

function buildSnippet(client: ClientKey, briefSlug: string): string {
  const baseConfig =
    client === "cursor"
      ? `{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp",
      "headers": { "Authorization": "Bearer ant_YOUR_TOKEN" }
    }
  }
}`
      : `{
  "mcpServers": {
    "antry": {
      "type": "http",
      "url": "https://antry.com/api/mcp",
      "headers": { "Authorization": "Bearer ant_YOUR_TOKEN" }
    }
  }
}`;
  return `# 1) Add to ${client === "cursor" ? "~/.cursor/mcp.json" : "~/.claude.json"}
${baseConfig}

# 2) Restart your client. Then in chat:
> Use Antry to start_attempt on "${briefSlug}"`;
}

/**
 * Editorial-light Cursor MCP entry panel for the Brief page.
 *
 * Single primary action — open it once, copy snippet, paste into Cursor.
 * Tabs for the two MCP-client variants. Plays nicely on a cream
 * `#FAFAF7` page background and a white card surface.
 */
export function CursorStartPanel({ briefSlug }: { briefSlug: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ClientKey>("cursor");
  const [copied, setCopied] = useState(false);

  const snippet = buildSnippet(tab, briefSlug);

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
      className="rounded-[14px] overflow-hidden"
      style={{
        background: "#0A0A0A",
        boxShadow: "0 12px 28px rgba(10,10,10,0.18)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.04]"
        aria-expanded={open}
      >
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: "#C6F135" }}
        >
          <Terminal className="w-4 h-4" style={{ color: "#0A0A0A" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold tracking-[-0.005em] text-white leading-[1.3]">
            Start in Cursor
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            Your IDE → start_attempt → signed Receipt
          </p>
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.16em] px-2 py-1 rounded-md"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {open ? "Hide" : "Setup"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0">
          <div
            className="inline-flex rounded-[10px] p-0.5 mt-1"
            style={{
              background: "rgba(255,255,255,0.05)",
            }}
            role="tablist"
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
                    background: active ? "#C6F135" : "transparent",
                    color: active ? "#0A0A0A" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <pre
            className="mt-3 rounded-[10px] p-3 text-[11px] leading-[1.55] font-mono overflow-x-auto whitespace-pre"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {snippet}
          </pre>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-8 text-[12px] font-bold transition-all hover:-translate-y-0.5"
              style={{ background: "#C6F135", color: "#0A0A0A" }}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
            <a
              href="/agents"
              className="text-[11px] font-semibold inline-flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              <Code2 className="w-3 h-3" />
              Docs →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
