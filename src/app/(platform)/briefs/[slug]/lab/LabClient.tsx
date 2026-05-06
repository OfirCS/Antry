"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  Cpu,
  Clock,
  Sparkles,
  ShieldCheck,
  Wrench,
  Loader2,
  Check,
  Zap,
  MessageSquare,
  Code2,
  Eye,
  Play,
  AlertCircle,
} from "lucide-react";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import {
  fingerprintTier,
  ALL_DIMENSIONS,
} from "@/lib/receipts/fingerprint";
import type { Brief, Fingerprint } from "@/lib/receipts/types";
import { mintReceiptAction } from "./actions";

const ease = [0.16, 1, 0.3, 1] as const;

type Turn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  tools?: { name: string; type: "deterministic" | "generative" }[];
  inputTokens?: number;
  outputTokens?: number;
  streaming?: boolean;
};

type ReceiptEvent = {
  type: "antry_receipt";
  attempt_id: string;
  turn_index: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd_cents: number;
  tool_calls: { type: "deterministic" | "generative"; name: string }[];
  receipt_signature: string;
  tokens_spent_total: number;
  tokens_remaining: number;
};

type LabTab = "chat" | "code" | "preview";

type TestResult = {
  name: string;
  passed: boolean;
  reason?: string;
  durationMs: number;
};

const STARTER_CODE = `// Write your solution. We'll run it in the Antry sandbox against the
// Brief's tests. Export the entry function on globalThis.

function answer(query) {
  // TODO: implement
  return { answer: "", citations: [] };
}

globalThis.answer = answer;
`;

const STARTER_HTML = `<!doctype html>
<html><head><style>
  body { font-family: system-ui; padding: 24px; background: #0A0A0A; color: #fff; }
  h1 { color: #C6F135; }
</style></head>
<body>
  <h1>Hello from the Lab.</h1>
  <p>Edit this preview. Companies see it on your Receipt.</p>
</body></html>`;

const SUGGESTED_PROMPTS = [
  "Map the corpus first, then plan chunking strategy.",
  "Implement streaming with citation guards.",
  "Run the hold-out test and report results.",
];

