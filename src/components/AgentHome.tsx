"use client";

import { useState, useRef, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
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
  Compass,
  UsersRound,
  Layers,
  User,
  Clock,
  ArrowUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentResponseBody, AgentRichCard, AgentSuggestion } from "@/lib/agent/types";

const MAX_CHARS = 320;
const ease = [0.22, 1, 0.36, 1] as const;

const SUGGESTIONS = [
  { icon: Compass, label: "Find builders", prompt: "Find builders who work with AI agents" },
  { icon: Trophy, label: "View hackathons", prompt: "What hackathons are active right now?" },
  { icon: UsersRound, label: "Build a team", prompt: "Build me a team for the AI hackathon" },
  { icon: Layers, label: "Compare profiles", prompt: "Compare Mara and Jake" },
];

const FOLLOW_UPS = [
  "Show the strongest matches",
  "Show the best projects",
  "Which hackathon fits best?",
  "Build the best team",
];

const SKILL_EMOJI_MAP: Record<string, string> = {
  react: "\u269B\uFE0F",
  "react.js": "\u269B\uFE0F",
  "next.js": "\u25B2",
  nextjs: "\u25B2",
  typescript: "\uD83D\uDCD8",
  javascript: "\uD83D\uDFE1",
  python: "\uD83D\uDC0D",
  rust: "\u2699\uFE0F",
  "node.js": "\uD83D\uDFE2",
  nodejs: "\uD83D\uDFE2",
  ai: "\uD83E\uDDE0",
  ml: "\uD83E\uDDE0",
  "machine learning": "\uD83E\uDDE0",
  docker: "\uD83D\uDC33",
  aws: "\u2601\uFE0F",
  gcp: "\u2601\uFE0F",
  firebase: "\uD83D\uDD25",
  graphql: "\u25C6",
  postgresql: "\uD83D\uDC18",
  postgres: "\uD83D\uDC18",
  mongodb: "\uD83C\uDF43",
  tailwind: "\uD83C\uDFA8",
  "tailwindcss": "\uD83C\uDFA8",
  figma: "\uD83C\uDFA8",
  design: "\uD83C\uDFA8",
  swift: "\uD83C\uDF4E",
  ios: "\uD83D\uDCF1",
  android: "\uD83E\uDD16",
  blockchain: "\u26D3\uFE0F",
  web3: "\u26D3\uFE0F",
  solidity: "\u26D3\uFE0F",
  langchain: "\uD83E\uDD9C",
  openai: "\uD83E\uDDE0",
  vue: "\uD83D\uDFE9",
  "vue.js": "\uD83D\uDFE9",
  go: "\uD83D\uDC39",
  golang: "\uD83D\uDC39",
  java: "\u2615",
  kubernetes: "\u2638\uFE0F",
  devops: "\uD83D\uDD27",
  sql: "\uD83D\uDDC3\uFE0F",
};

function getSkillEmoji(skill: string): string {
  const key = skill.toLowerCase().trim();
  return SKILL_EMOJI_MAP[key] || "\uD83D\uDCA0";
}

interface ConversationTurn {
  id: string;
  query: string;
  response: string | null;
  steps: { tool: string; result: string }[];
  cards: AgentRichCard[];
  suggestions: AgentSuggestion[];
  intent: string | null;
  error: string | null;
  isLoading: boolean;
  timestamp: number;
}

/* -- useTypewriter hook ----------------------------------- */

function useTypewriter(text: string | null, speed: number = 22) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const prevTextRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setIsDone(false);
      prevTextRef.current = null;
      return;
    }

    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      setDisplayed("");
      setIsDone(false);

      // Split into tokens: words and whitespace chunks, but keep markdown
      // markers attached to adjacent words so **bold** stays as one token.
      const tokens: string[] = [];
      let buffer = "";
      const chars = [...text];
      let i = 0;
      while (i < chars.length) {
        const ch = chars[i];
        const isWhitespace = /\s/.test(ch);
        if (isWhitespace) {
          if (buffer.length > 0) {
            tokens.push(buffer);
            buffer = "";
          }
          // Collect all contiguous whitespace
          let ws = "";
          while (i < chars.length && /\s/.test(chars[i])) {
            ws += chars[i];
            i++;
          }
          tokens.push(ws);
        } else {
          buffer += ch;
          i++;
        }
      }
      if (buffer.length > 0) tokens.push(buffer);

      let currentIndex = 0;
      let accumulated = "";
      let lastTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - lastTime;
        if (elapsed >= speed && currentIndex < tokens.length) {
          accumulated += tokens[currentIndex];
          setDisplayed(accumulated);
          currentIndex++;
          lastTime = now;
        }
        if (currentIndex < tokens.length) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setDisplayed(text); // ensure final state is exact
          setIsDone(true);
        }
      };

      rafRef.current = requestAnimationFrame(step);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [text, speed]);

  return { displayed, isDone };
}

