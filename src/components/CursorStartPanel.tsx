"use client";

import { useState } from "react";
import { Code2, Copy, Check, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CLIENT_TABS = [
  { key: "cursor", label: "Cursor", path: "~/.cursor/mcp.json" },
  { key: "codex", label: "Codex", path: "~/.codex/config.toml" },
  { key: "claude", label: "Claude Code", path: "~/.claude.json" },
] as const;

type ClientKey = (typeof CLIENT_TABS)[number]["key"];

function buildSnippet(client: ClientKey, briefSlug: string): string {
  const baseConfig = (() => {
    if (client === "cursor") {
      return `{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp",
      "headers": { "Authorization": "Bearer ant_YOUR_TOKEN" }
    }
  }
}`;
    }
    if (client === "codex") {
      return `[mcp_servers.antry]
url = "https://antry.com/api/mcp"
headers = { Authorization = "Bearer ant_YOUR_TOKEN" }`;
    }
    return `{
  "mcpServers": {
    "antry": {
      "type": "http",
      "url": "https://antry.com/api/mcp",
      "headers": { "Authorization": "Bearer ant_YOUR_TOKEN" }
    }
  }
}`;
  })();

  const targetPath = CLIENT_TABS.find((item) => item.key === client)?.path ?? "~/.cursor/mcp.json";

  return `# 1) Add to ${targetPath}
${baseConfig}

# 2) Restart your client. Then in chat:
> Use Antry to start_attempt on "${briefSlug}"`;
}

/**
 * Inline panel on the Brief page that shows candidates how to start the
 * attempt from inside Cursor, Codex, or Claude Code via the Antry MCP. The Brief's
 * own Lab CTA stays as the simpler/web path; this is the IDE-native path.
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
      className="rounded-lg overflow-hidden"
      style={{
        background: "#0A0A0A",
        border: "1px solid rgba(32,245,160,0.25)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-5 flex items-center gap-4 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "rgba(32,245,160,0.14)" }}
        >
          <Terminal className="w-4 h-4" style={{ color: "#20F5A0" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1"
            style={{ color: "#20F5A0" }}
          >
            New: work in your IDE
          </p>
          <p className="text-[14px] font-bold tracking-[-0.005em] text-white leading-[1.3]">
            Start in Cursor, Codex, or Claude Code
          </p>
          <p
            className="mt-0.5 text-[12px] leading-[1.5]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Real IDE, signed at the gateway. No browser sandbox.
          </p>
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {open ? "Hide" : "Show config"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div
                className="inline-flex rounded-[10px] p-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
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
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
                      style={{
                        background: active ? "#20F5A0" : "transparent",
                        color: active ? "#0A0A0A" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <pre
                className="mt-3 rounded-[12px] p-4 text-[11px] leading-[1.55] font-mono overflow-x-auto whitespace-pre"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {snippet}
              </pre>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[34px] text-[12px] font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: "#20F5A0", color: "#0A0A0A" }}
                  data-cta="lime"
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
                  href="/agents"
                  className="text-[12px] font-semibold inline-flex items-center gap-1"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <Code2 className="w-3 h-3" />
                  Full docs →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
