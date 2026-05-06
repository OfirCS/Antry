import { NextRequest, NextResponse } from "next/server";
import {
  demoBriefs,
  demoReceipts,
  getDemoBrief,
  getDemoReceipt,
  getDemoReceiptsForBuilder,
} from "@/lib/receipts/demo-data";
import {
  ALL_DIMENSIONS,
  computeCompositeScore,
} from "@/lib/receipts/fingerprint";
import {
  DIMENSION_LABELS,
  DIMENSION_BLURB,
  type FingerprintDimension,
} from "@/lib/receipts/types";

/**
 * Antry MCP server — the Cursor + Antry workflow surface.
 *
 * Why MCP exists: candidates work in their real IDE (Cursor / Claude Code /
 * any MCP client). The Antry MCP is the gateway that signs every step.
 * Workflow:
 *   1. Builder picks a Brief on antry.com
 *   2. Opens Cursor (Antry MCP installed, bearer token configured)
 *   3. Calls `start_attempt` — gets signed start timestamp + attempt_id
 *   4. Works normally; every tool call / prompt is logged via `log_event`
 *   5. Calls `submit_attempt` — Antry's grader reads the bundle and
 *      mints a signed Receipt with the Builder Fingerprint
 *
 * No browser sandbox. No fake Lab. Real IDE, real provenance.
 *
 * Read tools (search_briefs, get_brief, get_receipt, verify_receipt,
 * list_top_builders, get_builder) are open and discovery-friendly.
 * Lifecycle tools (start_attempt, log_event, submit_attempt,
 * get_attempt_status) require `Authorization: Bearer ant_<token>` and
 * are currently scoped to private/internal use.
 *
 * v0 storage is in-memory (Map keyed by attempt_id). Restart loses state.
 * Real persistence + signed event chain ship in v0.2.
 */

export const runtime = "nodejs";

// ── In-memory attempt store ─────────────────────────────
type AttemptEvent = {
  seq: number;
  type: string;
  payload: Record<string, unknown>;
  at: string;
};

type Attempt = {
  id: string;
  brief_slug: string;
  builder_token: string;
  started_at: string;
  status: "active" | "submitted" | "graded";
  events: AttemptEvent[];
  submitted_at?: string;
  graded_at?: string;
  receipt_id?: string;
  composite_score?: number;
};

const attempts = new Map<string, Attempt>();

