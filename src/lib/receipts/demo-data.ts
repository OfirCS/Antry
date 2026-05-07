// Demo seed data for Antry Receipts.
//
// Used as a fallback when Supabase is empty (mirrors the existing
// mock-data.ts pattern in src/lib/mock-data.ts). When real data lands,
// this file becomes a presentation/marketing fixture for screenshots
// and reference content.

import type { Brief, Fingerprint, Receipt } from "./types";
import { signReceipt, type CanonicalReceipt } from "./sign";
import { footprintFromReceiptSummary } from "./compute-footprint";

export const demoCompanies = {
  anthropic: {
    id: "co_anthropic",
    slug: "anthropic",
    name: "Anthropic",
    logo_url: null,
    sponsor_color: "#D97757",
  },
  vercel: {
    id: "co_vercel",
    slug: "vercel",
    name: "Vercel",
    logo_url: null,
    sponsor_color: "#000000",
  },
  resend: {
    id: "co_resend",
    slug: "resend",
    name: "Resend",
    logo_url: null,
    sponsor_color: "#1E1E1E",
  },
  supabase: {
    id: "co_supabase",
    slug: "supabase",
    name: "Supabase",
    logo_url: null,
    sponsor_color: "#3ECF8E",
  },
} as const;

const fp = (f: Partial<Fingerprint>): Fingerprint => ({
  tokenEconomy: 70,
  throughput: 70,
  toolChoiceIQ: 70,
  recoveryIndex: 70,
  promptDiscipline: 70,
  verificationRigor: 70,
  spendVsJudgment: 70,
  ...f,
});

