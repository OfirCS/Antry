import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkAgentRateLimit } from "@/lib/agent/rate-limit";

describe("checkAgentRateLimit()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear the global store between tests
    const globalStore = globalThis as typeof globalThis & {
      __antryAgentRateLimit?: Map<string, unknown>;
    };
    globalStore.__antryAgentRateLimit = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request", () => {
    const result = checkAgentRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(23); // 24 - 1
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("allows requests up to the limit (24)", () => {
    for (let i = 0; i < 24; i++) {
      const result = checkAgentRateLimit("user-2");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(24 - (i + 1));
    }
  });

  it("blocks request at limit + 1 (25th request)", () => {
    for (let i = 0; i < 24; i++) {
      checkAgentRateLimit("user-3");
    }

    const blocked = checkAgentRateLimit("user-3");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("provides valid retryAfterSeconds when blocked", () => {
    for (let i = 0; i < 24; i++) {
      checkAgentRateLimit("user-4");
    }

    const blocked = checkAgentRateLimit("user-4");
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(15 * 60);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("resets after the window expires (15 minutes)", () => {
    // Exhaust the limit
    for (let i = 0; i < 24; i++) {
      checkAgentRateLimit("user-5");
    }

    // Should be blocked
    expect(checkAgentRateLimit("user-5").allowed).toBe(false);

    // Advance past the window (15 minutes + 1ms)
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    // Should be allowed again
    const result = checkAgentRateLimit("user-5");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(23);
  });

  it("tracks different keys independently", () => {
    // Exhaust user-a
    for (let i = 0; i < 24; i++) {
      checkAgentRateLimit("user-a");
    }

    expect(checkAgentRateLimit("user-a").allowed).toBe(false);

    // user-b should still be allowed
    const resultB = checkAgentRateLimit("user-b");
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(23);
  });

  it("decrements remaining correctly", () => {
    const r1 = checkAgentRateLimit("user-dec");
    expect(r1.remaining).toBe(23);

    const r2 = checkAgentRateLimit("user-dec");
    expect(r2.remaining).toBe(22);

    const r3 = checkAgentRateLimit("user-dec");
    expect(r3.remaining).toBe(21);
  });

  it("retryAfterSeconds decreases as time passes", () => {
    for (let i = 0; i < 24; i++) {
      checkAgentRateLimit("user-time");
    }

    const blocked1 = checkAgentRateLimit("user-time");
    const retry1 = blocked1.retryAfterSeconds;

    // Advance 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    const blocked2 = checkAgentRateLimit("user-time");
    const retry2 = blocked2.retryAfterSeconds;

    expect(retry2).toBeLessThan(retry1);
  });
});
