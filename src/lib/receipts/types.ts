// Antry Receipts — shared types

export type BriefStatus = "draft" | "live" | "closed";
export type BriefMode = "public" | "private";
export type BriefDifficulty = "intro" | "mid" | "senior" | "staff";
export type AttemptStatus =
  | "in_progress"
  | "completed"
  | "timed_out"
  | "budget_exceeded"
  | "abandoned";

export type FingerprintDimension =
  | "tokenEconomy"
  | "throughput"
  | "toolChoiceIQ"
  | "recoveryIndex"
  | "promptDiscipline"
  | "verificationRigor"
  | "spendVsJudgment";

export type Fingerprint = Record<FingerprintDimension, number>;

export const DIMENSION_LABELS: Record<FingerprintDimension, string> = {
  tokenEconomy: "Token Economy",
  throughput: "Throughput",
  toolChoiceIQ: "Tool-Choice IQ",
  recoveryIndex: "Recovery Index",
  promptDiscipline: "Prompt Discipline",
  verificationRigor: "Verification Rigor",
  spendVsJudgment: "Spend vs Judgment",
};

export const DIMENSION_SHORT: Record<FingerprintDimension, string> = {
  tokenEconomy: "Economy",
  throughput: "Speed",
  toolChoiceIQ: "Tool Taste",
  recoveryIndex: "Recovery",
  promptDiscipline: "Discipline",
  verificationRigor: "Rigor",
  spendVsJudgment: "Judgment",
};

export const DIMENSION_BLURB: Record<FingerprintDimension, string> = {
  tokenEconomy: "Output tokens per verified-correct unit of work. Lower = leaner.",
  throughput: "Wall-clock time to first verified-correct output. Punishes stalling.",
  toolChoiceIQ:
    "Share of work done by deterministic tools vs raw LLM generation. Senior engineers reach for grep before tokens.",
  recoveryIndex: "How well you pivot when stuck. Dead-ends followed by a passing solution = mature judgment.",
  promptDiscipline: "Instruction-block density per turn. Penalizes kitchen-sink prompting.",
  verificationRigor: "Self-check actions before declaring done. Tests, evals, second opinions.",
  spendVsJudgment:
    "When you spend tokens. Spend hard early then taper = high. Uniform spend until budget runs out = low.",
};

export const DIMENSION_ANTAGONIST: Record<FingerprintDimension, FingerprintDimension | null> = {
  tokenEconomy: "throughput",
  throughput: "tokenEconomy",
  toolChoiceIQ: "recoveryIndex",
  recoveryIndex: "toolChoiceIQ",
  promptDiscipline: "verificationRigor",
  verificationRigor: "promptDiscipline",
  spendVsJudgment: null,
};

export type ReceiptVisibility = "public" | "unlisted" | "private";
export type TraceVisibility = "public" | "redacted" | "company-only";

export type Brief = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  prompt_md: string;
  difficulty: BriefDifficulty;
  category: string;
  token_cap: number;
  time_cap_seconds: number;
  status: BriefStatus;
  mode: BriefMode;
  sponsor_label: string;
  attempts_count: number;
  receipts_count: number;
  median_score: number | null;
  created_at: string;
  closed_at: string | null;
  company: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    sponsor_color: string;
  };
  ideal_fingerprint?: Fingerprint;
  allowed_tools: string[];
  rubric_json: Record<string, unknown>;
};

export type Receipt = {
  id: string;
  brief_id: string;
  brief_slug: string;
  brief_title: string;
  builder: {
    username: string;
    name: string;
    gradient: string;
    avatar_url: string | null;
  };
  company: {
    slug: string;
    name: string;
    logo_url: string | null;
    sponsor_color: string;
  };
  fingerprint: Fingerprint;
  composite_score: number;
  trace_visibility: TraceVisibility;
  display_visibility: ReceiptVisibility;
  // Signature persisted at mint time. Verifier compares against this — never
  // re-signs and self-verifies. May be undefined for demo rows where the
  // signature is computed lazily.
  signature?: string;
  content_hash: string;
  signed_at: string;
  tokens_spent: number;
  cost_usd_cents: number;
  attempt_duration_seconds: number;
  highlights: string[];
};
