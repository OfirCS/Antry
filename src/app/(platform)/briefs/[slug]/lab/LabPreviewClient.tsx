"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  Cpu,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import type { Brief, Fingerprint } from "@/lib/receipts/types";

const ease = [0.16, 1, 0.3, 1] as const;

const SAMPLE_TURNS: {
  role: "user" | "assistant";
  text: string;
  tools?: { name: string; type: "deterministic" | "generative" }[];
  tokens?: { input: number; output: number };
}[] = [
  {
    role: "user",
    text: "Let's start by inspecting the corpus structure before any LLM work.",
  },
  {
    role: "assistant",
    text: "Calling file_search to map the corpus by document type and length distribution.",
    tools: [{ name: "file_search", type: "deterministic" }],
    tokens: { input: 142, output: 86 },
  },
  {
    role: "assistant",
    text:
      "Found 2,387 docs across 4 types. Median length 412 tokens. I'll build a chunking strategy that respects type boundaries — different chunk sizes for changelog vs marketing prose.",
    tokens: { input: 0, output: 174 },
  },
  {
    role: "user",
    text: "Implement streaming with citation guards. Test with 3 sample queries before scaling.",
  },
  {
    role: "assistant",
    text: "Writing the streaming agent loop. Citations enforced via a structured-output schema pinned to corpus IDs.",
    tools: [{ name: "code_run", type: "deterministic" }],
    tokens: { input: 280, output: 412 },
  },
  {
    role: "assistant",
    text:
      "First sample query passed. Streaming first token at 380ms. Second query revealed a citation drift on long answers — fixing with a hard length cap.",
    tools: [{ name: "judge", type: "generative" }],
    tokens: { input: 156, output: 248 },
  },
];