/* -- Relative time formatter ------------------------------ */

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 5000) return "just now";
  if (diff < 30000) return "a moment ago";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

/* -- Timestamp component (live-updates) ------------------- */

function Timestamp({ ts }: { ts: number }) {
  const [label, setLabel] = useState(() => getRelativeTime(ts));

  useEffect(() => {
    const interval = setInterval(() => setLabel(getRelativeTime(ts)), 5000);
    return () => clearInterval(interval);
  }, [ts]);

  return (
    <span className="flex items-center gap-1 text-[10px] text-[#A3A3A3] font-medium">
      <Clock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

/* -- Markdown line renderer ------------------------------- */

function RenderLine({ line }: { line: string }) {
  if (line.trim() === "") return <br />;

  // Handle list items (- item)
  const listMatch = line.match(/^(\s*)-\s+(.*)/);
  const isListItem = !!listMatch;
  const lineContent = isListItem ? listMatch![2] : line;

  const parts: React.ReactNode[] = [];
  let remaining = lineContent;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      parts.push(<strong key={key++} className="font-semibold text-[#111111]">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      parts.push(<em key={key++} className="italic text-[#737373]">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }
    // Handle incomplete markdown markers gracefully -- render them as plain text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  if (isListItem) {
    return (
      <div className="flex items-start gap-2 pl-1">
        <span className="mt-[7px] w-1 h-1 rounded-full bg-[#737373] shrink-0" />
        <p className="leading-relaxed">{parts}</p>
      </div>
    );
  }
  return <p className="leading-relaxed">{parts}</p>;
}

/* -- Source pill ------------------------------------------- */

function SourcePill({ tool, result }: { tool: string; result: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 shrink-0 rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-[#525252]"
      title={result}
    >
      <Zap className="w-2.5 h-2.5 text-[#C6F135]" />
      <span className="truncate max-w-[120px]">{tool.replace(/_/g, " ")}</span>
    </motion.div>
  );
}

/* -- Thinking indicator (animated dots with text) --------- */

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F5] shrink-0">
        <Sparkles className="h-3.5 w-3.5 text-[#111111]" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-[#F5F5F5] px-4 py-3 inline-flex items-center gap-2">
        <span className="text-[13px] text-[#737373] font-medium">Scout is thinking</span>
        <span className="inline-flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-[5px] h-[5px] rounded-full bg-[#737373]"
              animate={{
                y: [0, -5, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </span>
      </div>
    </motion.div>
  );
}

/* -- Shimmer border wrapper ------------------------------- */

function ShimmerBorder({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + delay * 0.08, duration: 0.35, ease }}
      className="relative rounded-2xl"
    >
      <motion.div
        className="absolute -inset-[1px] rounded-2xl pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #C6F135, transparent)",
          backgroundSize: "200% 100%",
        }}
        initial={{ opacity: 0.8 }}
        animate={{
          opacity: [0.8, 0],
          backgroundPosition: ["-100% 0", "200% 0"],
        }}
        transition={{
          duration: 1.5,
          delay: 0.1 + delay * 0.08,
          ease: "easeOut",
        }}
      />
      {children}
    </motion.div>
  );
}

/* -- Match score badge ------------------------------------ */

function MatchScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#C6F135" : score >= 75 ? "#28C840" : "#FEBC2E";
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-1 shrink-0"
    >
      <div
        className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
        style={{ backgroundColor: `${color}20`, color: score >= 90 ? "#111111" : color }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {score}%
      </div>
    </motion.div>
  );
}

/* -- Team Chemistry Score --------------------------------- */

