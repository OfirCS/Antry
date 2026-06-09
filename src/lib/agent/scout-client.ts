/**
 * Client-side Scout ranker.
 *
 * The production Scout (`/api/scout`) ranks Receipts with Claude Opus when
 * an ANTHROPIC_API_KEY is present, and falls back to a heuristic when it
 * isn't. On the static GitHub Pages build there is no server at all, so we
 * run a faithful version of that heuristic entirely in the browser — same
 * Receipt pool, same Fingerprint dimensions, real numbers in every
 * rationale. No network, no API key, no secrets.
 *
 * This keeps the public demo honest: it's the same proof-of-work data the
 * server would rank, scored against the query you type.
 */

import type { Fingerprint, FingerprintDimension } from "@/lib/receipts/types";

export type ScoutMatch = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  builder_gradient: string;
  composite_score: number;
  brief_title: string;
  rationale: string;
  fingerprint: Fingerprint;
};

type PoolItem = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  builder_gradient: string;
  composite_score: number;
  brief_title: string;
  brief_slug: string;
  highlights: string[];
  fingerprint: Fingerprint;
};

// Embedded Receipt pool — mirrors the public demo Receipts in
// src/lib/receipts/demo-data.ts. Kept as plain data (no crypto/footprint
// imports) so it bundles cleanly into the client.
const POOL: PoolItem[] = [
  {
    receipt_id: "rc_mara_anthropic_001",
    builder_username: "mara-chen",
    builder_name: "Mara Chen",
    builder_gradient: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
    composite_score: 87,
    brief_title: "Streaming RAG with citation discipline",
    brief_slug: "streaming-rag-pipeline",
    highlights: [
      "Used file_search 14× before any LLM call — let the corpus do the work.",
      "All 12 hold-out queries cited correctly; one self-corrected after a judge: call.",
      "Spent 70% of token budget in first third of attempt, then converged.",
    ],
    fingerprint: {
      tokenEconomy: 91,
      throughput: 79,
      toolChoiceIQ: 88,
      recoveryIndex: 73,
      promptDiscipline: 86,
      verificationRigor: 92,
      spendVsJudgment: 90,
    },
  },
  {
    receipt_id: "rc_sofia_anthropic_001",
    builder_username: "sofia-rivera",
    builder_name: "Sofia Rivera",
    builder_gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    composite_score: 81,
    brief_title: "Streaming RAG with citation discipline",
    brief_slug: "streaming-rag-pipeline",
    highlights: [
      "First-token latency 380ms — well under the 600ms budget.",
      "Two retracted plans, both followed by passing pivots.",
      "Streaming implementation passed every concurrent-request test.",
    ],
    fingerprint: {
      tokenEconomy: 82,
      throughput: 88,
      toolChoiceIQ: 75,
      recoveryIndex: 80,
      promptDiscipline: 78,
      verificationRigor: 85,
      spendVsJudgment: 81,
    },
  },
  {
    receipt_id: "rc_jake_vercel_001",
    builder_username: "jake-torres",
    builder_name: "Jake Torres",
    builder_gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
    composite_score: 84,
    brief_title: "Edge-deployed agent under 100ms cold start",
    brief_slug: "edge-agent-cold-start",
    highlights: [
      "Hit 78ms p95 cold start. Bundle 412KB.",
      "Picked WebStreams over Node streams immediately — tool taste paid off.",
      "Self-checked with code_run 4 times before declaring done.",
    ],
    fingerprint: {
      tokenEconomy: 94,
      throughput: 90,
      toolChoiceIQ: 80,
      recoveryIndex: 60,
      promptDiscipline: 92,
      verificationRigor: 78,
      spendVsJudgment: 88,
    },
  },
  {
    receipt_id: "rc_aisha_resend_001",
    builder_username: "aisha-patel",
    builder_name: "Aisha Patel",
    builder_gradient: "linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)",
    composite_score: 79,
    brief_title: "Transactional email engine with smart deliverability",
    brief_slug: "transactional-email-engine",
    highlights: [
      "Built bounce-handling state machine before touching the LLM.",
      "11/12 routing decisions correct on the hold-out set.",
      "Verified with judge: twice on edge cases.",
    ],
    fingerprint: {
      tokenEconomy: 76,
      throughput: 72,
      toolChoiceIQ: 84,
      recoveryIndex: 80,
      promptDiscipline: 82,
      verificationRigor: 90,
      spendVsJudgment: 78,
    },
  },
  {
    receipt_id: "rc_leo_supabase_001",
    builder_username: "leo-kim",
    builder_name: "Leo Kim",
    builder_gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    composite_score: 84,
    brief_title: "Realtime Postgres sync agent with conflict resolution",
    brief_slug: "realtime-postgres-sync",
    highlights: [
      "22/25 conflict scenarios converged correctly.",
      "Idempotency proved with 3 re-runs — same outcome each time.",
      "Used code_run for property-based testing.",
    ],
    fingerprint: {
      tokenEconomy: 88,
      throughput: 82,
      toolChoiceIQ: 90,
      recoveryIndex: 75,
      promptDiscipline: 86,
      verificationRigor: 88,
      spendVsJudgment: 85,
    },
  },
];

