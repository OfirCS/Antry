"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  X,
  Send,
  Search,
  Users,
  Trophy,
  Loader2,
  ArrowUpRight,
  Heart,
  Bot,
  GitCompare,
  Code2,
  Zap,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  builders as mockBuilders,
  projects as mockProjects,
  antathons as mockAntathons,
} from "@/lib/mock-data";
import type { AgentResponseBody, AgentRichCard } from "@/lib/agent/types";

/* ── Constants ─────────────────────────────────────────── */

const MAX_CHARS = 320;

const QUICK_PROMPTS = [
  { icon: Search, label: "Find AI builders", prompt: "Find builders who work with AI agents" },
  { icon: Trophy, label: "Active hackathons", prompt: "What hackathons are active right now?" },
  { icon: Users, label: "Build a team", prompt: "Build me a team for the AI hackathon" },
  { icon: GitCompare, label: "Compare builders", prompt: "Compare Mara and Jake" },
];

/* ── Types ─────────────────────────────────────────────── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: { tool: string; result: string }[];
  cards?: AgentRichCard[];
  error?: string;
}

/* ── Compact card renderers ────────────────────────────── */

function MiniBuilderCard({ data }: { data: AgentRichCard & { type: "builder" } }) {
  const b = data.data;
  return (
    <Link
      href={`/builders/${b.username}`}
      className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary/30 bg-background-primary hover:border-accent/20 transition-all"
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
        style={{ background: b.gradient }}
      >
        {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">{b.name}</div>
        <div className="text-[10px] text-text-tertiary truncate">{b.tagline}</div>
      </div>
      <ArrowUpRight className="w-3 h-3 text-text-tertiary group-hover:text-accent shrink-0 transition-colors" />
    </Link>
  );
}

function MiniProjectCard({ data }: { data: AgentRichCard & { type: "project" } }) {
  const p = data.data;
  return (
    <Link
      href={`/projects/${p.id}`}
      className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary/30 bg-background-primary hover:border-accent/20 transition-all"
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: p.gradient }}>
        <Code2 className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">{p.title}</div>
        <div className="text-[10px] text-text-tertiary truncate">{p.builder.name}</div>
      </div>
      <div className="flex items-center gap-0.5 text-[10px] text-text-tertiary shrink-0">
        <Heart className="w-2.5 h-2.5" />{p.likes}
      </div>
    </Link>
  );
}

function MiniHackathonCard({ data }: { data: AgentRichCard & { type: "hackathon" } }) {
  const h = data.data;
  const color = h.status === "active" ? "text-green-500" : h.status === "upcoming" ? "text-blue-500" : "text-text-tertiary";
  return (
    <Link
      href={`/hackathons/${h.id}`}
      className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary/30 bg-background-primary hover:border-accent/20 transition-all"
    >
      <div className="w-7 h-7 rounded-md bg-[#1a1a1a] flex items-center justify-center shrink-0">
        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">{h.title}</div>
        <div className="text-[10px] text-text-tertiary truncate">{h.theme}</div>
      </div>
      <span className={cn("text-[9px] font-bold uppercase tracking-wide shrink-0", color)}>{h.status}</span>
    </Link>
  );
}