export const demoBriefs: Brief[] = [
  {
    id: "br_streaming_rag",
    slug: "streaming-rag-pipeline",
    title: "Streaming RAG with citation discipline",
    tagline:
      "Build a RAG pipeline that streams responses while maintaining citation accuracy. Production constraints, real corpus.",
    prompt_md: `# Streaming RAG Pipeline

You're building a customer-support RAG system for a SaaS company.

**Constraints**
- Stream responses token-by-token to the client.
- Every factual claim must cite a source from the provided corpus.
- Token budget: **8,000 output tokens** per query.
- Latency budget: **first token in <600ms**.

**Corpus**
~2,400 docs (provided as JSON). Mix of marketing, docs, and changelog.

**Success rubric**
1. Streams correctly to client.
2. All factual claims cited.
3. Doesn't fabricate citations.
4. Hold-out test: 12 unseen queries, 80% must score "accurate" by judge model.

**You may use**
- file_search (deterministic over the corpus)
- code_run (Python sandbox)
- judge: (request a second-opinion eval)

What you produce: a runnable agent loop + an explanation of your token-economy choices.`,
    difficulty: "senior",
    category: "ai-agents",
    token_cap: 50000,
    time_cap_seconds: 5400,
    status: "live",
    mode: "public",
    sponsor_label: "ANTHROPIC BRIEF · 001",
    attempts_count: 47,
    receipts_count: 23,
    median_score: 68,
    created_at: "2026-04-22T10:00:00Z",
    closed_at: null,
    company: demoCompanies.anthropic,
    ideal_fingerprint: fp({
      tokenEconomy: 88,
      throughput: 78,
      toolChoiceIQ: 85,
      recoveryIndex: 70,
      promptDiscipline: 82,
      verificationRigor: 90,
      spendVsJudgment: 87,
    }),
    allowed_tools: ["file_search", "code_run", "judge"],
    rubric_json: {
      streams_correctly: 0.2,
      cites_sources: 0.3,
      no_fabrication: 0.25,
      hold_out_pass_rate: 0.25,
    },
  },
  {
    id: "br_edge_compute",
    slug: "edge-agent-cold-start",
    title: "Edge-deployed agent under 100ms cold start",
    tagline:
      "Deploy an LLM-powered routing agent on Vercel Edge with strict cold-start and bundle-size budgets.",
    prompt_md: `# Edge Agent · Cold Start Budget

Deploy an agent that classifies incoming support requests into 8 categories
and either auto-replies or routes to a human.

**Constraints**
- Vercel Edge runtime (no Node APIs).
- Cold start <100ms p95.
- Bundle <450KB.
- Token budget: 2,000 output tokens per request.

**Success rubric**
1. Deploys cleanly to a real Vercel project.
2. Cold start under budget on real measurements.
3. 90% routing accuracy on the hold-out set (50 examples).
4. Cost under $0.002/request at p50.

**Allowed tools** code_run, file_search.`,
    difficulty: "staff",
    category: "ai-agents",
    token_cap: 30000,
    time_cap_seconds: 4200,
    status: "live",
    mode: "public",
    sponsor_label: "VERCEL BRIEF · 001",
    attempts_count: 31,
    receipts_count: 14,
    median_score: 71,
    created_at: "2026-04-29T09:00:00Z",
    closed_at: null,
    company: demoCompanies.vercel,
    ideal_fingerprint: fp({
      tokenEconomy: 92,
      throughput: 88,
      toolChoiceIQ: 78,
      recoveryIndex: 65,
      promptDiscipline: 90,
      verificationRigor: 80,
      spendVsJudgment: 85,
    }),
    allowed_tools: ["code_run", "file_search"],
    rubric_json: {},
  },
  {
    id: "br_email_engine",
    slug: "transactional-email-engine",
    title: "Transactional email engine with smart deliverability",
    tagline:
      "Build an email orchestration agent that picks templates, schedules sends, and adapts to bounce signals.",
    prompt_md: `# Transactional Email Engine

Build an agent that orchestrates transactional email for a B2B SaaS.

**What it does**
- Receives an event (signup, payment, churn-risk).
- Picks a template, personalizes it, schedules send time per recipient timezone.
- Reacts to bounce/complaint signals — pauses sends, escalates.

**Constraints**
- Token budget: 5,000 output tokens per event.
- Deliverability rules: warm-up curves, list hygiene.
- Use Resend SDK calls (mocked here).

**Success rubric**
- 12 event scenarios, agent must produce correct routing decisions in 11.
- Bounce-handling logic must be visible in trace.

**Allowed tools** file_search, code_run, judge.`,
    difficulty: "mid",
    category: "ai-agents",
    token_cap: 25000,
    time_cap_seconds: 3600,
    status: "live",
    mode: "public",
    sponsor_label: "RESEND BRIEF · 001",
    attempts_count: 19,
    receipts_count: 8,
    median_score: 64,
    created_at: "2026-05-02T14:00:00Z",
    closed_at: null,
    company: demoCompanies.resend,
    ideal_fingerprint: fp({
      tokenEconomy: 78,
      throughput: 72,
      toolChoiceIQ: 82,
      recoveryIndex: 75,
      promptDiscipline: 85,
      verificationRigor: 88,
      spendVsJudgment: 80,
    }),
    allowed_tools: ["file_search", "code_run", "judge"],
    rubric_json: {},
  },
  {
    id: "br_realtime_sync",
    slug: "realtime-postgres-sync",
    title: "Realtime Postgres sync agent with conflict resolution",
    tagline:
      "Design an agent that resolves write conflicts in a multi-region Postgres setup using Supabase Realtime.",
    prompt_md: `# Realtime Postgres Sync

Multi-region Supabase setup. You design the conflict-resolution agent
for write conflicts during region failover.

**Constraints**
- Latency: 95p resolution under 200ms.
- Token budget: 3,000 output tokens per conflict.
- Must be idempotent (re-running produces same outcome).

**Success rubric**
- 25 conflict scenarios, agent must converge correctly on 22.
- No stale-write retention.

**Allowed tools** code_run, file_search.`,
    difficulty: "senior",
    category: "data-ml",
    token_cap: 20000,
    time_cap_seconds: 3600,
    status: "live",
    mode: "public",
    sponsor_label: "SUPABASE BRIEF · 001",
    attempts_count: 12,
    receipts_count: 5,
    median_score: 72,
    created_at: "2026-05-04T11:00:00Z",
    closed_at: null,
    company: demoCompanies.supabase,
    ideal_fingerprint: fp({
      tokenEconomy: 90,
      throughput: 85,
      toolChoiceIQ: 92,
      recoveryIndex: 70,
      promptDiscipline: 88,
      verificationRigor: 85,
      spendVsJudgment: 82,
    }),
    allowed_tools: ["code_run", "file_search"],
    rubric_json: {},
  },

  // ── Six additional Briefs (the 10-Brief catalog) ──────────────
  // Designed to span intro→staff difficulty across categories that
  // matter for hiring evaluation. Each one has a tight rubric that
  // can be auto-graded by the Agent-as-Judge against the candidate's
  // signed trace.

  {
    id: "br_idempotent_webhook",
    slug: "idempotent-webhook-processor",
    title: "Idempotent webhook processor",
    tagline:
      "Process Stripe-style webhooks with retry-safe writes. No duplicates, no lost events, even under network partitions.",
    prompt_md: `# Idempotent Webhook Processor

You receive webhooks from a payments provider. The provider retries
on any non-2xx response (and sometimes on 2xx too — networks lie).
Your handler **must be idempotent**: replaying the same event must
not double-charge, double-refund, or duplicate a row.

**Provided**
- A mock provider that fires 300 events with ~12% retry duplicates.
- A Postgres connection (\`pg\` is in scope).
- A failing test suite that asserts: (a) every event processed exactly
  once, (b) handler returns 200 within 500ms p95, (c) DB has no
  duplicate rows.

**Success rubric**
1. All tests pass.
2. Handler uses the event \`id\` as the idempotency key — not a hash
   of the payload (payloads can change on retry).
3. Race-condition safe: 50 concurrent retries of the same event
   land exactly one row.

**Allowed tools** code_run, file_search.`,
    difficulty: "mid",
    category: "tools",
    token_cap: 18000,
    time_cap_seconds: 3000,
    status: "live",
    mode: "public",
    sponsor_label: "ANTRY OPEN BRIEF · 001",
    attempts_count: 47,
    receipts_count: 22,
    median_score: 68,
    created_at: "2026-05-05T10:00:00Z",
    closed_at: null,
    company: demoCompanies.anthropic,
    ideal_fingerprint: fp({
      tokenEconomy: 85,
      throughput: 78,
      toolChoiceIQ: 88,
      recoveryIndex: 80,
      promptDiscipline: 82,
      verificationRigor: 92,
      spendVsJudgment: 78,
    }),
    allowed_tools: ["code_run", "file_search"],
    rubric_json: {
      tests_pass: { weight: 0.5 },
      uses_event_id_key: { weight: 0.25 },
      race_safe: { weight: 0.25 },
    },
  },
  {
    id: "br_token_compressor",
    slug: "prompt-compressor-budget",
    title: "Token-budget-aware prompt compressor",
    tagline:
      "Given a 40K-token context, hit a 6K target without losing the load-bearing facts. Hold-out judge tests recall.",
    prompt_md: `# Prompt Compressor under Budget

You're given a 40K-token research context and a 6K output budget.
Compress the context so a downstream agent can answer 25 hidden
questions about it correctly.

**Constraints**
- Output ≤ 6,000 tokens.
- No external lookups — work from the provided context only.
- Recall is what matters; conciseness is the constraint, not the goal.

**Success rubric**
1. Output under budget (hard fail otherwise).
2. Hold-out: 25 questions, judge model must score ≥20 correct from
   compressed context alone.
3. The compression strategy is visible in the trace (we read the
   prompts, not just the output).

**Allowed tools** file_search, judge.`,
    difficulty: "senior",
    category: "ai-agents",
    token_cap: 16000,
    time_cap_seconds: 3600,
    status: "live",
    mode: "public",
    sponsor_label: "ANTRY OPEN BRIEF · 002",
    attempts_count: 22,
    receipts_count: 9,
    median_score: 71,
    created_at: "2026-05-04T15:00:00Z",
    closed_at: null,
    company: demoCompanies.anthropic,
    ideal_fingerprint: fp({
      tokenEconomy: 95,
      throughput: 70,
      toolChoiceIQ: 82,
      recoveryIndex: 75,
      promptDiscipline: 92,
      verificationRigor: 78,
      spendVsJudgment: 88,
    }),
    allowed_tools: ["file_search", "judge"],
    rubric_json: {
      under_budget: { weight: 0.3 },
      recall_score: { weight: 0.6 },
      strategy_visible: { weight: 0.1 },
    },
  },
  {
    id: "br_typed_extractor",
    slug: "typed-extractor-validation",
    title: "Typed extractor with strict validation",
    tagline:
      "Extract structured data from messy resumes. Reject invalid records, never hallucinate fields. Schema-strict output.",
    prompt_md: `# Typed Resume Extractor

Extract candidate records from 200 raw resume PDFs. Output must
conform to the provided JSON schema. Invalid records should be
**rejected**, not coerced.

**Schema (excerpt)**
\`\`\`
{
  full_name: string,
  primary_email: string (valid email),
  total_experience_years: number (>= 0),
  past_employers: [{ name: string, title: string, years: number }],
  is_authorized_to_work_us: boolean | null
}
\`\`\`

**Constraints**
- 200 PDFs in \`/inputs\`.
- Output: one JSON line per valid record.
- A separate \`rejects.jsonl\` with reason per rejected resume.

**Success rubric**
1. Zero hallucinated fields (judge audits 25 random records).
2. Invalid PDFs (corrupt, unreadable) all in \`rejects.jsonl\`.
3. Schema-validates 100% of accepted records.

**Allowed tools** code_run, file_search.`,
    difficulty: "mid",
    category: "data-ml",
    token_cap: 35000,
    time_cap_seconds: 4200,
    status: "live",
    mode: "public",
    sponsor_label: "ANTRY OPEN BRIEF · 003",
    attempts_count: 38,
    receipts_count: 15,
    median_score: 66,
    created_at: "2026-05-03T12:00:00Z",
    closed_at: null,
    company: demoCompanies.anthropic,
    ideal_fingerprint: fp({
      tokenEconomy: 80,
      throughput: 72,
      toolChoiceIQ: 90,
      recoveryIndex: 70,
      promptDiscipline: 85,
      verificationRigor: 95,
      spendVsJudgment: 78,
    }),
    allowed_tools: ["code_run", "file_search", "judge"],
    rubric_json: {
      zero_hallucination: { weight: 0.5 },
      reject_handling: { weight: 0.25 },
      schema_validation: { weight: 0.25 },
    },
  },
  {
    id: "br_bug_repro_fix",
    slug: "bug-fix-from-failing-test",
    title: "Bug fix from minimal repro",
    tagline:
      "Failing test + buggy code. Find the bug, fix it, all tests green. Don't add features. Don't refactor for fun.",
    prompt_md: `# Bug Fix from Repro

A user reported a bug. We've reduced it to one failing test.
The repo has 120 tests; 119 pass, 1 fails. **Fix only the bug.**

**Constraints**
- Don't add new abstractions or refactor unrelated code.
- All 120 tests must pass after your fix.
- Add at least one regression test that would have caught this bug.

**What we measure**
- **Diff size**: minimal change wins. Senior engineers fix bugs;
  juniors rewrite the function.
- **Tool-Choice IQ**: how much grep/read vs how much LLM-write.
  Reading the code first is rewarded.
- **Recovery Index**: did you back out a wrong hypothesis cleanly,
  or did you pile on?

**Allowed tools** code_run, file_search.`,
    difficulty: "intro",
    category: "tools",
    token_cap: 12000,
    time_cap_seconds: 2400,
    status: "live",
    mode: "public",
    sponsor_label: "ANTRY OPEN BRIEF · 004",
    attempts_count: 73,
    receipts_count: 41,
    median_score: 62,
    created_at: "2026-05-02T08:00:00Z",
    closed_at: null,
    company: demoCompanies.anthropic,
    ideal_fingerprint: fp({
      tokenEconomy: 88,
      throughput: 80,
      toolChoiceIQ: 92,
      recoveryIndex: 88,
      promptDiscipline: 78,
      verificationRigor: 85,
      spendVsJudgment: 82,
    }),
    allowed_tools: ["code_run", "file_search"],
    rubric_json: {
      tests_pass: { weight: 0.4 },
      diff_minimality: { weight: 0.3 },
      regression_test_added: { weight: 0.3 },
    },
  },
  {
    id: "br_sql_optimizer",
    slug: "sql-query-optimizer",
    title: "SQL query optimizer",
    tagline:
      "Slow query, real schema, real EXPLAIN. Get the plan from sequential-scan to index-scan without breaking semantics.",
    prompt_md: `# SQL Query Optimizer

Production query taking 8.2s p95. Schema and ten million rows of
data are provided. Your job: get it under 200ms p95 without
changing the result set.

**Provided**
- A 12-table schema (orders, line_items, refunds, customers, …).
- 10M-row dataset.
- The slow query.
- A correctness oracle that runs your query and the original side
  by side.

**Success rubric**
1. Result set identical to the original (oracle passes).
2. p95 under 200ms across 50 trial runs.
3. Your trace shows you read the EXPLAIN before changing the query.
   We're not just looking for the right index — we want to see the
   diagnosis.

**Allowed tools** code_run, file_search.`,
    difficulty: "senior",
    category: "data-ml",
    token_cap: 18000,
    time_cap_seconds: 3000,
    status: "live",
    mode: "public",
    sponsor_label: "SUPABASE BRIEF · 002",
    attempts_count: 14,
    receipts_count: 6,
    median_score: 74,
    created_at: "2026-05-04T16:00:00Z",
    closed_at: null,
    company: demoCompanies.supabase,
    ideal_fingerprint: fp({
      tokenEconomy: 90,
      throughput: 80,
      toolChoiceIQ: 95,
      recoveryIndex: 78,
      promptDiscipline: 88,
      verificationRigor: 90,
      spendVsJudgment: 85,
    }),
    allowed_tools: ["code_run", "file_search"],
    rubric_json: {
      correctness: { weight: 0.4 },
      latency_target: { weight: 0.4 },
      diagnosis_visible: { weight: 0.2 },
    },
  },
  {
    id: "br_multistep_agent",
    slug: "multistep-tool-agent-budget",
    title: "Multi-step tool agent under token budget",
    tagline:
      "Given search/fetch/summarize tools, answer 20 research questions under a 4K-token budget per question. Mature spend curve required.",
    prompt_md: `# Multi-step Tool Agent

You're handed three tools — \`search(q)\`, \`fetch(url)\`,
\`summarize(text)\` — and 20 research questions. Each question must
be answered using only these tools and a 4,000-token output budget.

**The catch**
We score not just whether you got the right answer, but **how
your spend curve looks**:
- Spend hard early (broad search), taper to verification → high
  Spend-vs-Judgment score.
- Uniform spend until budget runs out → low score.

**Success rubric**
1. ≥17 of 20 answers correct (judge-graded).
2. Mean output tokens per question ≤ 4,000.
3. Spend-vs-Judgment dimension ≥ 80 in the Fingerprint.

**Allowed tools** search, fetch, summarize.`,
    difficulty: "senior",
    category: "ai-agents",
    token_cap: 90000,
    time_cap_seconds: 5400,
    status: "live",
    mode: "public",
    sponsor_label: "ANTHROPIC BRIEF · 002",
    attempts_count: 28,
    receipts_count: 11,
    median_score: 69,
    created_at: "2026-05-01T13:00:00Z",
    closed_at: null,
    company: demoCompanies.anthropic,
    ideal_fingerprint: fp({
      tokenEconomy: 92,
      throughput: 75,
      toolChoiceIQ: 88,
      recoveryIndex: 72,
      promptDiscipline: 90,
      verificationRigor: 85,
      spendVsJudgment: 95,
    }),
    allowed_tools: ["search", "fetch", "summarize", "judge"],
    rubric_json: {
      accuracy: { weight: 0.5 },
      under_budget: { weight: 0.25 },
      spend_curve: { weight: 0.25 },
    },
  },
];