const DIMENSION_LABEL: Record<FingerprintDimension, string> = {
  tokenEconomy: "token economy",
  throughput: "throughput",
  toolChoiceIQ: "tool-choice IQ",
  recoveryIndex: "recovery index",
  promptDiscipline: "prompt discipline",
  verificationRigor: "verification rigor",
  spendVsJudgment: "spend-vs-judgment",
};

// Query phrases → Fingerprint dimension. When a phrase appears in the
// query, we boost candidates by that dimension's actual score.
const DIMENSION_KEYWORDS: Array<[FingerprintDimension, string[]]> = [
  ["verificationRigor", ["verif", "rigor", "correct", "test", "qa", "quality", "reliab", "no fabricat", "accura"]],
  ["tokenEconomy", ["token", "cost", "cheap", "budget", "efficien", "frugal", "lean"]],
  ["throughput", ["throughput", "fast", "latenc", "speed", "ship quick", "deadline", "under pressure", "quick"]],
  ["toolChoiceIQ", ["tool", "grep", "search", "taste", "reach for", "judgment", "pick the right"]],
  ["recoveryIndex", ["recover", "resilien", "debug", "self-correct", "pivot", "bounce back", "adapt"]],
  ["promptDiscipline", ["prompt", "discipline", "structured", "clean", "methodical", "rigorous prompt"]],
  ["spendVsJudgment", ["spend", "judgment", "roi", "value", "smart spend", "knows when"]],
];

// Topic phrases → brief slug. Lets "rag" match the streaming-RAG Receipt.
const TOPIC_KEYWORDS: Array<[string, string[]]> = [
  ["streaming-rag-pipeline", ["rag", "retrieval", "citation", "corpus", "streaming"]],
  ["edge-agent-cold-start", ["edge", "cold start", "cold-start", "bundle", "vercel", "routing", "serverless"]],
  ["transactional-email-engine", ["email", "deliverab", "bounce", "transactional", "resend"]],
  ["realtime-postgres-sync", ["postgres", "sql", "realtime", "conflict", "sync", "idempoten", "database", "data"]],
];

const SENIORITY_HINTS: Array<[number, string[]]> = [
  [88, ["staff", "principal", "lead", "expert", "10x", "best"]],
  [82, ["senior", "experienced"]],
  [70, ["mid", "intermediate", "junior", "early"]],
];

export type ScoutReasoning = {
  matchedDimensions: string[];
  matchedTopics: string[];
  steps: string[];
};

