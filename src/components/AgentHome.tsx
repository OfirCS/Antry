"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Users,
  Trophy,
  Loader2,
  ArrowUpRight,
  Heart,
  GitCompare,
  CornerDownLeft,
  RotateCcw,
  AlertCircle,
  Zap,
  Code2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  builders as mockBuilders,
  projects as mockProjects,
  antathons as mockAntathons,
  getInitials,
} from "@/lib/mock-data";
import type { AgentResponseBody, AgentRichCard } from "@/lib/agent/types";

/* ── Constants ─────────────────────────────────────────── */

const MAX_CHARS = 320;
const WARN_CHARS = 240;

const ease = [0.22, 1, 0.36, 1] as const;

const SUGGESTIONS = [
  { icon: Search, label: "Find AI builders", prompt: "Find builders who work with AI agents" },
  { icon: Trophy, label: "Active hackathons", prompt: "What hackathons are active right now?" },
  { icon: Users, label: "Build a team", prompt: "Build me a team for the AI hackathon" },
  { icon: GitCompare, label: "Compare builders", prompt: "Compare Mara and Jake" },
];

const FOLLOW_UPS = [
  "Tell me more about the top result",
  "Show me their projects",
  "Which hackathon should I join?",
  "Build me a team",
];

/* ── Types ─────────────────────────────────────────────── */

interface ConversationTurn {
  id: string;
  query: string;
  response: string | null;
  steps: { tool: string; result: string }[];
  cards: AgentRichCard[];
  error: string | null;
  isLoading: boolean;
}

/* ── Markdown line renderer ────────────────────────────── */

function RenderLine({ line }: { line: string }) {
  if (line.trim() === "") return <br />;

  // Process inline markdown: **bold** and *italic*
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      parts.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      }
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

  return <p className="leading-relaxed">{parts}</p>;
}

/* ── Source pill (Perplexity-style tool step) ──────────── */

function SourcePill({ tool, result }: { tool: string; result: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background-secondary border border-border-primary/40 text-[11px] shrink-0"
      title={result}
    >
      <Zap className="w-2.5 h-2.5 text-accent" />
      <span className="font-medium text-text-secondary truncate max-w-[140px]">
        {tool.replace(/_/g, " ")}
      </span>
    </motion.div>
  );
}

/* ── Shimmer skeleton ──────────────────────────────────── */

function ThinkingSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {[0.8, 1, 0.6].map((width, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.15 }}
          className="h-3 rounded-full bg-border-secondary/60 overflow-hidden"
          style={{ width: `${width * 100}%` }}
        >
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-border-primary/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Rich card renderers ───────────────────────────────── */

function BuilderCard({ data }: { data: AgentRichCard & { type: "builder" } }) {
  const b = data.data;
  return (
    <Link
      href={`/builders/${b.username}`}
      className="group flex items-center gap-3 p-3 rounded-xl border border-border-primary/40 bg-background-primary hover:border-accent/30 hover:bg-accent-muted/20 transition-all"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: b.gradient }}
      >
        {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">
          {b.name}
        </div>
        <div className="text-[11px] text-text-tertiary truncate">{b.tagline}</div>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent shrink-0 transition-colors" />
    </Link>
  );
}

