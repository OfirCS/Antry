"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Search,
  Users,
  Trophy,
  Loader2,
  ArrowUpRight,
  Heart,
  GitCompare,
  Code2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentResponseBody, AgentRichCard } from "@/lib/agent/types";

/* ── Constants ─────────────────────────────── */

const QUICK_PROMPTS = [
  { icon: Search, label: "Find builders by skill", prompt: "Find builders who work with AI agents" },
  { icon: Trophy, label: "Browse hackathons", prompt: "What hackathons are active right now?" },
  { icon: Users, label: "Build a team", prompt: "Build me a team for the AI hackathon" },
  { icon: GitCompare, label: "Compare builders", prompt: "Compare Mara and Jake" },
];

/* ── Types ─────────────────────────────────── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: { tool: string; result: string }[];
  cards?: AgentRichCard[];
  error?: string;
}

/* ── Card renderers ────────────────────────── */

function MiniBuilderCard({ data }: { data: AgentRichCard & { type: "builder" } }) {
  const b = data.data;
  return (
    <Link
      href={`/builders/${b.username}`}
      className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary bg-surface hover:border-text-tertiary/30 transition-all"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
        style={{ background: b.gradient }}
      >
        {b.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent-bright truncate transition-colors">
          {b.name}
        </div>
        <div className="text-[10px] text-text-tertiary truncate">{b.tagline}</div>
      </div>
      <ArrowUpRight className="w-3 h-3 text-text-tertiary group-hover:text-text-primary shrink-0 transition-colors" />
    </Link>
  );
}

function MiniProjectCard({ data }: { data: AgentRichCard & { type: "project" } }) {
  const p = data.data;
  return (
    <Link
      href={`/projects/${p.id}`}
      className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary bg-surface hover:border-text-tertiary/30 transition-all"
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: p.gradient }}>
        <Code2 className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent-bright truncate transition-colors">
          {p.title}
        </div>
        <div className="text-[10px] text-text-tertiary truncate">{p.builder.name}</div>
      </div>
      <div className="flex items-center gap-0.5 text-[10px] text-text-tertiary shrink-0">
        <Heart className="w-2.5 h-2.5" />
        {p.likes}
      </div>
    </Link>
  );
}

function MiniHackathonCard({ data }: { data: AgentRichCard & { type: "hackathon" } }) {
  const h = data.data;
  const color =
    h.status === "active"
      ? "text-emerald-600"
      : h.status === "upcoming"
        ? "text-blue-500"
        : "text-text-tertiary";
  return (
    <Link
      href={`/hackathons/${h.id}`}
      className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary bg-surface hover:border-text-tertiary/30 transition-all"
    >
      <div className="w-7 h-7 rounded-full bg-background-secondary flex items-center justify-center shrink-0">
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent-bright truncate transition-colors">
          {h.title}
        </div>
        <div className="text-[10px] text-text-tertiary truncate">{h.theme}</div>
      </div>
      <span className={cn("text-[9px] font-semibold uppercase tracking-wide shrink-0", color)}>
        {h.status}
      </span>
    </Link>
  );
}