function MiniTeamCard({ data }: { data: AgentRichCard & { type: "team" } }) {
  const t = data.data;
  return (
    <div className="p-3 rounded-lg border border-accent/15 bg-accent-muted/10 space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent">
        <Users className="w-3 h-3" /> Team for &ldquo;{t.theme}&rdquo;
      </div>
      {t.members.map((m) => (
        <Link key={m.builder.id || m.builder.username} href={`/builders/${m.builder.username}`} className="group flex items-center gap-2 p-1.5 rounded-md hover:bg-surface transition-colors">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: m.builder.gradient }}>
            {m.builder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">{m.builder.name}</div>
            <div className="text-[9px] text-accent">{m.role}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MiniBuilderDetailCard({ data }: { data: AgentRichCard & { type: "builder_detail" } }) {
  const d = data.data;
  return (
    <div className="p-3 rounded-lg border border-border-primary/30 bg-background-primary space-y-2">
      <Link href={`/builders/${d.builder.username}`} className="group flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: d.builder.gradient }}>
          {d.builder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent transition-colors">{d.builder.name}</div>
          <div className="text-[10px] text-text-secondary">{d.projects.length} projects · {d.totalLikes} likes</div>
        </div>
      </Link>
      <div className="flex flex-wrap gap-1">
        {d.builder.skills.slice(0, 4).map((s) => (
          <span key={s} className="text-[9px] font-medium text-text-tertiary bg-background-secondary rounded-full px-1.5 py-0.5">{s}</span>
        ))}
      </div>
      {d.projects.slice(0, 2).map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 text-[10px]">
          <span className="font-medium text-text-primary truncate">{p.title}</span>
          <span className="flex items-center gap-0.5 text-text-tertiary shrink-0"><Heart className="w-2.5 h-2.5" />{p.likes}</span>
        </div>
      ))}
    </div>
  );
}

function MiniComparisonCard({ data }: { data: AgentRichCard & { type: "comparison" } }) {
  const c = data.data;
  return (
    <div className="p-3 rounded-lg border border-border-primary/30 bg-background-primary space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-primary">
        <GitCompare className="w-3 h-3 text-accent" /> Comparison
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[c.builderA, c.builderB].map((b) => (
          <Link key={b.id || b.username} href={`/builders/${b.username}`} className="group text-center p-2 rounded-md hover:bg-background-secondary transition-colors">
            <div className="w-7 h-7 mx-auto rounded-md flex items-center justify-center text-[8px] font-bold text-white mb-1" style={{ background: b.gradient }}>
              {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="text-[10px] font-semibold text-text-primary group-hover:text-accent transition-colors">{b.name.split(" ")[0]}</div>
          </Link>
        ))}
      </div>
      {c.sharedSkills.length > 0 && (
        <div className="text-[9px] text-text-tertiary text-center">Shared: {c.sharedSkills.join(", ")}</div>
      )}
    </div>
  );
}

function MiniCardRenderer({ card }: { card: AgentRichCard }) {
  switch (card.type) {
    case "builder": return <MiniBuilderCard data={card as AgentRichCard & { type: "builder" }} />;
    case "project": return <MiniProjectCard data={card as AgentRichCard & { type: "project" }} />;
    case "hackathon": return <MiniHackathonCard data={card as AgentRichCard & { type: "hackathon" }} />;
    case "team": return <MiniTeamCard data={card as AgentRichCard & { type: "team" }} />;
    case "builder_detail": return <MiniBuilderDetailCard data={card as AgentRichCard & { type: "builder_detail" }} />;
    case "comparison": return <MiniComparisonCard data={card as AgentRichCard & { type: "comparison" }} />;
    default: return null;
  }
}

/* ── Inline markdown renderer ──────────────────────────── */

function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      parts.push(<strong key={key++} className="font-semibold text-text-primary">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      parts.push(<em key={key++} className="italic text-text-tertiary">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
}

/* ── Main component ────────────────────────────────────── */

export function ScoutAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isThinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || (m.role === "assistant" && !m.error))
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Request failed (${res.status})`);
      }

      const json = (await res.json()) as AgentResponseBody;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: json.response,
          steps: json.steps,
          cards: json.cards,
        },
      ]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: errMsg, error: errMsg },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-text-primary text-background-primary flex items-center justify-center shadow-[0_8px_32px_-4px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-transform"
            aria-label="Open Scout AI"
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-120px)] bg-surface border border-border-primary rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary/50 bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-text-primary leading-tight">Scout</h3>
                  <p className="text-[10px] text-text-tertiary">Antry AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    onClick={resetChat}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-colors"
                    title="New chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {/* Empty state */}
              {messages.length === 0 && !isThinking && (
                <div className="flex flex-col items-center justify-center h-full text-center px-2">
                  <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center mb-3">
                    <Sparkles className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-text-primary mb-1.5">Hey, I&apos;m Scout</h4>
                  <p className="text-[12px] text-text-secondary mb-6 leading-relaxed max-w-[260px]">
                    I know every builder, project, and hackathon on Antry.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    {QUICK_PROMPTS.map((sp) => (
                      <button
                        key={sp.label}
                        onClick={() => handleSend(sp.prompt)}
                        className="group flex items-center gap-1.5 p-2.5 rounded-lg border border-border-primary/40 bg-background-primary text-left hover:border-accent/20 hover:bg-accent-muted/30 transition-all"
                      >
                        <sp.icon className="w-3 h-3 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
                        <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                          {sp.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-text-primary text-background-primary text-[12px] leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Tool steps as inline pills */}
                      {msg.steps && msg.steps.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap ml-7">
                          {msg.steps.map((step, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background-secondary text-[9px] text-text-tertiary"
                              title={step.result}
                            >
                              <Zap className="w-2 h-2 text-accent" />
                              {step.tool.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Response text */}
                      <div className="flex gap-2">
                        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div className={cn("max-w-[85%] text-[12px] leading-relaxed space-y-1", msg.error ? "text-red-500" : "text-text-secondary")}>
                          {msg.error ? (
                            <div className="flex items-start gap-1.5">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{msg.error}</span>
                            </div>
                          ) : (
                            msg.content.split("\n").map((line, i) =>
                              line.trim() === "" ? <br key={i} /> : (
                                <p key={i}><InlineText text={line} /></p>
                              )
                            )
                          )}
                        </div>
                      </div>

                      {/* Rich cards */}
                      {msg.cards && msg.cards.length > 0 && (
                        <div className="ml-7 space-y-1.5">
                          {msg.cards.map((card, i) => (
                            <MiniCardRenderer key={i} card={card} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-md bg-accent/80 flex items-center justify-center shrink-0">
                    <Bot className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background-secondary">
                    <Loader2 className="w-3 h-3 text-accent animate-spin" />
                    <span className="text-[11px] text-text-tertiary">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-border-primary/50 bg-surface">
              <div className={cn(
                "flex items-center gap-2 bg-background-primary border rounded-xl px-3 py-2 transition-colors",
                isThinking ? "border-border-primary/40" : "border-border-primary/50 focus-within:border-accent/30"
              )}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Scout anything..."
                  disabled={isThinking}
                  maxLength={MAX_CHARS}
                  className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-tertiary/60 outline-none disabled:opacity-40"
                  autoComplete="off"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                  className="w-6 h-6 rounded-md bg-text-primary text-background-primary flex items-center justify-center disabled:opacity-20 hover:opacity-80 transition-opacity shrink-0"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-text-tertiary/50 text-center mt-1.5">
                {mockBuilders.length} builders · {mockProjects.length} projects · {mockAntathons.length} hackathons
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
