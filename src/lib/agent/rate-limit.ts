/**
 * Rate limiter for the Scout Agent API.
 *
 * Uses an in-memory sliding-window bucket strategy keyed by client identifier.
 * The store is attached to `globalThis` so it survives Next.js hot-reloads in
 * development while remaining isolated per server process in production.
 *
 * @module rate-limit
 */

// ── Configuration ────────────────────────────────────────────

/**
 * Configuration options for the rate limiter.
 * Pass these to {@link createRateLimiter} to override the defaults.
 */
export interface RateLimitConfig {
  /** Length of the sliding window in milliseconds (default: 15 minutes). */
  windowMs: number;
  /** Maximum number of requests allowed per window (default: 24). */
  maxRequests: number;
}

/** Sensible defaults that work for the public Scout Agent endpoint. */
const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 24,
};

// ── Internal types ───────────────────────────────────────────

/** A single bucket tracking request count and window expiry for one client. */
interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * The result of a rate-limit check.
 * Callers should inspect `allowed` before proceeding with the request.
 */
export interface LimitResult {
  /** Whether the request should be allowed through. */
  allowed: boolean;
  /** How many requests remain in the current window. */
  remaining: number;
  /** Seconds until the client may retry (0 when `allowed` is true). */
  retryAfterSeconds: number;
}

// ── Store management ─────────────────────────────────────────

const globalStore = globalThis as typeof globalThis & {
  __antryAgentRateLimit?: Map<string, Bucket>;
};

function getStore(): Map<string, Bucket> {
  if (!globalStore.__antryAgentRateLimit) {
    globalStore.__antryAgentRateLimit = new Map<string, Bucket>();
  }
  return globalStore.__antryAgentRateLimit;
}

/** Evict expired entries once the store grows beyond 2 000 keys. */
function cleanup(store: Map<string, Bucket>, now: number): void {
  if (store.size < 2000) return;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Check whether a request identified by `key` is within rate limits.
 *
 * This is the **legacy convenience function** that uses the global default
 * configuration. For SDK usage where the caller controls the limits, prefer
 * {@link createRateLimiter}.
 *
 * @param key - Unique client identifier (e.g. IP + user-agent hash).
 * @returns A {@link LimitResult} describing whether the request is allowed.
 *
 * @example
 * ```ts
 * const result = checkAgentRateLimit("192.168.1.1:chrome");
 * if (!result.allowed) {
 *   return new Response("Too many requests", { status: 429 });
 * }
 * ```
 */
export function checkAgentRateLimit(key: string): LimitResult {
  const limiter = createRateLimiter(DEFAULT_RATE_LIMIT_CONFIG);
  return limiter(key);
}

/**
 * Create a rate-limiter function with custom configuration.
 *
 * Returns a check function with the same signature as {@link checkAgentRateLimit}
 * but bound to the supplied config. Useful when the SDK consumer wants to
 * raise or lower limits.
 *
 * @param config - Window size and request cap overrides.
 * @returns A function that checks rate limits for a given client key.
 *
 * @example
 * ```ts
 * const check = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 * const result = check(clientKey);
 * ```
 */
export function createRateLimiter(
  config: Partial<RateLimitConfig> = {}
): (key: string) => LimitResult {
  const { windowMs, maxRequests } = {
    ...DEFAULT_RATE_LIMIT_CONFIG,
    ...config,
  };

  return function check(key: string): LimitResult {
    const now = Date.now();
    const store = getStore();

    cleanup(store, now);

    const current = store.get(key);
    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        retryAfterSeconds: 0,
      };
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((current.resetAt - now) / 1000)
        ),
      };
    }

    current.count += 1;
    store.set(key, current);

    return {
      allowed: true,
      remaining: maxRequests - current.count,
      retryAfterSeconds: 0,
    };
  };
}
