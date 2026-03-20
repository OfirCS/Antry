const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 24;

interface Bucket {
  count: number;
  resetAt: number;
}

interface LimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const globalStore = globalThis as typeof globalThis & {
  __antryAgentRateLimit?: Map<string, Bucket>;
};

function getStore(): Map<string, Bucket> {
  if (!globalStore.__antryAgentRateLimit) {
    globalStore.__antryAgentRateLimit = new Map<string, Bucket>();
  }
  return globalStore.__antryAgentRateLimit;
}

function cleanup(store: Map<string, Bucket>, now: number): void {
  if (store.size < 2000) return;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkAgentRateLimit(key: string): LimitResult {
  const now = Date.now();
  const store = getStore();

  cleanup(store, now);

  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - current.count,
    retryAfterSeconds: 0,
  };
}