const builderProfiles = {
  mara: {
    username: "mara-chen",
    name: "Mara Chen",
    gradient: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
    avatar_url: null,
  },
  jake: {
    username: "jake-torres",
    name: "Jake Torres",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
    avatar_url: null,
  },
  aisha: {
    username: "aisha-patel",
    name: "Aisha Patel",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)",
    avatar_url: null,
  },
  leo: {
    username: "leo-kim",
    name: "Leo Kim",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    avatar_url: null,
  },
  sofia: {
    username: "sofia-rivera",
    name: "Sofia Rivera",
    gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    avatar_url: null,
  },
} as const;

export const demoReceipts: Receipt[] = [
  {
    id: "rc_mara_anthropic_001",
    brief_id: "br_streaming_rag",
    brief_slug: "streaming-rag-pipeline",
    brief_title: "Streaming RAG with citation discipline",
    builder: builderProfiles.mara,
    company: demoCompanies.anthropic,
    fingerprint: fp({
      tokenEconomy: 91,
      throughput: 79,
      toolChoiceIQ: 88,
      recoveryIndex: 73,
      promptDiscipline: 86,
      verificationRigor: 92,
      spendVsJudgment: 90,
    }),
    composite_score: 87,
    trace_visibility: "public",
    display_visibility: "public",
    content_hash: "sha256:7f3c1a2b8e4d5f6a9c0d1e2f3a4b5c6d",
    signed_at: "2026-04-25T14:32:00Z",
    tokens_spent: 6420,
    cost_usd_cents: 18,
    attempt_duration_seconds: 1842,
    highlights: [
      "Used file_search 14× before any LLM call — let the corpus do the work.",
      "All 12 hold-out queries cited correctly; one self-corrected after a judge: call.",
      "Spent 70% of token budget in first third of attempt, then converged.",
    ],
  },
  {
    id: "rc_sofia_anthropic_001",
    brief_id: "br_streaming_rag",
    brief_slug: "streaming-rag-pipeline",
    brief_title: "Streaming RAG with citation discipline",
    builder: builderProfiles.sofia,
    company: demoCompanies.anthropic,
    fingerprint: fp({
      tokenEconomy: 82,
      throughput: 88,
      toolChoiceIQ: 75,
      recoveryIndex: 80,
      promptDiscipline: 78,
      verificationRigor: 85,
      spendVsJudgment: 81,
    }),
    composite_score: 81,
    trace_visibility: "public",
    display_visibility: "public",
    content_hash: "sha256:8e4d5f6a9c0d1e2f3a4b5c6d7f3c1a2b",
    signed_at: "2026-04-26T09:18:00Z",
    tokens_spent: 7280,
    cost_usd_cents: 21,
    attempt_duration_seconds: 1402,
    highlights: [
      "First-token latency 380ms — well under the 600ms budget.",
      "Two retracted plans, both followed by passing pivots.",
      "Streaming implementation passed every concurrent-request test.",
    ],
  },
  {
    id: "rc_jake_vercel_001",
    brief_id: "br_edge_compute",
    brief_slug: "edge-agent-cold-start",
    brief_title: "Edge-deployed agent under 100ms cold start",
    builder: builderProfiles.jake,
    company: demoCompanies.vercel,
    fingerprint: fp({
      tokenEconomy: 94,
      throughput: 90,
      toolChoiceIQ: 80,
      recoveryIndex: 60,
      promptDiscipline: 92,
      verificationRigor: 78,
      spendVsJudgment: 88,
    }),
    composite_score: 84,
    trace_visibility: "public",
    display_visibility: "public",
    content_hash: "sha256:9c0d1e2f3a4b5c6d7f3c1a2b8e4d5f6a",
    signed_at: "2026-05-01T17:44:00Z",
    tokens_spent: 4180,
    cost_usd_cents: 12,
    attempt_duration_seconds: 2200,
    highlights: [
      "Hit 78ms p95 cold start. Bundle 412KB.",
      "Picked WebStreams over Node streams immediately — tool taste paid off.",
      "Self-checked with code_run 4 times before declaring done.",
    ],
  },
  {
    id: "rc_aisha_resend_001",
    brief_id: "br_email_engine",
    brief_slug: "transactional-email-engine",
    brief_title: "Transactional email engine with smart deliverability",
    builder: builderProfiles.aisha,
    company: demoCompanies.resend,
    fingerprint: fp({
      tokenEconomy: 76,
      throughput: 72,
      toolChoiceIQ: 84,
      recoveryIndex: 80,
      promptDiscipline: 82,
      verificationRigor: 90,
      spendVsJudgment: 78,
    }),
    composite_score: 79,
    trace_visibility: "public",
    display_visibility: "public",
    content_hash: "sha256:1e2f3a4b5c6d7f3c1a2b8e4d5f6a9c0d",
    signed_at: "2026-05-04T11:22:00Z",
    tokens_spent: 4960,
    cost_usd_cents: 14,
    attempt_duration_seconds: 1980,
    highlights: [
      "Built bounce-handling state machine before touching the LLM.",
      "11/12 routing decisions correct on the hold-out set.",
      "Verified with judge: twice on edge cases.",
    ],
  },
  {
    id: "rc_leo_supabase_001",
    brief_id: "br_realtime_sync",
    brief_slug: "realtime-postgres-sync",
    brief_title: "Realtime Postgres sync agent with conflict resolution",
    builder: builderProfiles.leo,
    company: demoCompanies.supabase,
    fingerprint: fp({
      tokenEconomy: 88,
      throughput: 82,
      toolChoiceIQ: 90,
      recoveryIndex: 75,
      promptDiscipline: 86,
      verificationRigor: 88,
      spendVsJudgment: 85,
    }),
    composite_score: 84,
    trace_visibility: "public",
    display_visibility: "public",
    content_hash: "sha256:3a4b5c6d7f3c1a2b8e4d5f6a9c0d1e2f",
    signed_at: "2026-05-05T16:08:00Z",
    tokens_spent: 3520,
    cost_usd_cents: 10,
    attempt_duration_seconds: 1820,
    highlights: [
      "22/25 conflict scenarios converged correctly.",
      "Idempotency proved with 3 re-runs — same outcome each time.",
      "Used code_run for property-based testing.",
    ],
  },
];