export function LabClient({
  brief,
  attemptId,
  sessionToken,
}: {
  brief: Brief;
  attemptId: string;
  sessionToken: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LabTab>("chat");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [composing, setComposing] = useState("");
  const [sending, setSending] = useState(false);
  const [tokensSpent, setTokensSpent] = useState(0);
  const [costCents, setCostCents] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [code, setCode] = useState(STARTER_CODE);
  const [previewHtml, setPreviewHtml] = useState(STARTER_HTML);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [judgeCritique, setJudgeCritique] = useState<string | null>(null);
  const [finalRubricScore, setFinalRubricScore] = useState<number | null>(null);
  const [mintingPending, startMint] = useTransition();
  const [mintResult, setMintResult] = useState<{
    receiptId: string;
    score: number;
  } | null>(null);

  const [fingerprint, setFingerprint] = useState<Fingerprint>({
    tokenEconomy: 50,
    throughput: 50,
    toolChoiceIQ: 50,
    recoveryIndex: 50,
    promptDiscipline: 50,
    verificationRigor: 50,
    spendVsJudgment: 50,
  });

  const conversationRef = useRef<HTMLDivElement>(null);

  // Wall-clock timer.
  useEffect(() => {
    const i = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(i);
  }, []);

  // Auto-scroll to bottom on new turn.
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [turns]);

  // Update fingerprint as telemetry arrives.
  useEffect(() => {
    if (!brief.ideal_fingerprint) return;
    const turnCount = turns.filter((t) => t.role === "assistant" && !t.streaming).length;
    const progress = Math.min(1, turnCount / 5);
    setFingerprint((cur) => {
      const next: Fingerprint = { ...cur };
      for (const k of ALL_DIMENSIONS) {
        const ideal = brief.ideal_fingerprint![k];
        next[k] = Math.round(50 + (ideal - 50) * progress);
      }
      return next;
    });
  }, [turns, brief.ideal_fingerprint]);

  const send = async (msg: string) => {
    if (!msg.trim() || sending) return;
    setSending(true);

    const userTurn: Turn = {
      id: `u_${Date.now()}`,
      role: "user",
      text: msg,
    };
    const asstId = `a_${Date.now()}`;
    const asstTurn: Turn = {
      id: asstId,
      role: "assistant",
      text: "",
      tools: [],
      streaming: true,
    };
    setTurns((cur) => [...cur, userTurn, asstTurn]);
    setComposing("");

    try {
      const res = await fetch("/api/gateway/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attempt_token: sessionToken,
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: [...turns.filter((t) => !t.streaming).map((t) => ({
            role: t.role,
            content: t.text,
          })), { role: "user", content: msg }],
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "stream_error" }));
        setTurns((cur) =>
          cur.map((t) =>
            t.id === asstId
              ? { ...t, streaming: false, text: `Error: ${err.error}` }
              : t
          )
        );
        setSending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assembledText = "";
      const assembledTools: { name: string; type: "deterministic" | "generative" }[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nlIdx;
        while ((nlIdx = buf.indexOf("\n\n")) !== -1) {
          const block = buf.slice(0, nlIdx);
          buf = buf.slice(nlIdx + 2);
          const lines = block.split("\n");
          const evLine = lines.find((l) => l.startsWith("event:")) ?? "";
          const dtLine = lines.find((l) => l.startsWith("data:")) ?? "";
          const ev = evLine.replace(/^event:\s*/, "").trim();
          const dt = dtLine.replace(/^data:\s*/, "");
          if (!dt) continue;
          try {
            const parsed = JSON.parse(dt);
            if (
              parsed.type === "content_block_delta" &&
              parsed.delta?.type === "text_delta"
            ) {
              assembledText += parsed.delta.text;
              setTurns((cur) =>
                cur.map((t) =>
                  t.id === asstId ? { ...t, text: assembledText } : t
                )
              );
            } else if (
              parsed.type === "content_block_start" &&
              parsed.content_block?.type === "tool_use"
            ) {
              const name = parsed.content_block.name;
              const det = ["file_search", "code_run", "schema_lookup", "grep", "fetch_url"];
              const tool = {
                name,
                type: (det.includes(name) ? "deterministic" : "generative") as
                  | "deterministic"
                  | "generative",
              };
              assembledTools.push(tool);
              setTurns((cur) =>
                cur.map((t) =>
                  t.id === asstId
                    ? { ...t, tools: [...assembledTools] }
                    : t
                )
              );
            } else if (ev === "antry_receipt") {
              const r = parsed as ReceiptEvent;
              setTokensSpent(r.tokens_spent_total);
              setCostCents((c) => c + r.cost_usd_cents);
              setTurns((cur) =>
                cur.map((t) =>
                  t.id === asstId
                    ? {
                        ...t,
                        streaming: false,
                        inputTokens: r.input_tokens,
                        outputTokens: r.output_tokens,
                      }
                    : t
                )
              );
            }
          } catch {
            // skip malformed
          }
        }
      }
      setSending(false);
    } catch (err) {
      setTurns((cur) =>
        cur.map((t) =>
          t.id === asstId
            ? {
                ...t,
                streaming: false,
                text: `Error: ${err instanceof Error ? err.message : "unknown"}`,
              }
            : t
        )
      );
      setSending(false);
    }
  };

  const handleRunTests = () => {
    startMint(async () => {
      // The action runs sandbox + judge as a side-effect when code is
      // included; we re-use it here without setting mintResult so the
      // candidate can iterate before locking the Receipt.
      const result = await mintReceiptAction(attemptId, {
        code,
        visualEvidenceHtml: previewHtml,
        transcript: turns.filter((t) => !t.streaming).map((t) => ({
          role: t.role,
          content: t.text,
        })),
      });
      if (result.ok) {
        setTestResults(result.testResults);
        setJudgeCritique(result.judgeCritique);
        setFinalRubricScore(result.finalRubricScore);
      }
    });
  };

  const handleMint = () => {
    startMint(async () => {
      const result = await mintReceiptAction(attemptId, {
        code,
        visualEvidenceHtml: previewHtml,
        transcript: turns.filter((t) => !t.streaming).map((t) => ({
          role: t.role,
          content: t.text,
        })),
      });
      if (result.ok) {
        setMintResult({ receiptId: result.receiptId, score: result.compositeScore });
        setTestResults(result.testResults);
        setJudgeCritique(result.judgeCritique);
        setFinalRubricScore(result.finalRubricScore);
      }
    });
  };

  const tokenPctRemaining = Math.max(
    0,
    Math.min(100, Math.round((1 - tokensSpent / brief.token_cap) * 100))
  );
  const composite = Math.round(
    Object.values(fingerprint).reduce((s, v) => s + v, 0) / 7
  );
  const tier = fingerprintTier(composite);

  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  const completedTurns = turns.filter((t) => t.role === "assistant" && !t.streaming).length;
  const canMint = completedTurns >= 1 && !mintResult;

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
          <span
            className="text-[10px] font-bold tracking-[0.16em] uppercase"
            style={{ color: "#C6F135" }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle animate-pulse"
              style={{ background: "#C6F135" }}
            />
            recording
          </span>
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-1 px-3 py-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {([
            { key: "chat" as const, label: "Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { key: "code" as const, label: "Code", icon: <Code2 className="w-3.5 h-3.5" /> },
            { key: "preview" as const, label: "Preview", icon: <Eye className="w-3.5 h-3.5" /> },
          ]).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-[12px] font-semibold transition-colors"
                style={{
                  background: isActive ? "rgba(198,241,53,0.16)" : "transparent",
                  color: isActive ? "#C6F135" : "rgba(255,255,255,0.55)",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CHAT TAB */}
        {activeTab === "chat" && (
        <>
        <div
          ref={conversationRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar"
        >
          {turns.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(198,241,53,0.16)" }}
              >
                <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
              </div>
              <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                The Lab is recording. Start prompting — every token is signed.
              </p>
              <div className="mt-5 flex flex-col items-center gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    disabled={sending}
                    className="text-[12px] px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {turns.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex gap-3"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background:
                      t.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(198,241,53,0.16)",
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
                    style={{
                      color: t.role === "user" ? "rgba(255,255,255,0.4)" : "#C6F135",
                    }}
                  >
                    {t.role === "user" ? "Builder" : "Assistant"}
                  </p>
                  <p
                    className="text-[14px] leading-[1.6] whitespace-pre-wrap"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {t.text}
                    {t.streaming && (
                      <span
                        className="inline-block w-1.5 h-4 ml-0.5 align-middle"
                        style={{ background: "#C6F135", animation: "pulse 1s infinite" }}
                      />
                    )}
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
                  {t.inputTokens !== undefined && (
                    <p
                      className="mt-1.5 text-[11px] tabular-nums"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      ↑ {t.inputTokens} · ↓ {t.outputTokens} tokens · signed
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Composer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(composing);
            }}
            className="flex items-center gap-3 rounded-[14px] px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <input
              type="text"
              value={composing}
              onChange={(e) => setComposing(e.target.value)}
              disabled={sending || !!mintResult}
              placeholder={
                mintResult
                  ? "Receipt minted — open it from the panel →"
                  : sending
                    ? "Streaming…"
                    : "Send a turn — every token is signed"
              }
              autoFocus
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/30"
              style={{ color: "rgba(255,255,255,0.85)" }}
            />
            <button
              type="submit"
              disabled={sending || !composing.trim() || !!mintResult}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 h-9 text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#C6F135", color: "#0A0A0A" }}
            >
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              {sending ? "Streaming" : "Send"}
            </button>
          </form>
        </div>
        </>
        )}

        {/* CODE TAB */}
        {activeTab === "code" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Solution · runs in Antry sandbox
                  </p>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    TypeScript · isolated · 5s budget
                  </span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full font-mono text-[12.5px] leading-[1.55] rounded-[12px] p-4 outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    minHeight: "360px",
                  }}
                />
              </div>

              {/* Test results */}
              {testResults && testResults.length > 0 && (
                <div
                  className="rounded-[12px] p-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Test results
                    </p>
                    <span
                      className="text-[11px] font-mono tabular-nums"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {testResults.filter((t) => t.passed).length}/{testResults.length} passing
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {testResults.map((t) => (
                      <li key={t.name} className="flex items-start gap-2 text-[12px]">
                        {t.passed ? (
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#22C55E" }} strokeWidth={3} />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#EF4444" }} />
                        )}
                        <div className="min-w-0">
                          <span style={{ color: t.passed ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.7)" }}>
                            {t.name}
                          </span>
                          {t.reason && (
                            <span className="block text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                              {t.reason}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {judgeCritique && (
                    <p
                      className="mt-3 text-[12px] italic leading-[1.55]"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      Judge: {judgeCritique}
                    </p>
                  )}
                  {finalRubricScore !== null && (
                    <p
                      className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: "#C6F135" }}
                    >
                      Final rubric score: {Math.round(finalRubricScore * 100)} / 100
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              className="px-5 py-4 flex items-center justify-between gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                Tests run on Antry sandbox · isolated · ≤5s
              </span>
              <button
                type="button"
                onClick={handleRunTests}
                disabled={mintingPending || !code.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 h-9 text-[12px] font-semibold disabled:opacity-50 transition-all hover:-translate-y-0.5"
                style={{ background: "#C6F135", color: "#0A0A0A" }}
              >
                {mintingPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {mintingPending ? "Running" : "Run tests"}
              </button>
            </div>
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === "preview" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Visual evidence · embeds in Receipt
                </p>
                <textarea
                  value={previewHtml}
                  onChange={(e) => setPreviewHtml(e.target.value)}
                  spellCheck={false}
                  className="w-full font-mono text-[12px] leading-[1.55] rounded-[12px] p-4 outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    minHeight: "200px",
                  }}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Live render
                </p>
                <iframe
                  title="Solution preview"
                  srcDoc={previewHtml}
                  sandbox="allow-scripts"
                  className="w-full rounded-[12px]"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.06)",
                    minHeight: "320px",
                  }}
                />
              </div>
            </div>
            <div
              className="px-5 py-4 text-[11px]"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              The HTML above is captured into the Receipt artifact when you mint.
              Companies see the snapshot inline.
            </div>
          </div>
        )}
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
            label="Tokens"
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
            icon={<Zap className="w-3.5 h-3.5" />}
            label="Spend"
            value={`$${(costCents / 100).toFixed(3)}`}
            pct={50}
            color="#A78BFA"
          />
          <Meter
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            label="Receipt integrity"
            value={
              completedTurns === 0
                ? "Awaiting first turn"
                : `Signed · ${completedTurns}/${completedTurns} turns`
            }
            pct={completedTurns > 0 ? 100 : 0}
            color="#22C55E"
          />
        </div>

        {/* Mint */}
        <AnimatePresence mode="wait">
          {mintResult ? (
            <motion.div
              key="minted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] p-6 relative overflow-hidden"
              style={{ background: "#0A0A0A", border: "1px solid rgba(198,241,53,0.4)" }}
            >
              <div
                className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(198,241,53,0.30) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "#C6F135" }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: "#0A0A0A" }} strokeWidth={3} />
                  </div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "#C6F135" }}
                  >
                    Receipt minted
                  </p>
                </div>
                <p
                  className="text-[20px] font-bold tracking-[-0.015em]"
                  style={{ color: "#FFFFFF" }}
                >
                  Composite {mintResult.score} / 100
                </p>
                <p
                  className="mt-1.5 text-[13px]"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Signed and pinned to your profile.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/receipts/rc_mara_anthropic_001`)}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-[12px] px-4 h-[40px] text-[13px] font-semibold w-full transition-all hover:-translate-y-0.5"
                  style={{ background: "#C6F135", color: "#0A0A0A" }}
                >
                  Open Receipt →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="mint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              type="button"
              onClick={handleMint}
              disabled={!canMint || mintingPending}
              className="rounded-[20px] p-6 w-full text-left relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              style={{
                background: "#0A0A0A",
                border: "1px solid rgba(198,241,53,0.32)",
                boxShadow: canMint ? "0 12px 32px -16px rgba(198,241,53,0.40)" : "none",
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(198,241,53,0.18) 0%, transparent 70%)",
                }}
              />
              <div className="relative flex items-center gap-3">
                {mintingPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#C6F135" }} />
                ) : (
                  <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
                )}
                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "#C6F135" }}
                  >
                    Mint Receipt
                  </p>
                  <p
                    className="text-[14px] mt-0.5"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {canMint
                      ? "Lock the trace and sign your Fingerprint"
                      : "Send at least one turn to mint"}
                  </p>
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
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
