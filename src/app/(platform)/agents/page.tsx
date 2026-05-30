import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Hash,
  Fingerprint,
  FileText,
  BookOpen,
  User,
  Signature,
} from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { InstallSnippet } from "./_components/InstallSnippet";

const TITLE = "Antry MCP — install in 30 seconds";
const DESCRIPTION =
  "Protocol-signed proof-of-work for AI-native engineers. Install in Cursor or Claude Code. Mint signed Receipts from your IDE.";

export const metadata: Metadata = {
  title: "MCP integration",
  description: DESCRIPTION,
  alternates: { canonical: "/agents" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/agents",
    image: ogImageUrl({
      title: "Antry MCP.",
      subtitle: "Proof-of-work for AI-native engineers.",
      eyebrow: "Antry · MCP",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

type LifecycleTool = {
  name: string;
  sig: string;
  desc: string;
};

const LIFECYCLE: LifecycleTool[] = [
  {
    name: "start_attempt",
    sig: "start_attempt(brief_slug)",
    desc: "Begin a Brief attempt. Returns attempt_id + signed start timestamp.",
  },
  {
    name: "log_event",
    sig: "log_event(attempt_id, type, payload)",
    desc: "Record one step in the trace. Cursor calls this from its tool wrappers.",
  },
  {
    name: "submit_attempt",
    sig: "submit_attempt(attempt_id)",
    desc: "Close attempt, run grader, mint signed Receipt.",
  },
  {
    name: "get_attempt_status",
    sig: "get_attempt_status(attempt_id)",
    desc: "Check status: active / submitted / graded.",
  },
];

const DISCOVERY: LifecycleTool[] = [
  {
    name: "search_briefs",
    sig: "search_briefs(query?, difficulty?, category?)",
    desc: "Browse available Briefs. Filter by query, level, or category.",
  },
  {
    name: "get_brief",
    sig: "get_brief(slug)",
    desc: "Full Brief: prompt, allowed tools, ideal Fingerprint, caps.",
  },
  {
    name: "get_receipt",
    sig: "get_receipt(receipt_id)",
    desc: "Public Receipt with builder, score, Fingerprint, provenance.",
  },
  {
    name: "verify_receipt",
    sig: "verify_receipt(receipt_id)",
    desc: "Re-derive the Receipt's hash and signature server-side.",
  },
  {
    name: "list_top_builders",
    sig: "list_top_builders(dimension?, limit?)",
    desc: "Builders ranked by composite, or by any Fingerprint dimension.",
  },
  {
    name: "get_builder",
    sig: "get_builder(username)",
    desc: "Builder profile + their public Receipts.",
  },
];

const RECEIPT_PARTS = [
  {
    icon: Hash,
    label: "composite_score",
    value: "0–100 weighted from the 7 Fingerprint dimensions.",
  },
  {
    icon: Fingerprint,
    label: "Fingerprint",
    value:
      "7 dimensions: token economy, throughput, tool IQ, recovery, prompt discipline, verification, judgment.",
  },
  {
    icon: FileText,
    label: "Trace bundle",
    value: "Every event you logged — prompts, tool calls, edits, pivots.",
  },
  {
    icon: BookOpen,
    label: "Brief reference",
    value: "Slug, rubric, and ideal Fingerprint at attempt time.",
  },
  {
    icon: User,
    label: "Builder identity",
    value: "Your verified handle. Public unless you mark the Receipt private.",
  },
  {
    icon: Signature,
    label: "Sponsor signature",
    value: "HMAC-SHA256 over the canonical content hash, signed at our gateway.",
  },
];

const FAQ = [
  {
    q: "Is my code uploaded?",
    a: "No. Only the event metadata you log — type, timestamp, and the payload you pass. Source files stay on your machine.",
  },
  {
    q: "Can I retry a Brief?",
    a: "Yes. Only your most recent submission counts toward your Fingerprint.",
  },
  {
    q: "What if I don't use Cursor?",
    a: "Any MCP client works — Claude Code, custom agents, curl. The wire is JSON-RPC 2.0 over HTTP.",
  },
  {
    q: "How is it graded?",
    a: "An Agent-as-Judge reads your trace bundle against the Brief's rubric and ideal Fingerprint. The output is signed, not opinionated.",
  },
  {
    q: "What's the privacy story?",
    a: "Receipts are public by default — they're meant to be shared. You can mark a Receipt private; it still verifies, but the URL stops resolving for non-owners.",
  },
];

export default function AgentsPage() {
  return (
    <main style={{ background: "#FAFAF7" }}>
      {/* ── Header band ─────────────────────────────────── */}
      <section
        className="relative"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #EBEBEB",
        }}
      >
        {/* Lime 3px accent stripe at top */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#C6F135" }}
        />

        <div className="mx-auto max-w-[960px] px-6 sm:px-10 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "#737373" }}
          >
            MCP integration
          </p>
          <h1
            className="mt-4 font-display font-bold tracking-[-0.035em] leading-[1.02]"
            style={{ color: "#0A0A0A", fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}
          >
            Install in 30 seconds.
            <br />
            Mint signed Receipts from your IDE.
          </h1>
          <p
            className="mt-5 max-w-[600px] text-[16px] leading-[1.6]"
            style={{ color: "#525252" }}
          >
            Native to the MCP ecosystem — 9,652 servers, 97M downloads
            a month. One config block. Three tool calls —
            <code className="mx-1 font-mono text-[14px]" style={{ color: "#0A0A0A" }}>
              start_attempt
            </code>
            <span style={{ color: "#A3A3A3" }}>→</span>
            <code className="mx-1 font-mono text-[14px]" style={{ color: "#0A0A0A" }}>
              log_event
            </code>
            <span style={{ color: "#A3A3A3" }}>→</span>
            <code className="mx-1 font-mono text-[14px]" style={{ color: "#0A0A0A" }}>
              submit_attempt
            </code>
            — and you have a signed, shareable Receipt.
          </p>

          <div className="mt-8 flex items-center gap-5">
            <Link
              href="#install"
              className="inline-flex items-center gap-2 rounded-[12px] px-5 h-[44px] text-[14px] font-semibold whitespace-nowrap transition-transform hover:-translate-y-[1px]"
              style={{
                background: "#0A0A0A",
                color: "#FFFFFF",
              }}
            >
              Install <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#tools"
              className="text-[14px] font-semibold underline-offset-4 hover:underline transition-colors"
              style={{ color: "#0A0A0A" }}
            >
              Tool reference
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick install ──────────────────────────────── */}
      <section id="install" className="mx-auto max-w-[960px] px-6 sm:px-10 pt-20 sm:pt-24">
        <SectionHeader eyebrow="Quick install" title="Three steps." />

        <ol className="mt-10 flex flex-col gap-7">
          <Step n={1} title="Get a token">
            <p className="text-[14px] leading-[1.65]" style={{ color: "#525252" }}>
              Generate a bearer token at{" "}
              <Link
                href="/settings/api-keys"
                className="font-semibold underline underline-offset-2"
                style={{ color: "#0A0A0A" }}
              >
                /settings/api-keys
              </Link>
              . Copy the{" "}
              <code className="font-mono text-[13px]" style={{ color: "#0A0A0A" }}>
                ant_…
              </code>{" "}
              string — you&apos;ll paste it in the next step.
            </p>
          </Step>

          <Step n={2} title="Add to your MCP config">
            <p className="text-[14px] leading-[1.65] mb-4" style={{ color: "#525252" }}>
              Drop this into{" "}
              <code className="font-mono text-[13px]" style={{ color: "#0A0A0A" }}>
                ~/.cursor/mcp.json
              </code>{" "}
              or{" "}
              <code className="font-mono text-[13px]" style={{ color: "#0A0A0A" }}>
                ~/.claude.json
              </code>
              . Replace the placeholder with your token.
            </p>
            <InstallSnippet />
          </Step>

          <Step n={3} title="Restart your client">
            <p className="text-[14px] leading-[1.65]" style={{ color: "#525252" }}>
              Antry shows up in the tool list. In chat, try:
            </p>
            <pre
              className="mt-3 rounded-[12px] px-4 py-3 text-[13px] leading-[1.55] font-mono overflow-x-auto whitespace-pre"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Use Antry to start_attempt on streaming-rag-pipeline
            </pre>
          </Step>
        </ol>
      </section>

      {/* ── Tool reference ─────────────────────────────── */}
      <section id="tools" className="mx-auto max-w-[960px] px-6 sm:px-10 pt-24">
        <SectionHeader eyebrow="Tool reference" title="Ten tools, two groups." />

        <ToolGroup label="Lifecycle" tools={LIFECYCLE} />
        <ToolGroup label="Discovery" tools={DISCOVERY} className="mt-12" />
      </section>

      {/* ── Receipt anatomy ────────────────────────────── */}
      <section className="mx-auto max-w-[960px] px-6 sm:px-10 pt-24">
        <SectionHeader
          eyebrow="The Receipt"
          title="What gets signed."
          subtitle="Every Receipt is HMAC-signed at our gateway. Verifiable forever, by anyone."
        />

        <ul
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 rounded-[14px] overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          {RECEIPT_PARTS.map((p, i) => {
            const Icon = p.icon;
            const isLastRow = i >= RECEIPT_PARTS.length - 2;
            const isRightCol = i % 2 === 1;
            return (
              <li
                key={p.label}
                className="p-5 sm:p-6 flex items-start gap-3.5"
                style={{
                  borderBottom: isLastRow ? "none" : "1px solid #EBEBEB",
                  borderRight: isRightCol ? "none" : "1px solid #EBEBEB",
                }}
              >
                <span
                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg mt-[1px]"
                  style={{ background: "rgba(198,241,53,0.18)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#0A0A0A" }} />
                </span>
                <div>
                  <p
                    className="text-[13.5px] font-mono font-semibold"
                    style={{ color: "#0A0A0A" }}
                  >
                    {p.label}
                  </p>
                  <p
                    className="mt-1 text-[13px] leading-[1.55]"
                    style={{ color: "#525252" }}
                  >
                    {p.value}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[960px] px-6 sm:px-10 pt-24">
        <SectionHeader eyebrow="FAQ" title="Common questions." />

        <dl
          className="mt-10 rounded-[14px] overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          {FAQ.map((item, i) => (
            <div
              key={item.q}
              className="px-5 py-5 sm:px-7 sm:py-6"
              style={{
                borderBottom: i === FAQ.length - 1 ? "none" : "1px solid #EBEBEB",
              }}
            >
              <dt
                className="text-[14.5px] font-semibold tracking-[-0.005em]"
                style={{ color: "#0A0A0A" }}
              >
                {item.q}
              </dt>
              <dd
                className="mt-1.5 text-[14px] leading-[1.6]"
                style={{ color: "#525252" }}
              >
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[960px] px-6 sm:px-10 pt-24 pb-28">
        <div
          className="rounded-[20px] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EBEBEB",
          }}
        >
          <div>
            <h2
              className="font-display font-bold tracking-[-0.02em] leading-[1.1]"
              style={{ color: "#0A0A0A", fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
            >
              Ready when you are.
            </h2>
            <p
              className="mt-1.5 text-[14px] leading-[1.55]"
              style={{ color: "#525252" }}
            >
              Generate a token, paste the snippet, ship your first Receipt today.
            </p>
          </div>
          <Link
            href="/settings/api-keys"
            className="inline-flex items-center gap-2 rounded-[12px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-transform hover:-translate-y-[1px] self-start sm:self-auto"
            style={{
              background: "#C6F135",
              color: "#0A0A0A",
            }}
            data-cta="lime"
          >
            Get your token <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ── Local building blocks ────────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-[640px]">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "#737373" }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-3 font-display font-bold tracking-[-0.025em] leading-[1.05]"
        style={{ color: "#0A0A0A", fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-3 text-[15px] leading-[1.6]"
          style={{ color: "#525252" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-6 items-start">
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[14px] font-bold font-display"
        style={{
          background: "#C6F135",
          color: "#0A0A0A",
        }}
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0">
        <h3
          className="text-[16px] font-bold tracking-[-0.01em] mt-1"
          style={{ color: "#0A0A0A" }}
        >
          {title}
        </h3>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  );
}

function ToolGroup({
  label,
  tools,
  className = "",
}: {
  label: string;
  tools: LifecycleTool[];
  className?: string;
}) {
  return (
    <div className={`mt-10 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#C6F135" }}
          aria-hidden
        />
        <h3
          className="text-[12px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#0A0A0A" }}
        >
          {label}
        </h3>
      </div>
      <div
        className="rounded-[14px] overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
      >
        {tools.map((t, i) => (
          <div
            key={t.name}
            className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] gap-2 sm:gap-6 px-5 py-4 sm:px-6 sm:py-5"
            style={{
              borderBottom: i === tools.length - 1 ? "none" : "1px solid #EBEBEB",
            }}
          >
            <code
              className="font-mono text-[13px] leading-[1.5] font-semibold break-words"
              style={{ color: "#0A0A0A" }}
            >
              {t.sig}
            </code>
            <p
              className="text-[13.5px] leading-[1.55]"
              style={{ color: "#525252" }}
            >
              {t.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
