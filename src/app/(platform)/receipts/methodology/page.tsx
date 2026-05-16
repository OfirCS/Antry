import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { ALL_DIMENSIONS } from "@/lib/receipts/fingerprint";
import {
  DIMENSION_LABELS,
  DIMENSION_BLURB,
  DIMENSION_ANTAGONIST,
} from "@/lib/receipts/types";

const TITLE = "Methodology — how Antry Fingerprints work";
const DESCRIPTION =
  "The seven dimensions that make up a Builder Fingerprint, the antagonist pairs that prevent gaming, and the open-source rubric format.";

export const metadata: Metadata = {
  title: "Methodology",
  description: DESCRIPTION,
  alternates: { canonical: "/receipts/methodology" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/receipts/methodology",
    image: ogImageUrl({
      title: "Methodology",
      subtitle: "Seven dimensions. Antagonist pairs. Open-source rubric format.",
      eyebrow: "Antry Receipts",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function MethodologyPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(32,245,160,0.14) 0%, transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-[920px] px-6 pt-24 pb-32 sm:px-10 sm:pt-28 sm:pb-36 text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#20F5A0" }}
            >
              Methodology
            </p>
            <h1
              className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.035em]"
              style={{ color: "#FFFFFF" }}
            >
              How Builder Fingerprints work.
            </h1>
            <p
              className="mt-6 max-w-[560px] mx-auto text-[16px] leading-[1.55]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Seven dimensions. Antagonist-paired. Min-of-quartile composite.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[920px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10 space-y-12">
            <Section title="The principle">
              <p>
                In 2026, a working result no longer separates senior from junior — anyone can prompt to an answer. The signal is <em>how</em> you got there: token efficiency, tool taste, recovery, when to spend.
              </p>
              <p>
                A Builder Fingerprint is a 7-dimension radar from gateway-signed telemetry. No single axis can be optimised at the cost of the others.
              </p>
            </Section>

            <Section title="The seven dimensions">
              <div className="space-y-4 not-prose">
                {ALL_DIMENSIONS.map((d, i) => (
                  <div
                    key={d}
                    className="rounded-lg p-5 bg-[#F7F8FA] border border-gray-100 flex items-start gap-4"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-display font-bold"
                      style={{ background: "#0A0A0A", color: "#20F5A0" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
                        {DIMENSION_LABELS[d]}
                      </h3>
                      <p className="mt-1 text-[14px] leading-[1.55] text-gray-700">
                        {DIMENSION_BLURB[d]}
                      </p>
                      {DIMENSION_ANTAGONIST[d] && (
                        <p className="mt-1.5 text-[12px] text-gray-500">
                          Antagonist:{" "}
                          <span className="font-semibold text-gray-700">
                            {DIMENSION_LABELS[DIMENSION_ANTAGONIST[d]!]}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Composite score: min-of-quartile">
              <p>
                Not an average. We weight the bottom quartile of dimensions at 60%, the rest at 40%:
              </p>
              <pre className="text-[13px] bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto">{`composite = bottomMean × 0.6 + restMean × 0.4`}</pre>
              <p>
                One weak dimension can&apos;t hide behind six strong ones. The shape of your radar is the signal.
              </p>
            </Section>

            <Section title="Anti-gaming: the antagonist principle">
              <p>
                Each measurable dimension has a counter-dimension. Token Economy ↔ Throughput. Tool-Choice IQ ↔ Recovery Index. Prompt Discipline ↔ Verification Rigor. Maximising one axis at the cost of its pair pulls down the composite.
              </p>
              <p>
                <strong>Spend-vs-Judgment Curve</strong> is the meta-dimension. It rewards convex spending — burn early, taper late — and penalises uniform spend.
              </p>
            </Section>

            <Section title="Anti-cheat: signed receipts and gateway lock">
              <p>
                Every LLM call flows through Antry&apos;s gateway and produces an HMAC-SHA256 receipt. At submission, the full chain must validate — a builder can&apos;t bypass to Anthropic directly.
              </p>
              <p>
                Lab heartbeats hash the visible transcript against the streamed{" "}
                <code>response_hash</code> chain. Mismatch invalidates the Attempt; focus loss &gt;90s flags it for human review.
              </p>
            </Section>

            <Section title="Provenance: SHA-256, public key, qualified timestamp">
              <p>
                Every Receipt is content-addressed. The artifact carries:
              </p>
              <ul className="not-prose space-y-2 pl-0">
                <li className="grid grid-cols-[140px_1fr] gap-3 text-[14px] items-start">
                  <span className="font-mono text-[12px] text-gray-500 pt-0.5">content_hash</span>
                  <span className="text-gray-700">SHA-256 over canonical telemetry + Fingerprint JSON.</span>
                </li>
                <li className="grid grid-cols-[140px_1fr] gap-3 text-[14px] items-start">
                  <span className="font-mono text-[12px] text-gray-500 pt-0.5">signature</span>
                  <span className="text-gray-700">HMAC-SHA256 (Antry master key) chained from per-call gateway signatures.</span>
                </li>
                <li className="grid grid-cols-[140px_1fr] gap-3 text-[14px] items-start">
                  <span className="font-mono text-[12px] text-gray-500 pt-0.5">key_fp</span>
                  <span className="text-gray-700">Public-key fingerprint published at <code>/api/v1/keys</code>; rotated quarterly with overlap.</span>
                </li>
                <li className="grid grid-cols-[140px_1fr] gap-3 text-[14px] items-start">
                  <span className="font-mono text-[12px] text-gray-500 pt-0.5">signed_at</span>
                  <span className="text-gray-700">Server-issued ISO-8601 with timezone; aligned with C2PA-style qualified timestamps.</span>
                </li>
              </ul>
              <p className="mt-2">
                Re-derive any score: pull the trace bundle, re-run the dimension functions, compare. Verifier endpoint at{" "}
                <code>/api/v1/receipts/[id]/verify</code> returns the canonical hash for client-side comparison.
              </p>
            </Section>

            <Section title="How we resist gaming">
              <p>
                Every metric has an attacker who&apos;d like to optimise it cheaply. Here&apos;s what we do about each known vector:
              </p>
              <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  {
                    attack: "Paste-burst (LLM-on-side)",
                    defense:
                      "Input >N tokens in one turn flags `prompt_paste_burst=true`. Prompt Discipline credit suppressed; methodology disclosed, not silent.",
                  },
                  {
                    attack: "External-LLM relay",
                    defense:
                      "Receipt signature chains every call through Antry's gateway. Builder can run a second model on the side, but the trace itself is unforgeable.",
                  },
                  {
                    attack: "Tool-spam to inflate Tool-Choice IQ",
                    defense:
                      "Tool calls outside the Brief's `allowed_tools` whitelist invalidate the Attempt. Repeated identical tool calls are deduped before scoring.",
                  },
                  {
                    attack: "Stalling to save tokens",
                    defense:
                      "Throughput is the antagonist of Token Economy. Wall-clock to first verified-correct output is timestamped at the gateway, not the client.",
                  },
                  {
                    attack: "Hold-out test memorisation",
                    defense:
                      "Hold-out test is unseen by the builder, rotated per cohort, and graded after submission against a secondary judge model.",
                  },
                  {
                    attack: "Focus-loss for offline help",
                    defense:
                      "Lab tracks blur/focus. >90s flagged for human review; Receipt status `review_pending` until cleared.",
                  },
                ].map((row) => (
                  <div
                    key={row.attack}
                    className="rounded-lg p-4 bg-[#F7F8FA] border border-gray-100"
                  >
                    <p className="text-[12px] font-bold tracking-[-0.005em] text-black">
                      {row.attack}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-600">
                      {row.defense}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-gray-500">
                Found a vector we missed?{" "}
                <a
                  href="mailto:[email protected]"
                  className="underline font-semibold text-black"
                >
                  [email protected]
                </a>{" "}
                — disclosure credits go on this page.
              </p>
            </Section>

            <Section title="Open rubric format">
              <p>
                Briefs are versioned YAML+tests. The format is open; the repo lives next to this page so the community can audit and contribute.
              </p>
              <pre className="text-[13px] bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto">{`# brief.yaml
title: Streaming RAG with citation discipline
difficulty: senior
token_cap: 50000
time_cap_seconds: 5400
allowed_tools: [file_search, code_run, judge]
deterministic_surface_weight: 0.7
rubric:
  streams_correctly: 0.20
  cites_sources: 0.30
  no_fabrication: 0.25
  hold_out_pass_rate: 0.25
hold_out:
  - query: "How do I rotate API keys?"
    expected_citations: [doc_142, doc_207]`}</pre>
            </Section>

            <p className="text-[12px] text-gray-500 italic pt-4">
              Maintained by the Antry methodology working group. Last revised{" "}
              <time dateTime="2026-05-06">May 6, 2026</time>. Want to challenge a
              formula? File an issue on the open rubric repo or email{" "}
              <a
                href="mailto:[email protected]"
                className="underline text-black not-italic font-semibold"
              >
                [email protected]
              </a>
              .
            </p>

            <div className="rounded-[24px] p-6 sm:p-8 mt-12 relative overflow-hidden" style={{ background: "#0A0A0A" }}>
              <div
                className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(32,245,160,0.18) 0%, transparent 65%)",
                }}
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.22em] inline-flex items-center gap-1.5"
                    style={{ color: "#20F5A0" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Try it
                  </p>
                  <h3
                    className="mt-2 text-[20px] font-bold tracking-[-0.015em]"
                    style={{ color: "#FFFFFF" }}
                  >
                    Pick a Brief and earn a Fingerprint of your own.
                  </h3>
                  <p
                    className="mt-1 text-[13px]"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Every Brief is a real assignment from a real company.
                  </p>
                </div>
                <Link
                  href="/briefs"
                  className="inline-flex items-center gap-1.5 rounded-lg px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                  style={{
                    background: "#20F5A0",
                    color: "#0A0A0A",
                    boxShadow: "0 8px 24px rgba(32,245,160,0.35)",
                  }}
                >
                  Browse Briefs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.025em] text-black font-display">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-[1.7] text-gray-700 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px]">
        {children}
      </div>
    </section>
  );
}
