/**
 * Scout Agent SDK
 *
 * Clean, composable interface for the Antry Scout AI.
 * Wraps the core engine with a factory pattern for easy configuration.
 *
 * Usage:
 *   import { createScoutAgent, ScoutError, formatResponse } from '@/lib/agent/sdk'
 *   const scout = createScoutAgent()
 *   const result = await scout.query("Find React builders")
 *   console.log(formatResponse(result))
 *
 * @module scout-sdk
 */

import { runAgent, loadAgentDatasetStrict } from "../engine";
import type {
  AgentResponseBody,
  AgentIntent,
  AgentChatTurn,
  AgentDataset,
  AgentRichCard,
} from "../types";
import type { RateLimitConfig } from "../rate-limit";

// ── Error handling ───────────────────────────────────────────

/**
 * Typed error class for Scout Agent operations.
 *
 * Every error includes a machine-readable `code` so callers can branch on
 * the failure reason without parsing the message string.
 *
 * @example
 * ```ts
 * try {
 *   await scout.query("");
 * } catch (err) {
 *   if (err instanceof ScoutError && err.code === "EMPTY_QUERY") {
 *     showHint("Please type a question first.");
 *   }
 * }
 * ```
 */
export class ScoutError extends Error {
  /**
   * Machine-readable error code.
   *
   * | Code | Meaning |
   * |------|---------|
   * | `EMPTY_QUERY` | The input string was empty or whitespace-only after sanitization. |
   * | `DATASET_UNAVAILABLE` | The builder/project dataset could not be loaded. |
   * | `LOW_CONFIDENCE` | The engine returned a confidence score below the configured threshold. |
   * | `QUERY_TOO_LONG` | The sanitized input exceeds the maximum allowed length. |
   */
  public readonly code:
    | "EMPTY_QUERY"
    | "DATASET_UNAVAILABLE"
    | "LOW_CONFIDENCE"
    | "QUERY_TOO_LONG";

  /** The raw query string that triggered the error (if available). */
  public readonly query?: string;

  constructor(
    message: string,
    code: ScoutError["code"],
    query?: string
  ) {
    super(message);
    this.name = "ScoutError";
    this.code = code;
    this.query = query;
  }
}

// ── Input sanitization ───────────────────────────────────────

/** Maximum character length for a single query after sanitization. */
const MAX_QUERY_LENGTH = 320;

/**
 * Sanitize user input before it reaches the agent engine.
 *
 * - Trims leading/trailing whitespace
 * - Collapses runs of whitespace into a single space
 * - Returns the cleaned string (original casing preserved; lowercase is
 *   used only internally for matching, not in the returned value)
 *
 * @param raw - The raw user input.
 * @returns The sanitized string ready for the engine.
 *
 * @example
 * ```ts
 * sanitizeInput("  Find   React   builders  ") // "Find React builders"
 * ```
 */
