// @antry/sdk — Antry Receipts client.
//
// Single tiny SDK that wraps /api/v1 for both companies and builders.
// Zero dependencies. Works in Node 22+, Deno, Bun, edge runtimes, and the
// browser. ~250 lines.
//
// import { Antry } from "@antry/sdk";
// const antry = new Antry({ apiKey: process.env.ANTRY_API_KEY });
// const briefs = await antry.briefs.list({ company: "anthropic" });
// const receipts = await antry.receipts.list({ company: "anthropic", min_score: 80 });
// const matches = await antry.candidates.search({ q: "fast at tool taste" });
// const verified = await antry.receipts.verify("rc_mara_anthropic_001");
//
// All methods return strongly-typed responses. Network errors throw
// `AntryError` with `status` + `code`. Successful responses are JSON.

export type AntryConfig = {
  /** Antry API key (`ant_live_...` or `ant_test_...`). Optional for public read endpoints. */
  apiKey?: string;
  /** Override the base URL. Defaults to https://antry.com */
  baseUrl?: string;
  /** Custom fetch implementation, for SSR / edge environments. */
  fetch?: typeof fetch;
  /** Per-request default timeout in ms. */
  timeoutMs?: number;
};

export class AntryError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AntryError";
  }
}

// ── Types ──────────────────────────────────────────────

export type Fingerprint = {
  tokenEconomy: number;
  throughput: number;
  toolChoiceIQ: number;
  recoveryIndex: number;
  promptDiscipline: number;
  verificationRigor: number;
  spendVsJudgment: number;
};

export type Brief = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  difficulty: "intro" | "mid" | "senior" | "staff";
  category: string;
  token_cap: number;
  time_cap_seconds: number;
  sponsor_label: string;
  company: { slug: string; name: string };
  attempts_count: number;
  receipts_count: number;
  median_score: number | null;
  allowed_tools: string[];
  created_at: string;
  url: string;
};

export type ComputeFootprintSummary = {
  total_tokens: number;
  lines_of_code: number;
  energy_kwh: number;
  co2_grams: number;
  wall_clock_seconds: number;
  cost_usd_cents: number;
};

export type ReceiptListItem = {
  id: string;
  composite_score: number;
  fingerprint: Fingerprint;
  builder: { username: string; name: string };
  brief: { id: string; slug: string; title: string };
  compute_footprint: ComputeFootprintSummary | null;
  tokens_spent: number;
  cost_usd_cents: number;
  attempt_duration_seconds: number;
  signed_at: string;
  url: string;
  verify_url: string;
};

export type CandidateMatch = {
  match_score: number;
  builder: { username: string; name: string };
  composite_score: number;
  fingerprint: Fingerprint;
  receipt_id: string;
  receipt_url: string;
  brief_title: string;
};

export type VerifyResponse = {
  ok: boolean;
  verified: boolean;
  reason?: string;
  receipt: {
    id: string;
    brief_id: string;
    builder_id: string;
    fingerprint: Fingerprint;
    composite_score: number;
    signed_at: string;
  };
  brief: { id: string; slug: string; title: string; company: string };
  fingerprint: Fingerprint;
  composite_score: number;
  signed_at: string;
  content_hash: string;
  computed_content_hash: string;
  signature: string;
  tokens_spent: number;
  cost_usd_cents: number;
  attempt_duration_seconds: number;
  issuer: "antry";
  verification_url: string;
};

// ── Client ─────────────────────────────────────────────

export class Antry {
  private apiKey?: string;
  private baseUrl: string;
  private fetchImpl: typeof fetch;
  private timeoutMs: number;

  constructor(cfg: AntryConfig = {}) {
    this.apiKey = cfg.apiKey;
    this.baseUrl = (cfg.baseUrl ?? "https://antry.com").replace(/\/$/, "");
    this.fetchImpl = cfg.fetch ?? globalThis.fetch;
    this.timeoutMs = cfg.timeoutMs ?? 15_000;
    if (!this.fetchImpl) {
      throw new AntryError(
        0,
        "no_fetch",
        "No fetch implementation. Pass `fetch` in config or use Node 22+."
      );
    }
  }

  private async request<T>(
    method: string,
    path: string,
    opts: { body?: unknown; query?: Record<string, string | number | undefined> } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "antry-sdk/0.1.0",
    };
    if (this.apiKey) headers["X-Antry-Key"] = this.apiKey;

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await this.fetchImpl(url.toString(), {
        method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: ctrl.signal,
      });
    } catch (err) {
      throw new AntryError(
        0,
        "network_error",
        err instanceof Error ? err.message : "network failed"
      );
    } finally {
      clearTimeout(timeout);
    }

    let data: unknown;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const obj = (data ?? {}) as { error?: string; reason?: string };
      throw new AntryError(
        res.status,
        obj.error ?? "request_failed",
        obj.reason ?? res.statusText,
        obj
      );
    }
    return data as T;
  }

  // ── briefs ─────────────────────────────────────────
  briefs = {
    /** List public Briefs. */
    list: async (params: {
      company?: string;
      difficulty?: Brief["difficulty"];
      limit?: number;
    } = {}): Promise<{ object: "list"; data: Brief[]; total: number }> => {
      return this.request("GET", "/api/v1/briefs", { query: params });
    },
    /** Get one Brief by slug. */
    get: async (slug: string): Promise<Brief & { prompt_md: string; rubric: Record<string, unknown>; ideal_fingerprint?: Fingerprint }> => {
      return this.request("GET", `/api/v1/briefs/${encodeURIComponent(slug)}`);
    },
  };

  // ── receipts ───────────────────────────────────────
  receipts = {
    /** List Receipts (requires company API key). */
    list: async (params: {
      company?: string;
      min_score?: number;
      limit?: number;
    } = {}): Promise<{ object: "list"; data: ReceiptListItem[]; total: number }> => {
      return this.request("GET", "/api/v1/receipts", { query: params });
    },
    /** Verify a Receipt's HMAC signature against its current content. */
    verify: async (id: string): Promise<VerifyResponse> => {
      return this.request("GET", `/api/v1/receipts/${encodeURIComponent(id)}/verify`);
    },
  };

  // ── candidates ─────────────────────────────────────
  candidates = {
    /** Natural-language search across the Receipts corpus. */
    search: async (params: {
      q: string;
      limit?: number;
    }): Promise<{
      query: string;
      inferred_dimensions: string[];
      results: CandidateMatch[];
    }> => {
      return this.request("POST", "/api/v1/candidates/search", { body: params });
    },
  };
}

// Default export for ergonomic `import Antry from "@antry/sdk"` usage too.
export default Antry;