function MiniTeamCard({ data }: { data: AgentRichCard & { type: "team" } }) {
  const t = data.data;
  return (
    <div className="p-3 rounded-lg border border-border-primary bg-surface space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-primary">
        <Users className="w-3 h-3 text-text-tertiary" /> Team for &ldquo;{t.theme}&rdquo;
      </div>
      {t.members.map((m) => (
        <Link
          key={m.builder.id || m.builder.username}
          href={`/builders/${m.builder.username}`}
          className="group flex items-center gap-2 p-1.5 rounded-md hover:bg-background-secondary transition-colors"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold text-white shrink-0"
            style={{ background: m.builder.gradient }}
          >
            {m.builder.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-text-primary group-hover:text-accent-bright truncate transition-colors">
              {m.builder.name}
            </div>
            <div className="text-[9px] text-text-tertiary">{m.role}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MiniBuilderDetailCard({ data }: { data: AgentRichCard & { type: "builder_detail" } }) {
  const d = data.data;
  return (
    <div className="p-3 rounded-lg border border-border-primary bg-surface space-y-2">
      <Link href={`/builders/${d.builder.username}`} className="group flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
          style={{ background: d.builder.gradient }}
        >
          {d.builder.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
            {d.builder.name}
          </div>
          <div className="text-[10px] text-text-secondary">
            {d.projects.length} projects · {d.totalLikes} signals
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap gap-1">
        {d.builder.skills.slice(0, 4).map((s) => (
          <span key={s} className="text-[9px] font-medium text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5">
            {s}
          </span>
        ))}
      </div>
      {d.projects.slice(0, 2).map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 text-[10px]">
          <span className="font-medium text-text-primary truncate">{p.title}</span>
          <span className="flex items-center gap-0.5 text-text-tertiary shrink-0">
            <Heart className="w-2.5 h-2.5" />
            {p.likes}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniComparisonCard({ data }: { data: AgentRichCard & { type: "comparison" } }) {
  const c = data.data;
  return (
    <div className="p-3 rounded-lg border border-border-primary bg-surface space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-primary">
        <GitCompare className="w-3 h-3 text-text-tertiary" /> Comparison
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[c.builderA, c.builderB].map((b) => (
          <Link
            key={b.id || b.username}
            href={`/builders/${b.username}`}
            className="group text-center p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <div
              className="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[8px] font-semibold text-white mb-1"
              style={{ background: b.gradient }}
            >
              {b.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="text-[10px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
              {b.name.split(" ")[0]}
            </div>
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
    case "builder":
      return <MiniBuilderCard data={card as AgentRichCard & { type: "builder" }} />;
    case "project":
      return <MiniProjectCard data={card as AgentRichCard & { type: "project" }} />;
    case "hackathon":
      return <MiniHackathonCard data={card as AgentRichCard & { type: "hackathon" }} />;
    case "team":
      return <MiniTeamCard data={card as AgentRichCard & { type: "team" }} />;
    case "builder_detail":
      return <MiniBuilderDetailCard data={card as AgentRichCard & { type: "builder_detail" }} />;
    case "comparison":
      return <MiniComparisonCard data={card as AgentRichCard & { type: "comparison" }} />;
    default:
      return null;
  }
}

/* ── Inline markdown ───────────────────────── */

function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      parts.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      parts.push(
        <em key={key++} className="italic text-text-tertiary">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
}

/* ── Main component ────────────────────────── */

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

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

      if (!res.ok) throw new Error("Request failed");

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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          error: "error",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            key="trigger"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="h-12 w-12 rounded-full bg-accent text-white shadow-lg shadow-black/10 flex items-center justify-center hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] h-[500px] bg-surface border border-border-primary rounded-2xl shadow-2xl shadow-black/[0.08] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-primary">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-[13px] font-semibold text-text-primary">Scout</span>
                <span className="text-[10px] text-text-tertiary">Ask anything about builders</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-none">
              {messages.length === 0 && (
                <div className="pt-4 text-center">
                  <p className="text-[13px] text-text-secondary mb-6">
                    Search builders, explore projects, or build a team.
                  </p>
                  <div className="grid gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handleSend(p.prompt)}
                        className="flex items-center gap-2.5 text-left text-[12px] font-medium text-text-secondary hover:text-text-primary border border-border-primary p-3 rounded-lg hover:bg-background-secondary hover:border-text-tertiary/30 transition-all"
                      >
                        <p.icon className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] p-3 text-[13px] leading-relaxed rounded-xl",
                      msg.role === "user"
                        ? "bg-accent text-white rounded-br-sm"
                        : "bg-background-secondary text-text-secondary rounded-bl-sm"
                    )}
                  >
                    <InlineText text={msg.content} />
                  </div>
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2 w-full space-y-1.5">
                      {msg.cards.map((card, i) => (
                        <MiniCardRenderer key={i} card={card} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-1.5 py-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      className="h-1.5 w-1.5 rounded-full bg-text-tertiary"
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border-primary">
              <div className="flex items-center gap-2 bg-background-secondary rounded-xl px-3.5 py-2.5 focus-within:ring-1 focus-within:ring-text-tertiary/30 transition-all">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about builders, projects..."
                  className="flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-tertiary"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                  className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-white disabled:opacity-30 hover:bg-accent-bright transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