export function sanitizeInput(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Produce a lowercase copy of the sanitized input for matching purposes.
 * Useful when you need case-insensitive comparisons but want to keep the
 * display string in its original casing.
 *
 * @param sanitized - Already-sanitized input (output of {@link sanitizeInput}).
 * @returns Lowercased copy.
 */
export function normalizeForMatching(sanitized: string): string {
  return sanitized.toLowerCase();
}

// ── Response formatting ──────────────────────────────────────

/**
 * Convert an {@link AgentResponseBody} into clean, human-readable display text.
 *
 * The output includes the main response, a summary of result cards grouped
 * by type, and any follow-up suggestions.
 *
 * @param response - The response object returned by {@link ScoutAgent.query}.
 * @returns A multi-line plain-text string suitable for CLI or chat display.
 *
 * @example
 * ```ts
 * const result = await scout.query("Find React builders");
 * console.log(formatResponse(result));
 * // Scout: Found 3 builders matching your query.
 * //
 * // Builders (3):
 * //   - Alice Chen (React, TypeScript)
 * //   ...
 * //
 * // Suggestions:
 * //   - "Show me their projects"
 * ```
 */
export function formatResponse(response: AgentResponseBody): string {
  const lines: string[] = [];

  // Main response text
  lines.push(`Scout: ${response.response}`);

  // Group cards by type
  if (response.cards.length > 0) {
    lines.push("");

    const grouped = groupCards(response.cards);

    if (grouped.builder.length > 0) {
      lines.push(`Builders (${grouped.builder.length}):`);
      for (const card of grouped.builder) {
        if (card.type === "builder") {
          const b = card.data;
          const skills = b.skills.slice(0, 4).join(", ");
          lines.push(`  - ${b.name} (@${b.username}) [${skills}]`);
        }
      }
    }

    if (grouped.project.length > 0) {
      lines.push(`Projects (${grouped.project.length}):`);
      for (const card of grouped.project) {
        if (card.type === "project") {
          const p = card.data;
          lines.push(`  - ${p.title}: ${p.tagline}`);
        }
      }
    }

    if (grouped.hackathon.length > 0) {
      lines.push(`Hackathons (${grouped.hackathon.length}):`);
      for (const card of grouped.hackathon) {
        if (card.type === "hackathon") {
          const h = card.data;
          lines.push(`  - ${h.title} (${h.status}): ${h.theme}`);
        }
      }
    }

    if (grouped.team.length > 0) {
      lines.push(`Teams (${grouped.team.length}):`);
      for (const card of grouped.team) {
        if (card.type === "team") {
          const members = card.data.members
            .map((m) => `${m.builder.name} as ${m.role}`)
            .join(", ");
          lines.push(`  - Theme: ${card.data.theme} | ${members}`);
        }
      }
    }

    if (grouped.other.length > 0) {
      lines.push(`Other results (${grouped.other.length}):`);
      for (const card of grouped.other) {
        lines.push(`  - [${card.type}]`);
      }
    }
  }

  // Suggestions
  if (response.suggestions.length > 0) {
    lines.push("");
    lines.push("Suggestions:");
    for (const s of response.suggestions) {
      lines.push(`  - "${s.label}"`);
    }
  }

  return lines.join("\n");
}

/** Group rich cards by their discriminated type for display. */
function groupCards(cards: AgentRichCard[]): {
  builder: AgentRichCard[];
  project: AgentRichCard[];
  hackathon: AgentRichCard[];
  team: AgentRichCard[];
  other: AgentRichCard[];
} {
  const result = {
    builder: [] as AgentRichCard[],
    project: [] as AgentRichCard[],
    hackathon: [] as AgentRichCard[],
    team: [] as AgentRichCard[],
    other: [] as AgentRichCard[],
  };

  for (const card of cards) {
    switch (card.type) {
      case "builder":
      case "builder_detail":
      case "trending_builders":
        result.builder.push(card);
        break;
      case "project":
      case "trending_projects":
        result.project.push(card);
        break;
      case "hackathon":
        result.hackathon.push(card);
        break;
      case "team":
        result.team.push(card);
        break;
      default:
        result.other.push(card);
        break;
    }
  }

  return result;
}

// ── Response time tracking ───────────────────────────────────

/**
 * Timing metadata attached to every query result.
 * Wraps the standard {@link AgentResponseBody} with performance data.
 */
export interface ScoutQueryResult extends AgentResponseBody {
  /** How long the query took to execute, in milliseconds. */
  responseTimeMs: number;
}

// ── Configuration ────────────────────────────────────────────

/**
 * Configuration for a Scout Agent instance.
 *
 * All fields are optional; sensible defaults are applied when omitted.
 */
export interface ScoutConfig {
  /** Maximum number of result cards to return per query (default: 10). */
  maxResults?: number;
  /** Whether to include follow-up suggestions in the response (default: true). */
  includeSuggestions?: boolean;
  /** Minimum confidence threshold to return results (default: 0.3). */
  minConfidence?: number;
  /**
   * Rate-limit configuration passed through to the limiter.
   * Only relevant when using the SDK in a server context.
   */
  rateLimit?: Partial<RateLimitConfig>;
}

/**
 * Optional context passed alongside each query.
 */
export interface ScoutQueryContext {
  /** Conversation history for multi-turn context. */
  history?: AgentChatTurn[];
  /** Pre-loaded dataset (skips the loading step if provided). */
  dataset?: AgentDataset;
}

/**
 * The public interface of a Scout Agent instance.
 *
 * Obtained via {@link createScoutAgent}. The `query` method is the primary
 * entry point for all natural-language interactions.
 */
export interface ScoutAgent {
  /**
   * Send a natural-language query to the Scout Agent.
   *
   * @param input   - The user's question or command.
   * @param context - Optional conversation history and/or pre-loaded dataset.
   * @returns A promise that resolves to a {@link ScoutQueryResult} containing
   *          the response, result cards, suggestions, and timing metadata.
   * @throws {ScoutError} with code `EMPTY_QUERY` if the input is blank.
   * @throws {ScoutError} with code `QUERY_TOO_LONG` if the input exceeds 320 characters.
   * @throws {ScoutError} with code `DATASET_UNAVAILABLE` if builder data cannot be loaded.
   */
  query(
    input: string,
    context?: ScoutQueryContext
  ): Promise<ScoutQueryResult>;

  /** The resolved configuration for this agent instance. */
  config: Required<Omit<ScoutConfig, "rateLimit">> & {
    rateLimit?: Partial<RateLimitConfig>;
  };
}

/** Default configuration values. */
const DEFAULT_CONFIG: Required<Omit<ScoutConfig, "rateLimit">> = {
  maxResults: 10,
  includeSuggestions: true,
  minConfidence: 0.3,
};

// ── Factory ──────────────────────────────────────────────────

/**
 * Create a Scout Agent instance with optional configuration.
 *
 * The returned object exposes a single `query()` method that sanitizes
 * input, calls the engine, applies confidence/result-count thresholds,
 * and returns a timed result.
 *
 * @param config - Optional overrides for defaults.
 * @returns A configured {@link ScoutAgent}.
 *
 * @example
 * ```ts
 * const scout = createScoutAgent({ maxResults: 5 });
 * const result = await scout.query("Find AI builders");
 * console.log(result.cards);          // RichCard[]
 * console.log(result.responseTimeMs); // 12
 * ```
 */
export function createScoutAgent(config?: ScoutConfig): ScoutAgent {
  const { rateLimit, ...rest } = config ?? {};
  const resolvedConfig = {
    ...DEFAULT_CONFIG,
    ...rest,
    rateLimit,
  };

  return {
    config: resolvedConfig,

    async query(
      input: string,
      context?: ScoutQueryContext
    ): Promise<ScoutQueryResult> {
      const startTime = performance.now();

      // ── Sanitize input ──────────────────────────────────
      const sanitized = sanitizeInput(input);

      if (sanitized.length === 0) {
        throw new ScoutError(
          "Query cannot be empty. Try asking about builders, projects, or hackathons.",
          "EMPTY_QUERY",
          input
        );
      }

      if (sanitized.length > MAX_QUERY_LENGTH) {
        throw new ScoutError(
          `Query is too long (${sanitized.length} chars). Please keep it under ${MAX_QUERY_LENGTH} characters.`,
          "QUERY_TOO_LONG",
          sanitized
        );
      }

      // ── Load dataset ────────────────────────────────────
      const history = context?.history ?? [];
      const dataset =
        context?.dataset ?? (await loadAgentDatasetStrict());

      if (!dataset) {
        throw new ScoutError(
          "Unable to load builder data right now. Please try again in a moment.",
          "DATASET_UNAVAILABLE",
          sanitized
        );
      }

      // ── Run engine ──────────────────────────────────────
      const result = runAgent(sanitized, history, dataset);
      const elapsed = Math.round(performance.now() - startTime);

      // ── Apply confidence threshold ──────────────────────
      if (result.confidence < resolvedConfig.minConfidence) {
        return {
          ...result,
          response:
            "I'm not quite sure what you're looking for. Try asking about builders, projects, hackathons, or teams.",
          intent: "help" as AgentIntent,
          responseTimeMs: elapsed,
        };
      }

      // ── Trim results ────────────────────────────────────
      if (
        result.cards &&
        result.cards.length > resolvedConfig.maxResults
      ) {
        result.cards = result.cards.slice(0, resolvedConfig.maxResults);
      }

      // ── Strip suggestions if disabled ───────────────────
      if (!resolvedConfig.includeSuggestions) {
        result.suggestions = [];
      }

      return {
        ...result,
        responseTimeMs: elapsed,
      };
    },
  };
}

// ── Re-exports ───────────────────────────────────────────────

export type {
  AgentResponseBody,
  AgentIntent,
  AgentChatTurn,
} from "../types";

export type { RateLimitConfig } from "../rate-limit";
export { createRateLimiter } from "../rate-limit";