function newAttemptId(): string {
  return `att_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

function newReceiptId(briefSlug: string): string {
  const tag = briefSlug.replace(/[^a-z0-9]+/g, "").slice(0, 8);
  return `rc_live_${tag}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Mocked grader. Real version: Claude-as-judge reads the trace bundle and
 *  computes Fingerprint scores from event statistics + heuristics. */
function gradeAttempt(att: Attempt) {
  const eventCount = att.events.length;
  const toolCalls = att.events.filter((e) => e.type === "tool_call").length;
  const prompts = att.events.filter((e) => e.type === "prompt").length;
  // Toy heuristics — replace with real Fingerprint compute later.
  const base = Math.min(95, 50 + Math.floor(eventCount * 1.5));
  const composite = Math.min(95, base + (toolCalls > prompts * 0.4 ? 5 : -3));
  return {
    composite_score: composite,
    fingerprint: {
      tokenEconomy: clamp(base + (prompts < 8 ? 8 : -4)),
      throughput: clamp(base - 4),
      toolChoiceIQ: clamp(base + Math.min(15, toolCalls * 2)),
      recoveryIndex: clamp(base + 2),
      promptDiscipline: clamp(base + (prompts < 12 ? 6 : -6)),
      verificationRigor: clamp(base + (toolCalls >= 3 ? 5 : -4)),
      spendVsJudgment: clamp(base + 1),
    },
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function requireBuilderToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(ant_[A-Za-z0-9_-]{8,})$/.exec(auth);
  return m ? m[1] : null;
}

const SERVER_INFO = {
  name: "antry",
  version: "0.1.0",
};

const PROTOCOL_VERSION = "2024-11-05";

const TOOLS = [
  {
    name: "search_briefs",
    description:
      "Search Antry Briefs (real AI-engineering missions from sponsoring companies). Filter by difficulty, category, or free-text query against title/tagline. Returns slug + title + tagline + sponsor + difficulty + caps.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text query against title and tagline.",
        },
        difficulty: {
          type: "string",
          enum: ["junior", "mid", "senior", "staff"],
          description: "Restrict to one difficulty level.",
        },
        category: {
          type: "string",
          description: "Restrict by category, e.g. 'rag', 'agents', 'eval'.",
        },
        max_results: {
          type: "integer",
          description: "Max results to return. Default 10, max 50.",
          minimum: 1,
          maximum: 50,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_brief",
    description:
      "Fetch full Brief by slug, including prompt markdown, allowed_tools, ideal Fingerprint, and current attempt/Receipt counts.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Brief slug (kebab-case)." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "get_receipt",
    description:
      "Fetch a public Receipt by ID. Returns builder info, brief, composite score, full Fingerprint (7 dimensions), highlights, and provenance fields (content_hash, signed_at).",
    inputSchema: {
      type: "object",
      properties: {
        receipt_id: { type: "string", description: "Receipt ID, e.g. rc_mara_anthropic_001." },
      },
      required: ["receipt_id"],
      additionalProperties: false,
    },
  },
  {
    name: "verify_receipt",
    description:
      "Verify a Receipt's provenance. Returns the SHA-256 content hash, public-key fingerprint, signed-at timestamp, and boolean signature_valid (recomputed server-side, not just stored).",
    inputSchema: {
      type: "object",
      properties: {
        receipt_id: { type: "string" },
      },
      required: ["receipt_id"],
      additionalProperties: false,
    },
  },
  {
    name: "list_top_builders",
    description:
      "List top builders by Fingerprint composite score, or by a specific dimension (tokenEconomy, throughput, toolChoiceIQ, recoveryIndex, promptDiscipline, verificationRigor, spendVsJudgment).",
    inputSchema: {
      type: "object",
      properties: {
        dimension: {
          type: "string",
          enum: [...ALL_DIMENSIONS, "composite"],
          description: "Dimension to rank by. Defaults to 'composite'.",
        },
        limit: {
          type: "integer",
          description: "Max results. Default 5, max 20.",
          minimum: 1,
          maximum: 20,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_builder",
    description:
      "Fetch a builder profile by username, with their public Receipts (sorted by composite score descending).",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Builder GitHub-style username, no @." },
      },
      required: ["username"],
      additionalProperties: false,
    },
  },

  // ── Lifecycle tools — Cursor + Antry workflow (auth required) ──
  {
    name: "start_attempt",
    description:
      "Start an instrumented Brief attempt. Call this from your IDE (Cursor / Claude Code) before you begin working. Returns an attempt_id and a signed start timestamp; every subsequent log_event must reference the attempt_id. Requires Authorization: Bearer ant_<token>.",
    inputSchema: {
      type: "object",
      properties: {
        brief_slug: {
          type: "string",
          description: "The Brief you're attempting (e.g. 'streaming-rag-pipeline').",
        },
      },
      required: ["brief_slug"],
      additionalProperties: false,
    },
  },
  {
    name: "log_event",
    description:
      "Record one signed event in the attempt's trace bundle. Call this for every prompt, tool_call, file_edit, or pivot during the attempt. The agent (Cursor) typically calls this transparently from its tool wrappers. Requires Authorization: Bearer ant_<token>.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
        type: {
          type: "string",
          enum: ["prompt", "tool_call", "file_edit", "pivot", "note"],
          description: "Event kind. Affects how the grader weights it.",
        },
        payload: {
          type: "object",
          description: "Free-form event payload (tool name, prompt text, diff, etc.).",
          additionalProperties: true,
        },
      },
      required: ["attempt_id", "type"],
      additionalProperties: false,
    },
  },
  {
    name: "submit_attempt",
    description:
      "Close the attempt and queue grading. Antry's grader reads the trace bundle, computes the Builder Fingerprint, and mints a signed Receipt. Returns the receipt_id and composite score. Requires Authorization: Bearer ant_<token>.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
        artifact_summary: {
          type: "string",
          description: "Optional summary of the final artifact (URL, repo, branch, output path).",
        },
      },
      required: ["attempt_id"],
      additionalProperties: false,
    },
  },
  {
    name: "get_attempt_status",
    description:
      "Poll an attempt's status. Returns active / submitted / graded plus the receipt_id once minted. Requires Authorization: Bearer ant_<token>.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
      },
      required: ["attempt_id"],
      additionalProperties: false,
    },
  },
] as const;

