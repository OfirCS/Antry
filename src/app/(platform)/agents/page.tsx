import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Terminal, Lock, Zap, Bot, ArrowRight, Check } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Antry MCP — work in your IDE, mint signed Receipts";
const DESCRIPTION =
  "Antry's Model Context Protocol server lets candidates work on Briefs from inside Cursor or Claude Code. Every prompt, tool call, and pivot is signed at the Antry gateway. Submit, get a Receipt — minted from the trace of your real IDE, not a sandbox.";

export const metadata: Metadata = {
  title: "MCP integration",
  description: DESCRIPTION,
  alternates: { canonical: "/agents" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/agents",
    image: ogImageUrl({
      title: "Cursor + Antry MCP.",
      subtitle: "Work in your real IDE. Sign every step. Mint Receipts.",
      eyebrow: "Antry · Agent integration",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const STEPS = [
  {
    n: 1,
    title: "Pick a Brief",
    body: "Browse Antry, find a Brief that matches the role. The Brief includes the rubric, allowed_tools, and time/token caps.",
  },
  {
    n: 2,
    title: "Open Cursor (or any MCP client)",
    body: "Antry MCP installed via one config block. Your bearer token is set; no other setup required.",
  },
  {
    n: 3,
    title: "start_attempt",
    body: "Cursor calls Antry's start_attempt tool. Returns a signed start timestamp + attempt_id. The clock starts.",
  },
  {
    n: 4,
    title: "Work normally",
    body: "Edit, prompt, run tools — exactly as you would on any project. Cursor logs each step to Antry through log_event. The trace is signed at the gateway, not your machine.",
  },
  {
    n: 5,
    title: "submit_attempt",
    body: "Done. Antry's grader reads the trace, computes the Builder Fingerprint, and mints a signed Receipt. Share the URL.",
  },
];

const LIFECYCLE_TOOLS = [
  {
    name: "start_attempt",
    desc: "Begin an instrumented Brief attempt. Returns attempt_id + signed start timestamp.",
    auth: true,
  },
  {
    name: "log_event",
    desc: "Record one event (prompt, tool_call, file_edit, pivot, note). Cursor calls this from its own tool wrappers.",
    auth: true,
  },
  {
    name: "submit_attempt",
    desc: "Close attempt, run grader, mint signed Receipt. Returns receipt_id, composite score, full Fingerprint.",
    auth: true,
  },
  {
    name: "get_attempt_status",
    desc: "Poll: active / submitted / graded. Returns receipt_id once minted.",
    auth: true,
  },
];

const READ_TOOLS = [
  {
    name: "search_briefs",
    desc: "Filter Briefs by query, difficulty, category. Use this to discover what to attempt.",
  },
  {
    name: "get_brief",
    desc: "Full Brief: prompt markdown, allowed_tools, ideal Fingerprint, caps.",
  },
  {
    name: "get_receipt",
    desc: "Public Receipt with builder, brief, composite score, Fingerprint, provenance.",
  },
  {
    name: "verify_receipt",
    desc: "Re-derive a Receipt's hash and signature server-side.",
  },
  {
    name: "list_top_builders",
    desc: "Builders ranked by composite or any single dimension.",
  },
  {
    name: "get_builder",
    desc: "Builder profile + their Receipts.",
  },
];

export default function AgentsPage() {
  return (
    <main>
      {/* ── Hero — the why ──────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#0A0A0A" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 0% 0%, rgba(32,245,160,0.10) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px] px-6 sm:px-10 pt-24 pb-20 sm:pt-32 sm:pb-24">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-7 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Bot className="w-3.5 h-3.5" style={{ color: "#20F5A0" }} />
            Cursor + Antry MCP
          </p>
          <h1
            className="font-display font-bold leading-[0.96] tracking-[-0.04em]"
            style={{ color: "#FFFFFF", fontSize: "clamp(2.4rem, 6vw, 4.4rem)" }}
          >
            Work in your <span style={{ color: "#20F5A0" }}>real IDE</span>.
            <br />
            Mint a signed Receipt.
          </h1>
          <p
            className="mt-7 max-w-[640px] text-[16px] sm:text-[18px] leading-[1.6]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            HackerRank and CoderPad force candidates into a fake browser
            sandbox. Antry doesn&apos;t. Install the MCP in Cursor (or any
            MCP client), pick a Brief, work normally — every prompt, tool
            call, and pivot is signed at the Antry gateway. The Receipt is
            minted from the trace of your real development setup, not a
            simulator.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="#install"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-7 h-[56px] text-[15px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{
                background: "#20F5A0",
                color: "#0A0A0A",
                boxShadow: "0 12px 30px rgba(32,245,160,0.32)",
              }}
              data-cta="lime"
            >
              Install in Cursor <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/briefs"
              className="text-[14px] font-semibold underline-offset-4 hover:underline transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Browse Briefs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why — the wedge ────────────────── */}
      <section style={{ background: "#F7F8FA" }} className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <div className="max-w-[640px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
              Why MCP
            </p>
            <h2
              className="font-display font-bold tracking-[-0.03em] text-black leading-[1.02]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
            >
              The Lab is wherever
              <br />
              <span className="text-gray-400">you already work.</span>
            </h2>
            <p className="mt-6 text-[16px] leading-[1.6] text-gray-700">
              Other eval platforms put the candidate in a browser sandbox.
              You don&apos;t code in a browser sandbox. You code in your IDE
              with your editor settings, your git config, your shell, your
              models. The Antry MCP turns that environment into the Lab —
              instrumented at the protocol level, signed at our gateway,
              graded by an Agent-as-Judge.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
            <BenefitCard
              icon={<Zap className="w-4 h-4" style={{ color: "#0A0A0A" }} />}
              title="No context switch"
              body="Cursor / Claude Code / your existing setup. Zero retraining for the candidate."
            />
            <BenefitCard
              icon={<Lock className="w-4 h-4" style={{ color: "#0A0A0A" }} />}
              title="Unforgeable trace"
              body="Every event signed at the Antry gateway with HMAC-SHA256 + qualified timestamp. Same scheme as our hosted Lab."
            />
            <BenefitCard
              icon={<Code2 className="w-4 h-4" style={{ color: "#0A0A0A" }} />}
              title="Authentic Fingerprint"
              body="The Fingerprint reflects how you actually code, not how you perform inside a sandbox."
            />
          </div>
        </div>
      </section>

      {/* ── How — 5 step flow ──────────────── */}
      <section style={{ background: "#FFFFFF" }} className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
            The flow
          </p>
          <h2
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.02]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            Five tool calls. One Receipt.
          </h2>

          <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-lg p-5 sm:p-6 bg-white relative"
                style={{ border: "1.5px solid #E5E7EB" }}
              >
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[14px] font-bold font-display mb-3"
                  style={{ background: "#20F5A0", color: "#0A0A0A" }}
                >
                  {s.n}
                </span>
                <h3 className="text-[14px] font-bold tracking-[-0.005em] text-black leading-[1.3]">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-[1.55] text-gray-600">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Tools ───────────────────────────── */}
      <section style={{ background: "#F7F8FA" }} className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
            Tools
          </p>
          <h2
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.02]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            Lifecycle + discovery.
          </h2>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.6] text-gray-700">
            Lifecycle tools (auth-gated, internal-only beta) drive the
            attempt. Discovery tools are open and let you browse Briefs and
            Receipts from anywhere.
          </p>

          {/* Lifecycle */}
          <h3 className="mt-12 mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-black inline-flex items-center gap-2">
            <Lock className="w-3 h-3" /> Lifecycle (auth required)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LIFECYCLE_TOOLS.map((t) => (
              <ToolCard
                key={t.name}
                name={t.name}
                desc={t.desc}
                auth={t.auth}
              />
            ))}
          </div>

          {/* Discovery */}
          <h3 className="mt-12 mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-black">
            Discovery (open)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {READ_TOOLS.map((t) => (
              <ToolCard key={t.name} name={t.name} desc={t.desc} />
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
            One config block.
          </h2>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.6] text-gray-700">
            Get your bearer token from{" "}
            <Link href="/settings/api-keys" className="font-semibold text-black underline">
              /settings/api-keys
            </Link>
            . Paste into your client&apos;s MCP config. Restart and Antry
            shows up in the tools list.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            <ClientCard
              title="Cursor"
              path="~/.cursor/mcp.json"
              snippet={`{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ant_YOUR_TOKEN"
      }
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
      "url": "https://antry.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ant_YOUR_TOKEN"
      }
    }
  }
}`}
            />
            <ClientCard
              title="Smoke test (curl)"
              path="discovery, no auth"
              snippet={`curl -X POST https://antry.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
            />
            <ClientCard
              title="Smoke test (curl, auth)"
              path="lifecycle"
              snippet={`curl -X POST https://antry.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ant_YOUR_TOKEN" \\
  -d '{
    "jsonrpc":"2.0","id":1,
    "method":"tools/call",
    "params":{
      "name":"start_attempt",
      "arguments":{"brief_slug":"streaming-rag-pipeline"}
    }
  }'`}
            />
          </div>

          <div
            className="mt-12 rounded-lg p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-5 items-center"
            style={{
              background: "rgba(32,245,160,0.06)",
              border: "1px solid rgba(32,245,160,0.4)",
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: "#0A0A0A" }}
            >
              <Check className="w-5 h-5" style={{ color: "#20F5A0" }} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black">
                Internal beta. Email for early access.
              </h3>
              <p className="mt-1 text-[14px] leading-[1.55] text-gray-700 max-w-[560px]">
                Lifecycle endpoints are gated to private partners during the
                beta. Discovery tools are open.{" "}
                <a
                  href="mailto:[email protected]"
                  className="underline font-semibold text-black"
                >
                  [email protected]
                </a>{" "}
                for a token.
              </p>
            </div>
            <Link
              href="/receipts/methodology"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 self-start sm:self-center"
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

function BenefitCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-lg p-6 bg-white"
      style={{ border: "1px solid #E5E7EB" }}
    >
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-md mb-4"
        style={{ background: "rgba(32,245,160,0.18)" }}
      >
        {icon}
      </span>
      <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
        {title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-600">{body}</p>
    </div>
  );
}

function ToolCard({
  name,
  desc,
  auth = false,
}: {
  name: string;
  desc: string;
  auth?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-5 sm:p-6 bg-white"
      style={{ border: "1px solid #E5E7EB" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: "rgba(32,245,160,0.18)" }}
        >
          <Code2 className="w-3.5 h-3.5 text-black" />
        </span>
        <code className="text-[13px] font-mono font-semibold text-black">
          {name}
        </code>
        {auth && (
          <span
            className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
            style={{
              background: "#0A0A0A",
              color: "#20F5A0",
            }}
          >
            <Lock className="w-2.5 h-2.5" />
            Auth
          </span>
        )}
      </div>
      <p className="text-[13px] leading-[1.55] text-gray-600">{desc}</p>
    </div>
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
      className="rounded-lg p-5 sm:p-6 flex flex-col"
      style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}
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
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
      >
        {snippet}
      </pre>
    </div>
  );
}
