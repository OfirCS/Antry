import type { Metadata } from "next";
import Link from "next/link";
import { Code2, ExternalLink, Terminal, Zap, Bot } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Antry MCP — agent integration";
const DESCRIPTION =
  "Antry exposes Receipts, Briefs, and Fingerprints over the Model Context Protocol. Connect Cursor, Claude Code, ChatGPT, or any MCP client and pull Antry data natively.";

export const metadata: Metadata = {
  title: "MCP integration",
  description: DESCRIPTION,
  alternates: { canonical: "/agents" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/agents",
    image: ogImageUrl({
      title: "Antry on MCP.",
      subtitle: "Receipts and Fingerprints, callable from any agent.",
      eyebrow: "Antry · Agent integration",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const TOOLS = [
  {
    name: "search_briefs",
    desc: "Filter Briefs by query, difficulty, category. Returns slug + title + sponsor + caps.",
  },
  {
    name: "get_brief",
    desc: "Full Brief by slug — prompt markdown, allowed_tools, ideal Fingerprint.",
  },
  {
    name: "get_receipt",
    desc: "Public Receipt with builder, brief, composite score, full 7-dim Fingerprint, provenance.",
  },
  {
    name: "verify_receipt",
    desc: "Server-side verification — SHA-256 content hash, public-key fingerprint, signed-at timestamp, signature_valid bool.",
  },
  {
    name: "list_top_builders",
    desc: "Builders ranked by composite or any single dimension (e.g. recoveryIndex).",
  },
  {
    name: "get_builder",
    desc: "Builder profile + their public Receipts sorted by score.",
  },
];

export default function AgentsPage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#0A0A0A" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 0% 0%, rgba(198,241,53,0.10) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px] px-6 sm:px-10 pt-24 pb-20 sm:pt-32 sm:pb-24">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-7 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Bot className="w-3.5 h-3.5" style={{ color: "#C6F135" }} />
            Antry on MCP
          </p>
          <h1
            className="font-display font-bold leading-[0.96] tracking-[-0.04em]"
            style={{ color: "#FFFFFF", fontSize: "clamp(2.4rem, 6vw, 4.4rem)" }}
          >
            Pull Receipts <span style={{ color: "#C6F135" }}>natively</span>
            <br />
            from any agent.
          </h1>
          <p
            className="mt-7 max-w-[640px] text-[16px] sm:text-[18px] leading-[1.6]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Antry exposes its public data over the Model Context Protocol.
            Cursor, Claude Code, ChatGPT, your ATS — anything that speaks MCP
            can search Briefs, fetch Receipts, verify provenance, and rank
            builders by Fingerprint dimension.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="#install"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 h-[56px] text-[15px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{
                background: "#C6F135",
                color: "#0A0A0A",
                boxShadow: "0 12px 30px rgba(198,241,53,0.32)",
              }}
              data-cta="lime"
            >
              Install in your client
            </Link>
            <a
              href="/api/mcp"
              className="text-[14px] font-semibold underline-offset-4 hover:underline transition-colors inline-flex items-center gap-1.5"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Server manifest <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Tools ───────────────────────────── */}
      <section style={{ background: "#FAFAF7" }} className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
            Tools
          </p>
          <h2
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.02] max-w-[640px]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            Six read-only tools.
          </h2>
          <p className="mt-5 max-w-[560px] text-[16px] leading-[1.6] text-gray-600">
            All public, no auth required for v0. Rate-limited per IP. Mutating
            tools (mint Receipt, post Brief) are gated to authenticated keys
            and roll out in v0.2.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-3">
            {TOOLS.map((t) => (
              <div
                key={t.name}
                className="rounded-[16px] p-5 sm:p-6 bg-white"
                style={{ border: "1px solid #EBEBEB" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{ background: "rgba(198,241,53,0.18)" }}
                  >
                    <Code2 className="w-3.5 h-3.5 text-black" />
                  </span>
                  <code className="text-[13px] font-mono font-semibold text-black">
                    {t.name}
                  </code>
                </div>
                <p className="text-[13px] leading-[1.55] text-gray-600">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Install ─────────────────────────── */}
      <section
        id="install"
        className="py-24 sm:py-28"
        style={{ background: "#FFFFFF" }}
      >
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4 inline-flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            Install
          </p>
          <h2
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.02] max-w-[640px]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            One config block per client.
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            <ClientCard
              title="Cursor"
              path="~/.cursor/mcp.json"
              snippet={`{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp"
    }
  }
}`}
            />
            <ClientCard
              title="Claude Code"
              path="~/.claude.json"
              snippet={`{
  "mcpServers": {
    "antry": {
      "type": "http",
      "url": "https://antry.com/api/mcp"
    }
  }
}`}
            />
            <ClientCard
              title="ChatGPT (custom GPT)"
              path="Action manifest"
              snippet={`# In your custom GPT's Actions panel:
URL: https://antry.com/api/mcp
Auth: None (read-only public data)`}
            />
            <ClientCard
              title="Raw JSON-RPC"
              path="curl"
              snippet={`curl -X POST https://antry.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0","id":1,
    "method":"tools/call",
    "params":{
      "name":"search_briefs",
      "arguments":{"query":"rag"}
    }
  }'`}
            />
          </div>

          <div
            className="mt-12 rounded-[20px] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-5 items-center"
            style={{
              background: "rgba(198,241,53,0.06)",
              border: "1px solid rgba(198,241,53,0.4)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "#0A0A0A" }}
            >
              <Zap className="w-5 h-5" style={{ color: "#C6F135" }} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black">
                Building agentic products on top of Antry?
              </h3>
              <p className="mt-1 text-[14px] leading-[1.55] text-gray-700 max-w-[560px]">
                Mutating endpoints (post Brief, mint Receipt, register evaluator
                agent) ship in v0.2 behind authenticated API keys. Email{" "}
                <a
                  href="mailto:[email protected]"
                  className="underline font-semibold text-black"
                >
                  [email protected]
                </a>{" "}
                for early access.
              </p>
            </div>
            <Link
              href="/receipts/methodology"
              className="inline-flex items-center gap-1.5 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 self-start sm:self-center"
              style={{ background: "#0A0A0A", color: "#fff" }}
            >
              Methodology
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ClientCard({
  title,
  path,
  snippet,
}: {
  title: string;
  path: string;
  snippet: string;
}) {
  return (
    <div
      className="rounded-[20px] p-5 sm:p-6 flex flex-col"
      style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
          {title}
        </h3>
        <code className="text-[11px] font-mono text-gray-500 truncate">
          {path}
        </code>
      </div>
      <pre
        className="rounded-[12px] p-4 text-[12px] leading-[1.55] font-mono text-gray-800 overflow-x-auto whitespace-pre"
        style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
      >
        {snippet}
      </pre>
    </div>
  );
}