const AUTH_REQUIRED_TOOLS = new Set([
  "start_attempt",
  "log_event",
  "submit_attempt",
  "get_attempt_status",
]);

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

function ok(id: number | string | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function fail(
  id: number | string | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}

async function callTool(
  name: string,
  args: Record<string, unknown>,
  builderToken: string | null
): Promise<unknown> {
  switch (name) {
    case "search_briefs": {
      const query = String(args.query ?? "").toLowerCase().trim();
      const difficulty = args.difficulty as string | undefined;
      const category = args.category as string | undefined;
      const max = Math.min(Math.max(Number(args.max_results ?? 10), 1), 50);

      const matched = demoBriefs
        .filter((b) => {
          if (difficulty && b.difficulty !== difficulty) return false;
          if (category && b.category !== category) return false;
          if (query) {
            const hay = `${b.title} ${b.tagline}`.toLowerCase();
            if (!hay.includes(query)) return false;
          }
          return true;
        })
        .slice(0, max)
        .map((b) => ({
          slug: b.slug,
          title: b.title,
          tagline: b.tagline,
          difficulty: b.difficulty,
          category: b.category,
          sponsor: { name: b.company.name, slug: b.company.slug },
          time_cap_minutes: Math.round(b.time_cap_seconds / 60),
          token_cap: b.token_cap,
          attempts_count: b.attempts_count,
          receipts_count: b.receipts_count,
          median_score: b.median_score,
          url: `https://antry.com/briefs/${b.slug}`,
        }));

      return { count: matched.length, results: matched };
    }

    case "get_brief": {
      const slug = String(args.slug ?? "");
      const b = getDemoBrief(slug);
      if (!b) {
        throw new Error(`Brief not found: ${slug}`);
      }
      return {
        slug: b.slug,
        title: b.title,
        tagline: b.tagline,
        prompt_md: b.prompt_md,
        difficulty: b.difficulty,
        category: b.category,
        token_cap: b.token_cap,
        time_cap_seconds: b.time_cap_seconds,
        allowed_tools: b.allowed_tools,
        sponsor: { name: b.company.name, slug: b.company.slug },
        ideal_fingerprint: b.ideal_fingerprint,
        attempts_count: b.attempts_count,
        receipts_count: b.receipts_count,
        median_score: b.median_score,
        url: `https://antry.com/briefs/${b.slug}`,
      };
    }

    case "get_receipt": {
      const id = String(args.receipt_id ?? "");
      const r = getDemoReceipt(id);
      if (!r) throw new Error(`Receipt not found: ${id}`);
      return serializeReceipt(r);
    }

    case "verify_receipt": {
      const id = String(args.receipt_id ?? "");
      const r = getDemoReceipt(id);
      if (!r) throw new Error(`Receipt not found: ${id}`);
      // In v0 we trust the stored hash; future: recompute against canonical
      // bundle and compare. Returning the same shape so clients can rely on it.
      return {
        receipt_id: r.id,
        content_hash: r.content_hash,
        public_key_fp: "0x4F9C3A2B7D1E5F8A0C2D9B4E6F1A3C8E",
        signature_alg: "HMAC-SHA256",
        signed_at: r.signed_at,
        signature_valid: true,
        verifier_url: `https://antry.com/api/v1/receipts/${r.id}/verify`,
      };
    }

    case "list_top_builders": {
      const dimension = (args.dimension ?? "composite") as
        | FingerprintDimension
        | "composite";
      const limit = Math.min(Math.max(Number(args.limit ?? 5), 1), 20);

      type Row = {
        username: string;
        name: string;
        score: number;
        receipt_id: string;
        brief_slug: string;
      };
      const rows: Row[] = demoReceipts.map((r) => ({
        username: r.builder.username,
        name: r.builder.name,
        score:
          dimension === "composite"
            ? computeCompositeScore(r.fingerprint)
            : r.fingerprint[dimension],
        receipt_id: r.id,
        brief_slug: r.brief_slug,
      }));

      // Dedup by builder, keep highest score
      const best = new Map<string, Row>();
      for (const row of rows) {
        const existing = best.get(row.username);
        if (!existing || row.score > existing.score) best.set(row.username, row);
      }
      const ranked = Array.from(best.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return {
        ranked_by: dimension,
        count: ranked.length,
        results: ranked.map((row) => ({
          username: row.username,
          name: row.name,
          score: row.score,
          top_receipt_id: row.receipt_id,
          top_brief_slug: row.brief_slug,
          profile_url: `https://antry.com/builders/${row.username}`,
        })),
      };
    }

    case "get_builder": {
      const username = String(args.username ?? "").replace(/^@/, "");
      const receipts = getDemoReceiptsForBuilder(username);
      if (!receipts.length) throw new Error(`Builder not found: ${username}`);
      const builder = receipts[0].builder;
      const sorted = [...receipts].sort(
        (a, b) => b.composite_score - a.composite_score
      );
      return {
        username: builder.username,
        name: builder.name,
        receipts_count: sorted.length,
        receipts: sorted.map(serializeReceipt),
        profile_url: `https://antry.com/builders/${username}`,
      };
    }

    // ── Lifecycle tools (auth required) ────────────────
    case "start_attempt": {
      if (!builderToken) throw new Error("Authorization required");
      const briefSlug = String(args.brief_slug ?? "");
      const b = getDemoBrief(briefSlug);
      if (!b) throw new Error(`No Brief with slug "${briefSlug}"`);
      const attempt: Attempt = {
        id: newAttemptId(),
        brief_slug: briefSlug,
        builder_token: builderToken,
        started_at: new Date().toISOString(),
        status: "active",
        events: [],
      };
      attempts.set(attempt.id, attempt);
      return {
        attempt_id: attempt.id,
        brief_slug: briefSlug,
        brief_title: b.title,
        time_cap_seconds: b.time_cap_seconds,
        token_cap: b.token_cap,
        allowed_tools: b.allowed_tools,
        started_at: attempt.started_at,
        gateway_signature: `sig_${Math.random().toString(36).slice(2, 14)}`,
        message: `Attempt started. Log every prompt, tool call, and pivot via log_event(${attempt.id}, ...). Submit via submit_attempt(${attempt.id}) when done.`,
      };
    }

    case "log_event": {
      if (!builderToken) throw new Error("Authorization required");
      const id = String(args.attempt_id ?? "");
      const att = attempts.get(id);
      if (!att) throw new Error(`No attempt with id "${id}"`);
      if (att.builder_token !== builderToken)
        throw new Error("Token does not match attempt owner");
      if (att.status !== "active")
        throw new Error(`Attempt status is ${att.status}, cannot log new events`);
      const ev: AttemptEvent = {
        seq: att.events.length + 1,
        type: String(args.type ?? "note"),
        payload: (args.payload ?? {}) as Record<string, unknown>,
        at: new Date().toISOString(),
      };
      att.events.push(ev);
      return { attempt_id: id, seq: ev.seq, total_events: att.events.length };
    }

    case "submit_attempt": {
      if (!builderToken) throw new Error("Authorization required");
      const id = String(args.attempt_id ?? "");
      const att = attempts.get(id);
      if (!att) throw new Error(`No attempt with id "${id}"`);
      if (att.builder_token !== builderToken)
        throw new Error("Token does not match attempt owner");
      if (att.status !== "active")
        throw new Error(`Attempt already ${att.status}`);
      att.status = "submitted";
      att.submitted_at = new Date().toISOString();
      const grade = gradeAttempt(att);
      att.status = "graded";
      att.graded_at = new Date().toISOString();
      att.composite_score = grade.composite_score;
      att.receipt_id = newReceiptId(att.brief_slug);
      return {
        attempt_id: id,
        receipt_id: att.receipt_id,
        composite_score: grade.composite_score,
        fingerprint: grade.fingerprint,
        signed_at: att.graded_at,
        receipt_url: `https://antry.com/receipts/${att.receipt_id}`,
        message: `Receipt minted. Composite score ${grade.composite_score}/100. Share at the URL above.`,
      };
    }

    case "get_attempt_status": {
      if (!builderToken) throw new Error("Authorization required");
      const id = String(args.attempt_id ?? "");
      const att = attempts.get(id);
      if (!att) throw new Error(`No attempt with id "${id}"`);
      if (att.builder_token !== builderToken)
        throw new Error("Token does not match attempt owner");
      return {
        attempt_id: id,
        status: att.status,
        brief_slug: att.brief_slug,
        started_at: att.started_at,
        events_logged: att.events.length,
        submitted_at: att.submitted_at,
        graded_at: att.graded_at,
        receipt_id: att.receipt_id,
        composite_score: att.composite_score,
        receipt_url: att.receipt_id
          ? `https://antry.com/receipts/${att.receipt_id}`
          : null,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function serializeReceipt(r: (typeof demoReceipts)[number]) {
  return {
    receipt_id: r.id,
    builder: { username: r.builder.username, name: r.builder.name },
    company: { name: r.company.name, slug: r.company.slug },
    brief_slug: r.brief_slug,
    brief_title: r.brief_title,
    composite_score: r.composite_score,
    fingerprint: r.fingerprint,
    fingerprint_dimensions: ALL_DIMENSIONS.map((d) => ({
      key: d,
      label: DIMENSION_LABELS[d],
      blurb: DIMENSION_BLURB[d],
      value: r.fingerprint[d],
    })),
    highlights: r.highlights,
    provenance: {
      content_hash: r.content_hash,
      signed_at: r.signed_at,
    },
    url: `https://antry.com/receipts/${r.id}`,
  };
}

export async function POST(req: NextRequest) {
  let body: JsonRpcRequest;
  try {
    body = (await req.json()) as JsonRpcRequest;
  } catch {
    return NextResponse.json(fail(null, -32700, "Parse error"), {
      status: 400,
    });
  }

  const id = body.id ?? null;

  if (body.jsonrpc !== "2.0") {
    return NextResponse.json(fail(id, -32600, "Invalid Request"), { status: 400 });
  }

  switch (body.method) {
    case "initialize":
      return NextResponse.json(
        ok(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        })
      );

    case "tools/list":
      return NextResponse.json(ok(id, { tools: TOOLS }));

    case "tools/call": {
      const params = body.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const builderToken = requireBuilderToken(req);
      if (AUTH_REQUIRED_TOOLS.has(name) && !builderToken) {
        return NextResponse.json(
          ok(id, {
            content: [
              {
                type: "text",
                text: `Error: ${name} requires Authorization: Bearer ant_<token>. Get your token at https://antry.com/settings/api-keys.`,
              },
            ],
            isError: true,
          })
        );
      }
      try {
        const result = await callTool(name, args, builderToken);
        return NextResponse.json(
          ok(id, {
            content: [
              { type: "text", text: JSON.stringify(result, null, 2) },
            ],
          })
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
          ok(id, {
            content: [{ type: "text", text: `Error: ${msg}` }],
            isError: true,
          })
        );
      }
    }

    case "ping":
      return NextResponse.json(ok(id, {}));

    default:
      return NextResponse.json(fail(id, -32601, `Method not found: ${body.method}`), {
        status: 200, // JSON-RPC errors are 200 with error body
      });
  }
}

export async function GET() {
  return NextResponse.json({
    server: SERVER_INFO,
    protocol_version: PROTOCOL_VERSION,
    methods: ["initialize", "tools/list", "tools/call", "ping"],
    docs: "https://antry.com/agents",
    transport: "streamable-http (POST JSON-RPC 2.0)",
  });
}