function ProjectCard({ data }: { data: AgentRichCard & { type: "project" } }) {
  const p = data.data;
  return (
    <Link
      href={`/projects/${p.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl border border-border-primary/40 bg-background-primary hover:border-accent/30 hover:bg-accent-muted/20 transition-all"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: p.gradient }}
      >
        <Code2 className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">
          {p.title}
        </div>
        <div className="text-[11px] text-text-tertiary truncate">
          {p.builder.name} · {p.techStack.slice(0, 2).join(", ")}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-text-tertiary shrink-0">
        <Heart className="w-3 h-3" />
        {p.likes}
      </div>
    </Link>
  );
}

function HackathonCard({ data }: { data: AgentRichCard & { type: "hackathon" } }) {
  const h = data.data;
  const statusColor = h.status === "active" ? "text-green-500 bg-green-500/10" : h.status === "upcoming" ? "text-blue-500 bg-blue-500/10" : "text-text-tertiary bg-background-secondary";
  return (
    <Link
      href={`/hackathons/${h.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl border border-border-primary/40 bg-background-primary hover:border-accent/30 hover:bg-accent-muted/20 transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
        <Trophy className="w-4 h-4 text-yellow-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">
          {h.title}
        </div>
        <div className="text-[11px] text-text-tertiary truncate">{h.theme}</div>
      </div>
      <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0", statusColor)}>
        {h.status}
      </span>
    </Link>
  );
}

function TeamCard({ data }: { data: AgentRichCard & { type: "team" } }) {
  const t = data.data;
  return (
    <div className="p-4 rounded-xl border border-accent/20 bg-accent-muted/10 space-y-3">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-accent">
        <Users className="w-3.5 h-3.5" />
        Team for &ldquo;{t.theme}&rdquo;
      </div>
      <div className="space-y-2">
        {t.members.map((m) => (
          <Link
            key={m.builder.id || m.builder.username}
            href={`/builders/${m.builder.username}`}
            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: m.builder.gradient }}
            >
              {m.builder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors">
                {m.builder.name}
              </div>
              <div className="text-[11px] text-accent">{m.role}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BuilderDetailCard({ data }: { data: AgentRichCard & { type: "builder_detail" } }) {
  const d = data.data;
  return (
    <div className="p-4 rounded-xl border border-border-primary/40 bg-background-primary space-y-3">
      <Link href={`/builders/${d.builder.username}`} className="group flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold text-white shrink-0"
          style={{ background: d.builder.gradient }}
        >
          {d.builder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors">
            {d.builder.name}
          </div>
          <div className="text-[12px] text-text-tertiary">
            {d.projects.length} projects · {d.totalLikes} likes
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap gap-1.5">
        {d.builder.skills.slice(0, 5).map((s) => (
          <span key={s} className="text-[10px] font-medium text-text-tertiary bg-background-secondary rounded-full px-2 py-0.5">
            {s}
          </span>
        ))}
      </div>
      {d.projects.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border-primary/30">
          {d.projects.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-text-primary truncate">{p.title}</span>
              <span className="flex items-center gap-1 text-text-tertiary shrink-0">
                <Heart className="w-2.5 h-2.5" /> {p.likes}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparisonCard({ data }: { data: AgentRichCard & { type: "comparison" } }) {
  const c = data.data;
  return (
    <div className="p-4 rounded-xl border border-border-primary/40 bg-background-primary space-y-3">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-text-primary">
        <GitCompare className="w-3.5 h-3.5 text-accent" /> Builder Comparison
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { b: c.builderA, projects: c.projectsA.length, likes: c.likesA, unique: c.uniqueA },
          { b: c.builderB, projects: c.projectsB.length, likes: c.likesB, unique: c.uniqueB },
        ].map(({ b, projects, likes, unique }) => (
          <Link key={b.id || b.username} href={`/builders/${b.username}`} className="group text-center">
            <div
              className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-[11px] font-bold text-white mb-2"
              style={{ background: b.gradient }}
            >
              {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors">
              {b.name}
            </div>
            <div className="text-[11px] text-text-tertiary mt-1">
              {projects} projects · {likes} likes
            </div>
            {unique.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {unique.slice(0, 3).map((s) => (
                  <span key={s} className="text-[9px] font-medium text-accent bg-accent-muted/30 rounded-full px-1.5 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
      {c.sharedSkills.length > 0 && (
        <div className="text-center pt-2 border-t border-border-primary/30">
          <span className="text-[10px] text-text-tertiary">
            Shared: {c.sharedSkills.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

function RichCardRenderer({ card }: { card: AgentRichCard }) {
  switch (card.type) {
    case "builder":
      return <BuilderCard data={card as AgentRichCard & { type: "builder" }} />;
    case "project":
      return <ProjectCard data={card as AgentRichCard & { type: "project" }} />;
    case "hackathon":
      return <HackathonCard data={card as AgentRichCard & { type: "hackathon" }} />;
    case "team":
      return <TeamCard data={card as AgentRichCard & { type: "team" }} />;
    case "builder_detail":
      return <BuilderDetailCard data={card as AgentRichCard & { type: "builder_detail" }} />;
    case "comparison":
      return <ComparisonCard data={card as AgentRichCard & { type: "comparison" }} />;
    default:
      return null;
  }
}

/* ── Main component ────────────────────────────────────── */

export function AgentHome() {
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasResults = turns.length > 0;

  const scrollToResults = useCallback(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (turns.length > 0) {
      const timer = setTimeout(scrollToResults, 100);
      return () => clearTimeout(timer);
    }
  }, [turns.length, scrollToResults]);

  const handleSearch = async (text?: string) => {
    const msg = (text || query).trim();
    if (!msg || isSearching) return;

    const turnId = Date.now().toString();
    const turn: ConversationTurn = {
      id: turnId,
      query: msg,
      response: null,
      steps: [],
      cards: [],
      error: null,
      isLoading: true,
    };

    setTurns((prev) => [...prev, turn]);
    setQuery("");
    setIsSearching(true);

    try {
      const history = turns
        .filter((t) => t.response)
        .slice(-6)
        .flatMap((t) => [
          { role: "user" as const, content: t.query },
          { role: "assistant" as const, content: t.response! },
        ]);

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

      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? { ...t, response: json.response, steps: json.steps, cards: json.cards, isLoading: false }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId ? { ...t, error: message, isLoading: false } : t
        )
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const resetConversation = () => {
    setTurns([]);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <section className="relative py-24 md:py-32 px-6 hero-mesh">
      {/* Multi-blob backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[var(--mesh-blob-1)] blur-[120px] float-slow" />
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full bg-[var(--mesh-blob-2)] blur-[100px] float-medium" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-[var(--mesh-blob-3)] blur-[90px] float-slow" />
        <div className="dot-grid absolute inset-0" />
      </div>

      <div className="relative max-w-[720px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className={cn("text-center transition-all duration-500", hasResults ? "mb-8" : "mb-12")}
        >
          {!hasResults && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted/50 border border-accent/20 text-[11px] font-semibold text-accent uppercase tracking-widest mb-6 shadow-[0_0_20px_var(--glow-orange)] backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </div>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] text-text-primary tracking-[-0.04em] leading-[0.95] mb-4">
                Discover builders
                <br />
                <span className="gradient-text">by what they ship.</span>
              </h1>
              <p className="text-[15px] text-text-secondary max-w-md mx-auto leading-relaxed">
                Scout searches {mockBuilders.length} builders, {mockProjects.length} projects, and {mockAntathons.length} hackathons. Ask anything.
              </p>
            </>
          )}
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className={cn(
            "relative glass-card search-glow rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300",
            isSearching
              ? "border-accent/40 shadow-[0_0_30px_var(--glow-orange),0_0_60px_var(--glow-orange)]"
              : "border-border-primary/60 hover:border-border-primary focus-within:border-accent/40"
          )}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />
            ) : (
              <Search className="w-5 h-5 text-text-tertiary shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="Ask Scout about builders, projects, hackathons..."
              disabled={isSearching}
              maxLength={MAX_CHARS}
              className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary/60 outline-none disabled:opacity-50"
              autoComplete="off"
            />
            {query.trim() && (
              <button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-primary text-background-primary text-[12px] font-semibold hover:opacity-80 disabled:opacity-30 transition-opacity shrink-0"
              >
                <CornerDownLeft className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Character counter near limit */}
          {query.length > WARN_CHARS && (
            <div className="absolute right-5 -bottom-5 text-[10px] text-text-tertiary">
              {query.length}/{MAX_CHARS}
            </div>
          )}
        </motion.div>

        {/* Suggestion chips (only when no results) */}
        <AnimatePresence>
          {!hasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSearch(s.prompt)}
                  disabled={isSearching}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-[13px] font-medium text-text-secondary hover:border-accent/30 hover:text-text-primary hover:bg-accent-muted/20 hover:shadow-[0_0_15px_var(--glow-orange)] disabled:opacity-40 transition-all"
                >
                  <s.icon className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent transition-colors" />
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security note */}
        {!hasResults && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[11px] text-text-tertiary/50 mt-5"
          >
            Scout only answers Antry queries. Rate limited. No external data.
          </motion.p>
        )}

        {/* Results */}
        {hasResults && (
          <div ref={resultsRef} className="mt-8 space-y-8">
            {/* New search button */}
            <div className="flex justify-center">
              <button
                onClick={resetConversation}
                className="flex items-center gap-1.5 text-[12px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                New search
              </button>
            </div>

            {turns.map((turn) => (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="space-y-4"
              >
                {/* User query */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-3.5 h-3.5 text-background-primary" />
                  </div>
                  <p className="text-[15px] font-medium text-text-primary pt-1">{turn.query}</p>
                </div>

                {/* Sources bar (Perplexity-style) */}
                {turn.steps.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider shrink-0">
                      Sources
                    </span>
                    {turn.steps.map((step, i) => (
                      <SourcePill key={i} tool={step.tool} result={step.result} />
                    ))}
                  </div>
                )}

                {/* Loading state */}
                {turn.isLoading && <ThinkingSkeleton />}

                {/* Error state */}
                {turn.error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-red-600 dark:text-red-400">{turn.error}</p>
                      <button
                        onClick={() => handleSearch(turn.query)}
                        className="text-[12px] font-medium text-text-tertiary hover:text-text-primary mt-2 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {/* Response */}
                {turn.response && (
                  <div className="space-y-4">
                    {/* Text response */}
                    <div className="text-[14px] text-text-secondary space-y-1.5">
                      {turn.response.split("\n").map((line, i) => (
                        <RenderLine key={i} line={line} />
                      ))}
                    </div>

                    {/* Rich cards */}
                    {turn.cards.length > 0 && (
                      <div className="space-y-2">
                        {turn.cards.map((card, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                          >
                            <RichCardRenderer card={card} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Divider between turns */}
                {turn.response && <div className="border-t border-border-primary/30" />}
              </motion.div>
            ))}

            {/* Follow-up chips */}
            {!isSearching && turns[turns.length - 1]?.response && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {FOLLOW_UPS.map((fu) => (
                  <button
                    key={fu}
                    onClick={() => handleSearch(fu)}
                    className="px-3.5 py-2 rounded-xl border border-border-primary/40 bg-background-primary text-[12px] font-medium text-text-secondary hover:border-accent/30 hover:text-text-primary hover:bg-accent-muted/20 transition-all"
                  >
                    {fu}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
