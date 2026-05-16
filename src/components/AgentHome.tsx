"use client";

import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Terminal, MessageSquare, ArrowUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentResponseBody, AgentSuggestion } from "@/lib/agent/types";

const MAX_CHARS = 320;

interface ConversationTurn {
  id: string;
  query: string;
  response: string | null;
  error: string | null;
  isLoading: boolean;
  timestamp: number;
  suggestions?: AgentSuggestion[];
}

function RenderLine({ line }: { line: string }) {
  if (line.trim() === "") return <br />;
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
      parts.push(<em key={key++} className="italic text-[#6B7280]">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  if (isListItem) {
    return (
      <div className="flex items-start gap-2 pl-1">
        <span className="mt-[7px] w-1 h-1 rounded-full bg-[#6B7280] shrink-0" />
        <p className="leading-relaxed">{parts}</p>
      </div>
    );
  }
  return <p className="leading-relaxed">{parts}</p>;
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#F3F4F6] shrink-0 border border-gray-200">
        <Loader2 className="h-3 w-3 text-[#111111] animate-spin" />
      </div>
      <div className="text-[12px] text-[#6B7280] font-mono">executing query...</div>
    </div>
  );
}

const WELCOME_TEXT = `Hey! I'm **Scout**, your guide to the Antry builder network.\n\nI can help you discover builders, explore projects, find hackathons, and assemble teams. What would you like to explore?`;

const DEFAULT_SUGGESTIONS: AgentSuggestion[] = [
  { label: "Find React Builders", prompt: "Find builders who know React" },
  { label: "Explore Projects", prompt: "Show me some trending projects" },
  { label: "Build a Team", prompt: "I want to build a team for a hackathon" },
];

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
  const hasResults = turns.length > 0;

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

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
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [turns, scrollToBottom]);

  const handleSearch = async (text?: string) => {
    const msg = (text || query).trim();
    if (!msg || isSearching) return;
    const turnId = Date.now().toString();
    const timestamp = Date.now();

    setTurns((prev) => [
      ...prev,
      { id: turnId, query: msg, response: null, error: null, isLoading: true, timestamp },
    ]);
    setQuery("");
    setIsSearching(true);

    try {
      const history = turns
        .filter((t) => t.response && t.response.trim().length > 0)
        .slice(-6)
        .flatMap((t) => [
          { role: "user" as const, content: t.query.slice(0, 320) },
          { role: "assistant" as const, content: (t.response || "ok").slice(0, 320) },
        ]);

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
          t.id === turnId ? { ...t, response: json.response, suggestions: json.suggestions, isLoading: false } : t
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

  useImperativeHandle(ref, () => ({
    triggerSearch: handleSearch,
    focusInput: () => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  }));

  return (
    <section className={cn("relative flex flex-col", embedded ? "h-[calc(100vh-200px)] min-h-[500px]" : "h-[calc(100vh-80px)] min-h-[600px]")}>
      <div className={cn("relative mx-auto flex flex-col flex-1 w-full", embedded ? "max-w-[1000px]" : "max-w-[720px]", "px-4 sm:px-6")}>
        <div className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-none">
          {!hasResults && (
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] bg-white shrink-0 shadow-sm">
                <Terminal className="h-4 w-4 text-[#111111]" />
              </div>
              <div className="text-[14px] text-[#4B5563] space-y-4">
                <div className="space-y-2">
                  {WELCOME_TEXT.split("\n").map((line, i) => (
                    <div key={i}><RenderLine line={line} /></div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {DEFAULT_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s.prompt)}
                      className="text-[12px] px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm font-medium"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {turns.map((turn) => (
            <div key={turn.id} className="space-y-6">
              <div className="flex items-start justify-end gap-3 pl-12">
                <div className="flex-1 min-w-0 bg-[#F3F4F6] text-[#111111] px-4 py-3 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed">
                  {turn.query}
                </div>
              </div>

              {turn.isLoading && !turn.response && !turn.error && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] bg-white shrink-0 shadow-sm">
                    <Terminal className="h-4 w-4 text-[#111111]" />
                  </div>
                  <ThinkingIndicator />
                </div>
              )}

              {(turn.response || turn.error) && (
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] bg-white shrink-0 shadow-sm">
                    <Terminal className="h-4 w-4 text-[#111111]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3 pt-1">
                    {turn.error && (
                      <div className="flex items-center gap-2 text-red-600 text-[13px]">
                        <AlertCircle className="w-4 h-4" /> {turn.error}
                      </div>
                    )}
                    {turn.response && (
                      <div className="text-[14px] text-[#374151] space-y-2">
                        {turn.response.split("\n").map((line, i) => (
                          <div key={i}><RenderLine line={line} /></div>
                        ))}
                      </div>
                    )}
                    {turn.suggestions && turn.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3">
                        {turn.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(s.prompt)}
                            className="text-[12px] px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm font-medium"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="shrink-0 pb-6 pt-2 bg-white">
          <AnimatePresence>
            {hasResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center mb-3"
              >
                <button
                  onClick={resetConversation}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Start over
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={cn(
              "relative rounded-xl border bg-white transition-all duration-200 flex items-center gap-3 px-4 py-3.5 shadow-sm",
              isFocused ? "border-black ring-1 ring-black/5" : "border-gray-200"
            )}
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin shrink-0" />
            ) : (
              <MessageSquare className="w-5 h-5 text-gray-400 shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask Scout anything..."
              disabled={isSearching}
              maxLength={MAX_CHARS}
              className="flex-1 bg-transparent text-[15px] text-[#111111] placeholder:text-gray-400 outline-none disabled:opacity-50"
              autoComplete="off"
            />
            {query.trim() && (
              <button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="flex h-8 w-8 items-center justify-center rounded bg-black text-white hover:bg-gray-800 disabled:opacity-20 transition-colors shrink-0"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});