export function getDemoBrief(slug: string): Brief | null {
  return demoBriefs.find((b) => b.slug === slug) ?? null;
}

// Compute a footprint for each demo receipt at module load so the Receipt
// page renders the energy/CO2/LOC numbers without needing per-call telemetry.
const RECEIPTS_WITH_FOOTPRINT: Receipt[] = demoReceipts.map((r) => ({
  ...r,
  compute_footprint: footprintFromReceiptSummary({
    tokens_spent: r.tokens_spent,
    attempt_duration_seconds: r.attempt_duration_seconds,
    cost_usd_cents: r.cost_usd_cents,
  }),
}));

export function getDemoReceiptsForBrief(briefId: string): Receipt[] {
  return RECEIPTS_WITH_FOOTPRINT.filter((r) => r.brief_id === briefId);
}

export function getDemoReceiptsForBuilder(username: string): Receipt[] {
  return RECEIPTS_WITH_FOOTPRINT.filter((r) => r.builder.username === username);
}

export function getDemoReceipt(id: string): Receipt | null {
  return RECEIPTS_WITH_FOOTPRINT.find((r) => r.id === id) ?? null;
}

/**
 * Signatures minted at module load — simulates the production flow where the
 * signature is computed once at mint time and stored on the row. The verifier
 * compares against this value rather than re-signing the live data, so mutating
 * any field after this point breaks the verification.
 *
 * In dev/preview the signing key is the documented fallback. In production
 * (RECEIPT_HMAC_SECRET set) these are signed with the real key.
 */
const STORED_SIGNATURES: ReadonlyMap<string, string> = new Map(
  demoReceipts.map((r) => {
    const canonical: CanonicalReceipt = {
      id: r.id,
      brief_id: r.brief_id,
      builder_id: r.builder.username,
      fingerprint: r.fingerprint as Record<string, number>,
      composite_score: r.composite_score,
      signed_at: r.signed_at,
    };
    return [r.id, signReceipt(canonical)] as const;
  })
);

export function getStoredReceiptSignature(id: string): string | undefined {
  return STORED_SIGNATURES.get(id);
}
