"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Telescope, ArrowUpRight, Bot } from "lucide-react";

type Match = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  composite_score: number;
  brief_title: string;
  rationale: string;
};

export function ScoutClient() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [grader, setGrader] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    if (query.trim().length < 10) return;
    setSearching(true);
    setError(null);
    setMatches(null);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const j = (await res.json()) as
        | { matches: Match[]; grader: string }
        | { error: string };
      if ("error" in j) setError(j.error);
      else {
        setMatches(j.matches);
        setGrader(j.grader);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#3B82F6" }}
        />
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 pt-10 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2 text-[#0A0A0A]">
            <Telescope className="w-3 h-3" />
            Scout
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            Who do you need?
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-gray-600">
            One sentence — JD, vibes, anything. Antry ranks Receipt-holders
            who fit, with rationale on every match.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 space-y-5">
          <div
            className="rounded-[14px] p-4"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 mt-3 ml-2 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !searching) onSearch();
                }}
                placeholder="Senior who can ship streaming RAG under deadline, strong on verification"
                maxLength={800}
                className="flex-1 px-2 h-11 text-[15px] outline-none bg-transparent text-black placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={onSearch}
                disabled={searching || query.trim().length < 10}
                className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                {searching ? "Scouting…" : "Find"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-600 font-semibold">{error}</p>
          )}

          {matches && matches.length === 0 && (
            <p className="text-[14px] text-gray-500">
              No matches in the current Receipt pool.
            </p>
          )}

          {matches && matches.length > 0 && (
            <>
              <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                <Bot className="w-3 h-3" />
                Ranked by{" "}
                <span className="font-mono text-black">
                  {grader === "heuristic"
                    ? "heuristic (set ANTHROPIC_API_KEY for real ranking)"
                    : grader}
                </span>
              </p>
              <ol className="space-y-2">
                {matches.map((m, i) => (
                  <li
                    key={m.receipt_id}
                    className="rounded-[14px] p-4 transition-colors hover:bg-[#FAFAF7]"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #EBEBEB",
                    }}
                  >
                    <div className="grid grid-cols-[32px_1fr_auto] items-center gap-3">
                      <div
                        className="font-display font-bold text-[18px] tabular-nums"
                        style={{
                          color: i === 0 ? "#3B82F6" : "#0A0A0A",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/u/${m.builder_username}`}
                          className="text-[14px] font-bold text-black hover:underline truncate inline-block"
                        >
                          {m.builder_name}
                        </Link>
                        <p className="text-[11px] text-gray-500">
                          {m.brief_title} · {m.composite_score}/100
                        </p>
                      </div>
                      <Link
                        href={`/receipts/${m.receipt_id}`}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-black hover:underline"
                      >
                        Receipt <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="mt-3 text-[13px] leading-[1.55] text-gray-700">
                      {m.rationale}
                    </p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
