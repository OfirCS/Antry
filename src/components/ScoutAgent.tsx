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
      <div className="w-7 h-7 rounded-md bg-background-secondary flex items-center justify-center shrink-0">
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

      if (!res.ok) throw new Error("Request failed");

      const json = (await res.json()) as AgentResponseBody;
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: json.response,
        steps: json.steps,
        cards: json.cards,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sync interrupted.", error: "error" }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            layoutId="agent"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="relative h-16 w-16 group"
          >
            {/* 3D Orb Effect */}
            <div className="absolute inset-0 rounded-full bg-text-primary shadow-[0_0_40px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-shadow" />
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[-4px] rounded-full border border-text-primary/20" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="w-6 h-6 text-background-primary" />
            </div>
            
            {/* Minimal Tooltip */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: -20 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-text-primary text-background-primary px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest pointer-events-none"
            >
              Ask Scout
            </motion.div>
          </motion.button>
        ) : (
          <motion.div
            layoutId="agent"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="w-[360px] h-[520px] bg-surface border border-border-primary rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-background-tertiary/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-text-primary animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-primary">Scout Interface</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-none">
              {messages.length === 0 && (
                <div className="pt-8 text-center">
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    I have indexed all production records.
                    <br />
                    What can I retrieve for you?
                  </p>
                  <div className="mt-8 grid gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button 
                        key={p.label}
                        onClick={() => handleSend(p.prompt)}
                        className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary hover:text-text-primary border border-border-primary p-3 rounded hover:bg-background-tertiary transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[90%] p-4 text-[13px] leading-relaxed",
                    msg.role === "user" 
                      ? "bg-background-tertiary text-text-primary border border-border-primary rounded-lg" 
                      : "text-text-secondary border-l-2 border-border-primary pl-4"
                  )}>
                    <InlineText text={msg.content} />
                  </div>
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-4 w-full space-y-2 pl-4">
                      {msg.cards.map((card, i) => (
                        <MiniCardRenderer key={i} card={card} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="pl-4 border-l-2 border-border-primary py-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="h-1.5 w-1.5 rounded-full bg-text-tertiary"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background-tertiary/30 border-t border-border-primary">
              <div className="flex items-center gap-3 bg-surface border border-border-primary px-4 py-2.5 rounded focus-within:border-text-primary transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Request details..."
                  className="flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-tertiary/40"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                  className="text-text-primary disabled:opacity-20 hover:scale-110 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
