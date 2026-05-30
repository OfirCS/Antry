"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Clock, Cpu, Wand2 } from "lucide-react";

type Draft = {
  title: string;
  tagline: string;
  slug: string;
  category: string;
  difficulty: "intro" | "mid" | "senior" | "staff";
  time_cap_seconds: number;
  token_cap: number;
  allowed_tools: string[];
  prompt_md: string;
  rubric: { criterion: string; weight: number }[];
  ideal_fingerprint: Record<string, number>;
};

const DIFFICULTY_BG: Record<string, string> = {
  intro: "#A7F3D0",
  mid: "#3B82F6",
  senior: "#8B5CF6",
  staff: "#EC4899",
};

const DIFFICULTY_FG: Record<string, string> = {
  intro: "#0A0A0A",
  mid: "#FFFFFF",
  senior: "#FFFFFF",
  staff: "#FFFFFF",
};

export function BriefAuthorClient() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDraft = async () => {
    if (problem.trim().length < 10) return;
    setDrafting(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch("/api/briefs/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problem.trim() }),
      });
      const j = (await res.json()) as
        | { draft: Draft }
        | { error: string };
      if ("error" in j) setError(j.error);
      else setDraft(j.draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setDrafting(false);
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
          style={{ background: "#C6F135" }}
        />
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 pt-10 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2 text-[#0A0A0A]">
            <Sparkles className="w-3 h-3" />
            Brief Author
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            Describe it. Get a Brief.
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-gray-600">
            One sentence about what you want to test. Antry drafts a full
            Brief — rubric, caps, ideal Fingerprint — in 10 seconds.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 grid gap-6">
          {/* Input */}
          <div
            className="rounded-[14px] p-5"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2 block">
              Problem
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. We need someone who can ship a webhook receiver that handles retries idempotently under 300 events with concurrency."
              maxLength={600}
              rows={3}
              className="w-full px-3 py-2 text-[15px] leading-[1.5] outline-none resize-none rounded-[10px]"
              style={{
                background: "#FAFAF7",
                border: "1.5px solid #EBEBEB",
                color: "#0A0A0A",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#0A0A0A")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#EBEBEB")
              }
            />
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onDraft}
                disabled={drafting || problem.trim().length < 10}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                {drafting ? (
                  "Drafting…"
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Draft Brief
                  </>
                )}
              </button>
              <span className="text-[11px] text-gray-500">
                {problem.length}/600
              </span>
              {error && (
                <span className="text-[12px] text-red-600 font-semibold">
                  {error}
                </span>
              )}
            </div>
          </div>

          {/* Preview */}
          {draft && (
            <div
              className="rounded-[14px] p-6 relative"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px] rounded-t-[14px]"
                style={{ background: "#C6F135" }}
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
                Draft Preview
              </p>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                  style={{
                    background: DIFFICULTY_BG[draft.difficulty],
                    color: DIFFICULTY_FG[draft.difficulty],
                  }}
                >
                  {draft.difficulty}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                  {draft.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  /{draft.slug}
                </span>
              </div>
              <h2 className="text-[20px] font-bold tracking-[-0.015em] text-black leading-[1.15]">
                {draft.title}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-gray-600">
                {draft.tagline}
              </p>

              <div className="mt-4 flex items-center gap-4 flex-wrap text-[12px] text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {Math.round(draft.time_cap_seconds / 60)}m
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />
                  {(draft.token_cap / 1000).toFixed(0)}K
                </span>
                <span className="text-gray-500">
                  Tools: {draft.allowed_tools.join(", ")}
                </span>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-[12px] font-bold text-black inline-flex items-center gap-1">
                  Prompt + rubric
                </summary>
                <pre
                  className="mt-2 rounded-[10px] p-3 text-[12px] leading-[1.55] whitespace-pre-wrap font-mono"
                  style={{
                    background: "#FAFAF7",
                    border: "1px solid #EBEBEB",
                    color: "#0A0A0A",
                  }}
                >
                  {draft.prompt_md}
                </pre>
                <ul className="mt-2 space-y-1 text-[12px] text-gray-700">
                  {draft.rubric.map((r, i) => (
                    <li key={i} className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] text-gray-500">
                        {(r.weight * 100).toFixed(0)}%
                      </span>
                      <span>{r.criterion}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="mt-5 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => router.push("/hackathons/new")}
                  className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "#0A0A0A", color: "#FFFFFF" }}
                >
                  Bundle in a Hack
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold text-gray-600 hover:text-black transition-colors"
                >
                  Discard
                </button>
                <span className="text-[11px] text-gray-500 ml-auto">
                  Publish flow lands once /api/briefs/publish ships.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