function TeamChemistryScore({ members }: { members: { builder: { skills: string[] }; role: string }[] }) {
  const allSkills = members.flatMap((m) => m.builder.skills.map((s) => s.toLowerCase()));
  const uniqueSkills = new Set(allSkills);
  const roleSet = new Set(members.map((m) => m.role.toLowerCase()));
  const diversityScore = Math.min((uniqueSkills.size / Math.max(allSkills.length, 1)) * 100, 100);
  const roleDiversity = Math.min((roleSet.size / members.length) * 100, 100);
  const chemistry = Math.round((diversityScore * 0.6 + roleDiversity * 0.4));

  const label = chemistry >= 85 ? "Excellent" : chemistry >= 70 ? "Strong" : chemistry >= 50 ? "Good" : "Developing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#C6F135]/10 via-[#C6F135]/5 to-transparent px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[14px]"
        >
          {"\u2728"}
        </motion.div>
        <span className="text-[11px] font-semibold text-[#525252]">Team Chemistry</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-[#EBEBEB] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#C6F135]"
            initial={{ width: 0 }}
            animate={{ width: `${chemistry}%` }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-[11px] font-bold text-[#111111] tabular-nums">{chemistry}%</span>
        <span className="text-[10px] font-medium text-[#737373]">{label}</span>
      </div>
    </motion.div>
  );
}

/* -- Typewriter response renderer ------------------------- */

function TypewriterResponse({ text }: { text: string }) {
  const { displayed, isDone } = useTypewriter(text, 22);

  const lines = useMemo(() => displayed.split("\n"), [displayed]);

  return (
    <div className="text-[14px] text-[#525252] space-y-1.5">
      {lines.map((line, i) => (
        <div key={i}>
          <RenderLine line={line} />
        </div>
      ))}
      {!isDone && (
        <motion.span
          className="inline-block w-[2px] h-[16px] bg-[#C6F135] ml-0.5 align-text-bottom"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.53, repeat: Infinity }}
        />
      )}
    </div>
  );
}

/* -- Inline rich cards (inside agent results) ------------- */

