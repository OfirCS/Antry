"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  Check,
  Copy,
  RotateCcw,
  Wand2,
} from "lucide-react";
import { fadeUp } from "@/lib/motion";

type Msg = {
  id: string;
  role: "user" | "agent";
  text: string;
  yamlPreview?: string;
};

type DraftBrief = {
  title: string;
  difficulty: "junior" | "mid" | "senior" | "staff";
  category: string;
  time_cap_minutes: number;
  token_cap: number;
  allowed_tools: string[];
  rubric_weights: {
    streams_correctly?: number;
    cites_sources?: number;
    no_fabrication?: number;
    hold_out_pass_rate?: number;
    correctness?: number;
    discipline?: number;
  };
  hold_out_summary: string;
};

const STARTER_PROMPTS = [
  "Senior engineer who can build a streaming RAG pipeline with citations",
  "Edge-runtime routing agent under a 100ms cold-start budget",
  "Mid-level engineer for a transactional email orchestrator",
];

/**
 * Conversational Brief authoring. Mocked agent responses for now (the
 * "single real LLM-powered surface" budget is allocated to Scout). The
 * chat shape, streaming feel, and YAML preview match what a real Claude
 * call would return — when wiring up live, swap `runAgentStep` for a
 * fetch to /api/agent/brief-author and the rest of the UI is unchanged.
 */