export function LabPreviewClient({ brief }: { brief: Brief }) {
  const [turnsShown, setTurnsShown] = useState(0);
  const [tokensSpent, setTokensSpent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fingerprint, setFingerprint] = useState<Fingerprint>({
    tokenEconomy: 50,
    throughput: 50,
    toolChoiceIQ: 50,
    recoveryIndex: 50,
    promptDiscipline: 50,
    verificationRigor: 50,
    spendVsJudgment: 50,
  });

  // Animate the demo: each turn appears, tokens accrue, fingerprint shifts toward ideal.
  useEffect(() => {
    if (turnsShown >= SAMPLE_TURNS.length) return;
    const t = setTimeout(
      () => {
        setTurnsShown((n) => n + 1);
        const turn = SAMPLE_TURNS[turnsShown];
        if (turn.tokens) {
          setTokensSpent((s) => s + turn.tokens!.input + turn.tokens!.output);
        }
        if (brief.ideal_fingerprint) {
          // Lerp toward ideal proportionally to progress.
          const progress = (turnsShown + 1) / SAMPLE_TURNS.length;
          setFingerprint((cur) => {
            const next: Fingerprint = { ...cur };
            for (const k of Object.keys(brief.ideal_fingerprint!) as (keyof Fingerprint)[]) {
              const ideal = brief.ideal_fingerprint![k];
              next[k] = Math.round(50 + (ideal - 50) * progress);
            }
            return next;
          });
        }
      },
      turnsShown === 0 ? 600 : 1500
    );
    return () => clearTimeout(t);
  }, [turnsShown, brief.ideal_fingerprint]);

  // Elapsed timer.
  useEffect(() => {
    const i = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const tokenPctRemaining = Math.max(
    0,
    Math.min(100, Math.round((1 - tokensSpent / brief.token_cap) * 100))
  );
  const composite =
    Math.round(Object.values(fingerprint).reduce((s, v) => s + v, 0) / 7) || 0;
  const tier = fingerprintTier(composite);

  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
      {/* Conversation panel */}
      <div
        className="rounded-[20px] overflow-hidden flex flex-col"
        style={{
          background: "#0F0F10",
          border: "1px solid rgba(255,255,255,0.06)",
          minHeight: "640px",
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span
              className="text-[11px] font-mono ml-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              lab — {brief.slug}
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: "#C6F135" }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle animate-pulse"
              style={{ background: "#C6F135" }}
            />
            recording
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          <AnimatePresence>
            {SAMPLE_TURNS.slice(0, turnsShown).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex gap-3"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: t.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(198,241,53,0.16)",
                  }}
                >
                  {t.role === "user" ? (
                    <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.7)" }} />
                  ) : (
                    <Bot className="w-3.5 h-3.5" style={{ color: "#C6F135" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1"
                    style={{ color: t.role === "user" ? "rgba(255,255,255,0.4)" : "#C6F135" }}
                  >
                    {t.role === "user" ? "Builder" : "Assistant"}
                  </p>
                  <p
                    className="text-[14px] leading-[1.6]"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {t.text}
                  </p>
                  {t.tools && t.tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.tools.map((tool, ti) => (
                        <span
                          key={ti}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{
                            background:
                              tool.type === "deterministic"
                                ? "rgba(198,241,53,0.16)"
                                : "rgba(99,102,241,0.16)",
                            color:
                              tool.type === "deterministic"
                                ? "#C6F135"
                                : "rgba(165,180,252,0.95)",
                          }}
                        >
                          <Wrench className="w-2.5 h-2.5" />
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.tokens && (
                    <p
                      className="mt-1.5 text-[11px] tabular-nums"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      ↑ {t.tokens.input} · ↓ {t.tokens.output} tokens
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {turnsShown < SAMPLE_TURNS.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 ml-10 text-[12px]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <span className="inline-flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              streaming…
            </motion.div>
          )}
        </div>

        {/* Composer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center gap-3 rounded-[14px] px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <input
              type="text"
              disabled
              placeholder="Sandbox is read-only in this preview — gateway lands in v0.2"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/30"
              style={{ color: "rgba(255,255,255,0.85)" }}
            />
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 h-9 text-[12px] font-semibold opacity-50 cursor-not-allowed"
              style={{ background: "#C6F135", color: "#0A0A0A" }}
            >
              <Send className="w-3 h-3" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Live Fingerprint sidebar */}
      <div className="space-y-5">
        {/* Live Fingerprint */}
        <div
          className="rounded-[20px] p-6"
          style={{
            background: "#0F0F10",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Live Fingerprint
            </p>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded"
              style={{ background: tier.bg, color: tier.color }}
            >
              {tier.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="text-[44px] font-bold tracking-tight font-display tabular-nums"
              style={{ color: "#FFFFFF", lineHeight: 1 }}
            >
              {composite}
            </span>
            <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              composite
            </span>
          </div>

          <div className="flex justify-center mt-2">
            <BuilderFingerprint
              fingerprint={fingerprint}
              ideal={brief.ideal_fingerprint}
              size={260}
              variant="dark"
              primaryColor="#C6F135"
              idealColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Live meters */}
        <div
          className="rounded-[20px] p-5 space-y-4"
          style={{
            background: "#0F0F10",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Meter
            icon={<Cpu className="w-3.5 h-3.5" />}
            label="Tokens spent"
            value={`${tokensSpent.toLocaleString()} / ${brief.token_cap.toLocaleString()}`}
            pct={100 - tokenPctRemaining}
            color="#C6F135"
          />
          <Meter
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Wall-clock"
            value={`${String(elapsedMin).padStart(2, "0")}:${String(elapsedSec).padStart(2, "0")}`}
            pct={Math.min(100, (elapsed / brief.time_cap_seconds) * 100)}
            color="#06B6D4"
          />
          <Meter
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            label="Receipt integrity"
            value="Signed · 12/12 turns"
            pct={100}
            color="#22C55E"
          />
        </div>

        <div
          className="rounded-[20px] p-5"
          style={{
            background: "#0F0F10",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#C6F135" }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C6F135" }}>
                When the gateway is live
              </p>
              <p
                className="mt-1.5 text-[13px] leading-[1.55]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Real Anthropic API calls flow through Antry&apos;s instrumented proxy. Every token is
                signed. Every tool call is logged. The Fingerprint updates in real time and locks
                when you mint your Receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meter({
  icon,
  label,
  value,
  pct,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {icon}
          {label}
        </span>
        <span className="tabular-nums font-bold" style={{ color: "#FFFFFF" }}>
          {value}
        </span>
      </div>
      <div
        className="mt-2 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// Suppress unused-vars
export { Zap };