function InlineBuilderCard({ data }: { data: AgentRichCard & { type: "builder" } }) {
  const b = data.data;
  const matchScore = data.relevanceScore ?? 75;

  return (
    <Link
      href={`/builders/${b.username}`}
      className="group flex items-center gap-3 rounded-2xl border border-[#EBEBEB] bg-white p-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px]"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
        style={{ background: b.gradient }}
      >
        {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#111111] group-hover:text-[#111111] truncate transition-colors tracking-tight">
            {b.name}
          </span>
          <MatchScoreBadge score={matchScore} />
        </div>
        <div className="text-[11px] text-[#737373] truncate">{b.tagline}</div>
        {b.skills.length > 0 && (
          <div className="flex items-center gap-1 mt-1 overflow-hidden">
            {b.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-0.5 rounded-full bg-[#F5F5F5] px-1.5 py-0.5 text-[9px] font-medium text-[#525252] shrink-0"
              >
                <span className="text-[8px]">{getSkillEmoji(s)}</span>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#111111] shrink-0 transition-colors" />
    </Link>
  );
}

function InlineProjectCard({ data }: { data: AgentRichCard & { type: "project" } }) {
  const p = data.data;
  const matchScore = data.relevanceScore ?? 75;
  return (
    <Link
      href={`/projects/${p.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-[#EBEBEB] bg-white p-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px]"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: p.gradient }}
      >
        <Code2 className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#111111] group-hover:text-[#111111] truncate transition-colors tracking-tight">
            {p.title}
          </span>
          <MatchScoreBadge score={matchScore} />
        </div>
        <div className="text-[11px] text-[#737373] truncate">
          {p.builder.name} · {p.techStack.slice(0, 2).join(", ")}
        </div>
        {p.techStack.length > 0 && (
          <div className="flex items-center gap-1 mt-1 overflow-hidden">
            {p.techStack.slice(0, 3).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-0.5 rounded-full bg-[#F5F5F5] px-1.5 py-0.5 text-[9px] font-medium text-[#525252] shrink-0"
              >
                <span className="text-[8px]">{getSkillEmoji(s)}</span>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-[11px] text-[#737373] shrink-0">
        <Heart className="w-3 h-3" />
        {p.likes}
      </div>
    </Link>
  );
}

function InlineHackathonCard({ data }: { data: AgentRichCard & { type: "hackathon" } }) {
  const h = data.data;
  const matchScore = data.relevanceScore ?? 75;
  const statusCls =
    h.status === "active"
      ? "text-emerald-700 bg-emerald-50"
      : h.status === "upcoming"
        ? "text-blue-700 bg-blue-50"
        : "text-[#737373] bg-[#F5F5F5]";
  return (
    <Link
      href={`/hackathons/${h.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-[#EBEBEB] bg-white p-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px]"
    >
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
        <Trophy className="w-4 h-4 text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#111111] group-hover:text-[#111111] truncate transition-colors tracking-tight">
            {h.title}
          </span>
          <MatchScoreBadge score={matchScore} />
        </div>
        <div className="text-[11px] text-[#737373] truncate">{h.theme}</div>
      </div>
      <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0", statusCls)}>
        {h.status}
      </span>
    </Link>
  );
}

function InlineTeamCard({ data }: { data: AgentRichCard & { type: "team" } }) {
  const t = data.data;
  return (
    <div className="rounded-2xl bg-[#C6F135]/10 border border-[#C6F135]/20 p-4 space-y-3 overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #111111 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative flex items-center gap-2 text-[12px] font-semibold text-[#111111]">
        <Users className="w-3.5 h-3.5" />
        Team for &ldquo;{t.theme}&rdquo;
      </div>

      <TeamChemistryScore members={t.members} />

      <div className="relative space-y-2">
        {t.members.map((m, mi) => (
          <motion.div
            key={m.builder.id || m.builder.username}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + mi * 0.08, duration: 0.3 }}
          >
            <Link
              href={`/builders/${m.builder.username}`}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                style={{ background: m.builder.gradient }}
              >
                {m.builder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[#111111] group-hover:text-[#111111] truncate transition-colors">
                  {m.builder.name}
                </div>
                <div className="text-[11px] text-[#525252]">{m.role}</div>
              </div>
              {m.builder.skills.length > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  {m.builder.skills.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-[#525252] shrink-0"
                    >
                      <span className="text-[8px]">{getSkillEmoji(s)}</span>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function InlineBuilderDetailCard({ data }: { data: AgentRichCard & { type: "builder_detail" } }) {
  const d = data.data;
  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-4 space-y-3">
      <Link href={`/builders/${d.builder.username}`} className="group flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold text-white shrink-0"
          style={{ background: d.builder.gradient }}
        >
          {d.builder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-[#111111] group-hover:text-[#111111] transition-colors">
            {d.builder.name}
          </div>
          <div className="text-[12px] text-[#737373]">
            {d.projects.length} projects · {d.totalLikes} likes
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap gap-1.5">
        {d.builder.skills.slice(0, 5).map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-0.5 rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-[#525252]"
          >
            <span className="text-[9px]">{getSkillEmoji(s)}</span>
            {s}
          </span>
        ))}
      </div>
      {d.projects.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#EBEBEB]">
          {d.projects.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-[#111111] truncate">{p.title}</span>
              <span className="flex items-center gap-1 text-[#737373] shrink-0">
                <Heart className="w-2.5 h-2.5" /> {p.likes}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineComparisonCard({ data }: { data: AgentRichCard & { type: "comparison" } }) {
  const c = data.data;
  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#111111]">
        <GitCompare className="w-3.5 h-3.5 text-[#C6F135]" /> Builder Comparison
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { b: c.builderA, projects: c.projectsA.length, likes: c.likesA, unique: c.uniqueA },
          { b: c.builderB, projects: c.projectsB.length, likes: c.likesB, unique: c.uniqueB },
        ].map(({ b, projects, likes, unique }) => (
          <Link key={b.id || b.username} href={`/builders/${b.username}`} className="group text-center">
            <div
              className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-[11px] font-semibold text-white mb-2"
              style={{ background: b.gradient }}
            >
              {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="text-[13px] font-semibold text-[#111111] group-hover:text-[#111111] transition-colors">
              {b.name}
            </div>
            <div className="text-[11px] text-[#737373] mt-1">
              {projects} projects · {likes} likes
            </div>
            {unique.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {unique.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[#111111] bg-[#C6F135]/12 rounded-full px-1.5 py-0.5"
                  >
                    <span className="text-[8px]">{getSkillEmoji(s)}</span>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
      {c.sharedSkills.length > 0 && (
        <div className="text-center pt-2 border-t border-[#EBEBEB]">
          <span className="text-[10px] text-[#737373]">
            Shared: {c.sharedSkills.map((s) => `${getSkillEmoji(s)} ${s}`).join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

function RichCardRenderer({ card, index }: { card: AgentRichCard; index: number }) {
  const inner = (() => {
    switch (card.type) {
      case "builder":
        return <InlineBuilderCard data={card as AgentRichCard & { type: "builder" }} />;
      case "project":
        return <InlineProjectCard data={card as AgentRichCard & { type: "project" }} />;
      case "hackathon":
        return <InlineHackathonCard data={card as AgentRichCard & { type: "hackathon" }} />;
      case "team":
        return <InlineTeamCard data={card as AgentRichCard & { type: "team" }} />;
      case "builder_detail":
        return <InlineBuilderDetailCard data={card as AgentRichCard & { type: "builder_detail" }} />;
      case "comparison":
        return <InlineComparisonCard data={card as AgentRichCard & { type: "comparison" }} />;
      default:
        return null;
    }
  })();

  return <ShimmerBorder delay={index}>{inner}</ShimmerBorder>;
}

/* -- Welcome message (shown before any conversation) ------ */

const WELCOME_TEXT = `Hey! I'm **Scout**, your guide to the Antry builder network.\n\nI can help you discover builders, explore projects, find hackathons, and assemble teams -- all from real platform data. What would you like to explore?`;

function WelcomeMessage() {
  const { displayed, isDone } = useTypewriter(WELCOME_TEXT, 18);
  const lines = useMemo(() => displayed.split("\n"), [displayed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] shrink-0">
        <Sparkles className="h-4 w-4 text-[#C6F135]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-[#525252] space-y-1.5">
          {lines.map((line, i) => (
            <div key={i}>
              <RenderLine line={line} />
            </div>
          ))}
          {!isDone && (
            <motion.span
              className="inline-block w-[2px] h-[16px] bg-[#C6F135] ml-0.5 align-text-bottom"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.53, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* -- Suggestion pill buttons ------------------------------ */

function SuggestionPills({
  suggestions,
  onSelect,
  disabled,
}: {
  suggestions: { label: string; prompt: string; icon?: React.ComponentType<{ className?: string }> }[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3, ease }}
      className="flex flex-wrap gap-2"
    >
      {suggestions.map((s, i) => (
        <motion.button
          key={s.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05, duration: 0.25 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(s.prompt)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#EBEBEB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#525252] transition-all duration-200 hover:text-[#111111] hover:border-[#C6F135]/40 hover:shadow-[0_2px_8px_rgba(198,241,53,0.1)] disabled:opacity-40"
        >
          {s.icon && <s.icon className="w-3.5 h-3.5 text-[#737373]" />}
          {s.label}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* -- Main component --------------------------------------- */

export interface AgentHomeHandle {
  triggerSearch: (text: string) => void;
  focusInput: () => void;
}

interface AgentHomeProps {
  embedded?: boolean;
}

export const AgentHome = forwardRef<AgentHomeHandle, AgentHomeProps>(function AgentHome({ embedded = false }, ref) {
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasResults = turns.length > 0;

  // Auto-scroll to bottom when new content arrives
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  // Cmd+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(scrollToBottom, 120);
    return () => clearTimeout(t);
  }, [turns, scrollToBottom]);

  const handleSearch = async (text?: string) => {
    const msg = (text || query).trim();
    if (!msg || isSearching) return;
    const turnId = Date.now().toString();
    const timestamp = Date.now();
    setTurns((prev) => [
      ...prev,
      { id: turnId, query: msg, response: null, steps: [], cards: [], suggestions: [], intent: null, error: null, isLoading: true, timestamp },
    ]);
    setQuery("");
    setIsSearching(true);
    try {
      const history = turns
        .filter((t) => t.response && t.response.trim().length > 0)
        .slice(-6)
        .flatMap((t) => {
          const items: { role: "user" | "assistant"; content: string; intent?: string }[] = [
            { role: "user", content: t.query.slice(0, 320) },
            { role: "assistant", content: (t.response || "ok").slice(0, 320) },
          ];
          if (t.intent) items[1].intent = t.intent;
          return items;
        });
      // Try Scout's real-LLM endpoint first; if it 503s (no API key) or
      // 502s (transient), fall through to the legacy TF-IDF route.
      let res = await fetch("/api/agent/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      if (!res.ok && (res.status === 503 || res.status === 502)) {
        res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, history }),
        });
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      const json = (await res.json()) as AgentResponseBody;
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId ? { ...t, response: json.response, steps: json.steps, cards: json.cards, suggestions: json.suggestions || [], intent: json.intent, isLoading: false } : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, error: message, isLoading: false } : t)));
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

  // Expose triggerSearch to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSearch: (text: string) => {
      handleSearch(text);
    },
    focusInput: () => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  }));

  return (
    <section className={cn(
      "relative flex flex-col",
      embedded ? "h-[calc(100vh-200px)] min-h-[500px]" : "h-[calc(100vh-80px)] min-h-[600px]",
    )}>
      <div className={cn("relative mx-auto flex flex-col flex-1 w-full", embedded ? "max-w-[1000px]" : "max-w-[720px]", "px-4 sm:px-6")}>

        {/* Chat messages area -- scrollable, grows to fill space */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-none"
        >
          {/* Welcome message when no conversation */}
          {!hasResults && (
            <div className="space-y-5">
              <WelcomeMessage />
              <div className="pl-11">
                <SuggestionPills
                  suggestions={SUGGESTIONS.map((s) => ({ ...s, icon: s.icon }))}
                  onSelect={(prompt) => handleSearch(prompt)}
                  disabled={isSearching}
                />
              </div>
            </div>
          )}

          {/* Conversation turns */}
          {turns.map((turn) => (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
              className="space-y-4"
            >
              {/* User message */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F5] shrink-0">
                  <User className="h-4 w-4 text-[#525252]" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-[14px] font-medium text-[#111111] leading-relaxed">{turn.query}</p>
                  <div className="mt-1">
                    <Timestamp ts={turn.timestamp} />
                  </div>
                </div>
              </div>

              {/* Thinking indicator */}
              <AnimatePresence>
                {turn.isLoading && !turn.response && !turn.error && (
                  <ThinkingIndicator />
                )}
              </AnimatePresence>

              {/* AI response */}
              {(turn.response || turn.error) && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] shrink-0">
                    <Sparkles className="h-4 w-4 text-[#C6F135]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Source pills */}
                    {turn.steps.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
                      >
                        {turn.steps.map((step, i) => (
                          <SourcePill key={i} tool={step.tool} result={step.result} />
                        ))}
                      </motion.div>
                    )}

                    {/* Error state */}
                    {turn.error && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[13px] text-red-600">{turn.error}</p>
                          <button
                            onClick={() => handleSearch(turn.query)}
                            className="text-[12px] font-medium text-[#737373] hover:text-[#111111] mt-1.5 transition-colors"
                          >
                            Try again
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Response text */}
                    {turn.response && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <TypewriterResponse text={turn.response} />

                        {/* Rich cards */}
                        {turn.cards.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="space-y-2"
                          >
                            {turn.cards.map((card, i) => (
                              <RichCardRenderer key={i} card={card} index={i} />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Timestamp */}
                    {(turn.response || turn.error) && (
                      <div className="pt-0.5">
                        <Timestamp ts={turn.timestamp + 1200} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Follow-up suggestion pills after this turn's response */}
              {turn.response && !isSearching && turn.id === turns[turns.length - 1]?.id && (() => {
                const dynamicSuggestions = turn.suggestions.length > 0
                  ? turn.suggestions.map((s) => ({ label: s.label, prompt: s.prompt }))
                  : FOLLOW_UPS.map((fu) => ({ label: fu, prompt: fu }));
                return (
                  <div className="pl-11">
                    <SuggestionPills
                      suggestions={dynamicSuggestions}
                      onSelect={(prompt) => handleSearch(prompt)}
                      disabled={isSearching}
                    />
                  </div>
                );
              })()}
            </motion.div>
          ))}

          {/* Invisible scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Input area -- pinned to bottom */}
        <div className="shrink-0 pb-4 pt-2">
          {/* New conversation button */}
          <AnimatePresence>
            {hasResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center mb-2"
              >
                <button
                  onClick={resetConversation}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#A3A3A3] hover:text-[#525252] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> New conversation
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={cn(
              "relative rounded-2xl border transition-all duration-300",
              isFocused
                ? "border-[#C6F135] shadow-[0_0_0_3px_rgba(198,241,53,0.15)]"
                : "border-[#EBEBEB] shadow-sm",
            )}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 text-[#C6F135] shrink-0" />
                </motion.div>
              ) : (
                <MessageSquare className="w-5 h-5 text-[#A3A3A3] shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={hasResults ? "Ask a follow-up..." : "Ask Scout anything about the network..."}
                disabled={isSearching}
                maxLength={MAX_CHARS}
                className="flex-1 bg-transparent text-[14px] font-medium text-[#111111] placeholder:text-[#A3A3A3] outline-none disabled:opacity-50"
                autoComplete="off"
              />
              <AnimatePresence>
                {query.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111111] text-[#C6F135] hover:bg-[#1a1a1a] disabled:opacity-20 transition-all duration-200 shrink-0"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-[#A3A3A3]">
            Scout searches only Antry platform data. No external browsing.
          </p>
        </div>
      </div>
    </section>
  );
});