export type ScoutResult = {
  matches: ScoutMatch[];
  reasoning: ScoutReasoning;
  grader: "client-heuristic";
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Rank the Receipt pool against a natural-language query.
 *
 * Pure + synchronous. The caller adds an artificial delay so the UI can
 * animate a "thinking" trace — the work itself is instant.
 */
export function rankScout(rawQuery: string): ScoutResult {
  const q = rawQuery.toLowerCase();

  const matchedDims = DIMENSION_KEYWORDS.filter(([, kws]) =>
    kws.some((k) => q.includes(k))
  ).map(([dim]) => dim);

  const matchedTopics = TOPIC_KEYWORDS.filter(([, kws]) =>
    kws.some((k) => q.includes(k))
  ).map(([slug]) => slug);

  const seniorityFloor =
    SENIORITY_HINTS.find(([, kws]) => kws.some((k) => q.includes(k)))?.[0] ?? 0;

  const scored = POOL.map((p) => {
    // Base: the Receipt's own composite, normalized to 0–1.
    let score = p.composite_score;

    // Dimension fit: average the candidate's actual scores on the
    // dimensions the query cares about, weighted heavily.
    if (matchedDims.length > 0) {
      const dimAvg =
        matchedDims.reduce((s, d) => s + p.fingerprint[d], 0) /
        matchedDims.length;
      score += (dimAvg - 70) * 0.6; // reward above-baseline dimension strength
    }

    // Topic fit: a direct hit on what they're building is a strong signal.
    if (matchedTopics.includes(p.brief_slug)) {
      score += 14;
    }

    // Seniority floor: candidates below the implied bar get nudged down.
    if (seniorityFloor > 0 && p.composite_score < seniorityFloor) {
      score -= 6;
    }

    return { p, score };
  }).sort((a, b) => b.score - a.score);

  const matches: ScoutMatch[] = scored.slice(0, 5).map(({ p }) => ({
    receipt_id: p.receipt_id,
    builder_username: p.builder_username,
    builder_name: p.builder_name,
    builder_gradient: p.builder_gradient,
    composite_score: p.composite_score,
    brief_title: p.brief_title,
    fingerprint: p.fingerprint,
    rationale: buildRationale(p, matchedDims, matchedTopics),
  }));

  const steps: string[] = [];
  steps.push(`Parsed query → ${rawQuery.trim().split(/\s+/).length} tokens`);
  steps.push(
    matchedDims.length
      ? `Weighting on: ${matchedDims.map((d) => DIMENSION_LABEL[d]).join(", ")}`
      : "No specific dimension emphasis — ranking on composite + fit"
  );
  if (matchedTopics.length) {
    steps.push(
      `Topic match: ${matchedTopics.length} Brief${matchedTopics.length > 1 ? "s" : ""} in scope`
    );
  }
  if (seniorityFloor > 0) {
    steps.push(`Seniority floor applied: composite ≥ ${seniorityFloor}`);
  }
  steps.push(`Scored ${POOL.length} signed Receipts → top ${matches.length}`);

  return {
    matches,
    reasoning: {
      matchedDimensions: matchedDims.map((d) => DIMENSION_LABEL[d]),
      matchedTopics,
      steps,
    },
    grader: "client-heuristic",
  };
}

function buildRationale(
  p: PoolItem,
  matchedDims: FingerprintDimension[],
  matchedTopics: string[],
): string {
  const parts: string[] = [];

  // Lead with the strongest matched dimension referencing the real number.
  const dimsByStrength = [...matchedDims].sort(
    (a, b) => p.fingerprint[b] - p.fingerprint[a]
  );
  const lead = dimsByStrength[0];
  if (lead) {
    parts.push(
      `${p.fingerprint[lead]} on ${DIMENSION_LABEL[lead]} — ${
        p.fingerprint[lead] >= 88
          ? "top-tier"
          : p.fingerprint[lead] >= 80
            ? "strong"
            : "solid"
      } for what you described.`
    );
  } else {
    // Fall back to the candidate's own standout dimension.
    const standout = (Object.keys(p.fingerprint) as FingerprintDimension[]).sort(
      (a, b) => p.fingerprint[b] - p.fingerprint[a]
    )[0];
    parts.push(
      `${p.composite_score}/100 composite, peaking at ${p.fingerprint[standout]} ${DIMENSION_LABEL[standout]}.`
    );
  }

  if (matchedTopics.includes(p.brief_slug)) {
    parts.push(`Proven on exactly this: ${p.brief_title}.`);
  } else {
    parts.push(`Shipped: ${p.brief_title}.`);
  }

  // One concrete highlight from the signed trace.
  if (p.highlights[0]) parts.push(p.highlights[0]);

  return parts.join(" ");
}

export { round1 };