export function BriefAuthorChat({
  slug,
  companyName,
  companyColor,
}: {
  slug: string;
  companyName: string;
  companyColor: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      role: "agent",
      text: `Hi — I'll help you draft a Brief for ${companyName}. Paste a job description, describe the role you're hiring for, or tell me what signal you want to test. I'll propose the rubric, caps, and hold-out test. You confirm.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<DraftBrief | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<
    "intro" | "extracting" | "proposing" | "confirmed"
  >("intro");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const submit = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;
      const userMsg: Msg = {
        id: `u${Date.now()}`,
        role: "user",
        text: text.trim(),
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setBusy(true);

      // Simulate streaming agent response, scripted by current step.
      await new Promise((r) => setTimeout(r, 350));

      if (step === "intro" || step === "extracting") {
        // First pass: extract role + propose draft
        const proposed: DraftBrief = inferDraft(text);
        const ack = await streamReply(
          [
            `Got it. I read this as: **${proposed.title}**.`,
            ``,
            `Let me draft the rubric, caps, and a hold-out test. One sec…`,
          ].join("\n"),
          setMessages
        );
        await new Promise((r) => setTimeout(r, 600));
        await streamReply(
          [
            `Here's a first pass. Edit anything in the YAML on the right, or tell me what to change in the chat.`,
          ].join("\n"),
          setMessages,
          formatYaml(proposed)
        );
        setDraft(proposed);
        setStep("proposing");
        ack;
      } else if (step === "proposing") {
        // Iterate on the draft
        await streamReply(
          [
            `Adjusting…`,
            ``,
            `I bumped \`time_cap_minutes\` and tightened the rubric weights. Take another look.`,
          ].join("\n"),
          setMessages,
          formatYaml(adjustDraft(draft!, text))
        );
        setDraft(adjustDraft(draft!, text));
      } else {
        await streamReply(
          `Already locked. To re-open, hit "Restart draft" below the YAML.`,
          setMessages
        );
      }

      setBusy(false);
    },
    [busy, step, draft]
  );

  const onConfirm = useCallback(() => {
    if (!draft) return;
    setStep("confirmed");
    setMessages((m) => [
      ...m,
      {
        id: `c${Date.now()}`,
        role: "agent",
        text: `Brief drafted. In a real workspace, this would publish to \`/c/${slug}/briefs/<slug>\` and reserve a private build URL. For now, copy the YAML to your repo or share the preview link.`,
      },
    ]);
  }, [draft, slug]);

  const onRestart = useCallback(() => {
    setMessages([
      {
        id: "intro",
        role: "agent",
        text: `Restarted. Tell me about the role you're hiring for.`,
      },
    ]);
    setDraft(null);
    setStep("intro");
  }, []);

  const onCopyYaml = useCallback(async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(formatYaml(draft));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }, [draft]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
      {/* Chat column */}
      <div
        className="rounded-[24px] flex flex-col"
        style={{
          background: "#FFFFFF",
          border: "1px solid #EBEBEB",
          minHeight: "560px",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
        }}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#0A0A0A" }}
          >
            <Bot className="w-4 h-4" style={{ color: "#C6F135" }} />
          </div>
          <div>
            <p className="text-[14px] font-bold tracking-[-0.005em] text-black">
              Brief Composer
            </p>
            <p className="text-[11px] text-gray-500">Powered by Antry</p>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-black"
          >
            <RotateCcw className="w-3 h-3" />
            Restart
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          style={{ maxHeight: "60vh" }}
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={
                  m.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={`max-w-[88%] rounded-[18px] px-4 py-3 text-[14px] leading-[1.55] whitespace-pre-wrap ${
                    m.role === "user" ? "" : "text-gray-800"
                  }`}
                  style={
                    m.role === "user"
                      ? {
                          background: "#0A0A0A",
                          color: "#FFFFFF",
                        }
                      : {
                          background: "#FAFAF7",
                          border: "1px solid #EBEBEB",
                        }
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && <TypingDots />}
        </div>

        {/* Composer */}
        <div className="border-t border-gray-100 p-4">
          {messages.length === 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => submit(p)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-gray-100"
                  style={{
                    background: "#FAFAF7",
                    border: "1px solid #EBEBEB",
                    color: "#525252",
                  }}
                >
                  <Sparkles
                    className="w-3 h-3 inline-block mr-1"
                    style={{ color: companyColor }}
                  />
                  {p}
                </button>
              ))}
            </div>
          )}
          <div
            className="flex items-end gap-2 rounded-[14px] p-2"
            style={{
              background: "#FAFAF7",
              border: "1px solid #EBEBEB",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={2}
              placeholder="Paste a JD or describe the role…"
              className="flex-1 bg-transparent outline-none text-[14px] leading-[1.5] resize-none px-2 py-1 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => submit(input)}
              disabled={busy || !input.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-[34px] text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              style={{
                background: "#C6F135",
                color: "#0A0A0A",
              }}
              data-cta="lime"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* YAML preview column */}
      <aside className="lg:sticky lg:top-24 self-start">
        <div
          className="rounded-[24px] flex flex-col"
          style={{
            background: "#0A0A0A",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: "560px",
          }}
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <Wand2 className="w-3.5 h-3.5" style={{ color: "#C6F135" }} />
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {draft ? "Draft" : "Preview"} · brief.yaml
            </p>
            {draft && (
              <button
                type="button"
                onClick={onCopyYaml}
                className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-6">
            {draft ? (
              <pre
                className="text-[12px] leading-[1.6] font-mono whitespace-pre"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {formatYaml(draft)}
              </pre>
            ) : (
              <motion.div
                {...{
                  initial: "hidden",
                  animate: "visible",
                  variants: fadeUp,
                }}
                className="h-full flex flex-col items-center justify-center text-center px-6"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(198,241,53,0.1)",
                    border: "1px solid rgba(198,241,53,0.25)",
                  }}
                >
                  <Sparkles
                    className="w-5 h-5"
                    style={{ color: "#C6F135" }}
                  />
                </div>
                <p className="text-[14px] font-bold text-white mb-1">
                  YAML preview
                </p>
                <p className="text-[12px] leading-[1.55] max-w-[260px]">
                  Once you describe the role, the rubric, caps, and hold-out
                  test render here. Edit by chatting back.
                </p>
              </motion.div>
            )}
          </div>
          {draft && step !== "confirmed" && (
            <div className="border-t border-white/10 p-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[12px] px-4 h-[42px] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background: "#C6F135",
                  color: "#0A0A0A",
                }}
                data-cta="lime"
              >
                Looks good — publish <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href={`/c/${slug}`}
                className="text-[12px] font-semibold whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Cancel
              </Link>
            </div>
          )}
          {step === "confirmed" && (
            <div className="border-t border-white/10 p-4">
              <div
                className="rounded-[12px] p-3 text-[12px] leading-[1.55] flex items-start gap-2"
                style={{
                  background: "rgba(198,241,53,0.08)",
                  border: "1px solid rgba(198,241,53,0.3)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <Check
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: "#C6F135" }}
                />
                <span>
                  Brief drafted. In a live workspace, publish would create
                  the Brief and reserve the public URL.
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div
        className="rounded-[18px] px-4 py-3 flex items-center gap-1"
        style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "#A3A3A3" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────

async function streamReply(
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>,
  yamlPreview?: string
) {
  const id = `a${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  setMessages((m) => [...m, { id, role: "agent", text: "", yamlPreview }]);
  // Pseudo-stream: chunk on word boundaries every ~25ms
  const words = text.split(/(\s+)/);
  let acc = "";
  for (const w of words) {
    acc += w;
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, text: acc } : msg))
    );
    await new Promise((r) => setTimeout(r, 22));
  }
}

function inferDraft(input: string): DraftBrief {
  const lower = input.toLowerCase();
  let difficulty: DraftBrief["difficulty"] = "mid";
  if (/staff|principal|lead/.test(lower)) difficulty = "staff";
  else if (/senior|sr\.?\s/.test(lower)) difficulty = "senior";
  else if (/junior|jr\.?\s|entry/.test(lower)) difficulty = "junior";

  let category = "agents";
  let title = capitalizeFirst(input.slice(0, 80));
  if (/rag|retriev|citation/.test(lower)) {
    category = "rag";
    title = "Streaming RAG with citation discipline";
  } else if (/edge|cold start|cold-start|p95|latency/.test(lower)) {
    category = "edge";
    title = "Edge-runtime routing under cold-start budget";
  } else if (/email|deliverab|bounce|transactional/.test(lower)) {
    category = "email";
    title = "Transactional email orchestrator";
  } else if (/postgres|sync|conflict|region|failover/.test(lower)) {
    category = "data";
    title = "Multi-region Postgres conflict resolution";
  }

  const allowed_tools = ["file_search", "code_run"];
  if (category === "rag" || category === "data") allowed_tools.push("judge");

  return {
    title,
    difficulty,
    category,
    time_cap_minutes:
      difficulty === "staff" ? 90 : difficulty === "senior" ? 75 : 60,
    token_cap:
      difficulty === "staff"
        ? 50000
        : difficulty === "senior"
          ? 35000
          : 25000,
    allowed_tools,
    rubric_weights:
      category === "rag"
        ? {
            streams_correctly: 0.2,
            cites_sources: 0.3,
            no_fabrication: 0.25,
            hold_out_pass_rate: 0.25,
          }
        : {
            correctness: 0.5,
            discipline: 0.2,
            hold_out_pass_rate: 0.3,
          },
    hold_out_summary:
      category === "rag"
        ? "5 unseen queries with required citations; graded by judge model"
        : "8 unseen scenarios; >75% must converge to a passing solution",
  };
}

function adjustDraft(prev: DraftBrief, instruction: string): DraftBrief {
  const next = { ...prev };
  const lower = instruction.toLowerCase();
  if (/longer|more time|increase time/.test(lower))
    next.time_cap_minutes = Math.min(120, next.time_cap_minutes + 15);
  if (/shorter|less time|reduce time/.test(lower))
    next.time_cap_minutes = Math.max(30, next.time_cap_minutes - 15);
  if (/more tokens|increase tokens|bigger budget/.test(lower))
    next.token_cap = Math.min(80000, next.token_cap + 10000);
  if (/fewer tokens|tighter|reduce tokens/.test(lower))
    next.token_cap = Math.max(10000, next.token_cap - 5000);
  if (/senior/.test(lower)) next.difficulty = "senior";
  if (/staff/.test(lower)) next.difficulty = "staff";
  if (/junior/.test(lower)) next.difficulty = "junior";
  return next;
}

function formatYaml(b: DraftBrief): string {
  const slug = b.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const rubric = Object.entries(b.rubric_weights)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");
  const tools = b.allowed_tools.map((t) => `  - ${t}`).join("\n");
  return `# ${b.title}
slug: ${slug}
difficulty: ${b.difficulty}
category: ${b.category}
token_cap: ${b.token_cap}
time_cap_seconds: ${b.time_cap_minutes * 60}

allowed_tools:
${tools}

rubric:
${rubric}

hold_out:
  description: ${b.hold_out_summary}
`;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
