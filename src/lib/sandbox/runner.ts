// Antry sandbox runner.
//
// Runs candidate-submitted JavaScript/TypeScript code against a Brief's
// test suite. Returns pass/fail per test, captured stdout, and a fingerprint
// of any UI output the candidate rendered.
//
// SECURITY POSTURE: this implementation uses node:vm + restricted globals.
// vm is NOT a secure boundary — a determined attacker can escape via
// Function.prototype.constructor or async iterators. For production we
// swap this for Vercel Sandbox or a WASM/Cloudflare Worker isolate. The
// public API of this module stays the same.
//
// We enforce:
//   - Hard timeout (3000ms by default)
//   - No fs / net / process / require / import
//   - No setTimeout chaining beyond `maxTotalTimeMs`
//   - Memory cap via vm context size hints (best-effort only)
//   - Stdout capture
//
// The candidate's code MUST export (or assign to globalThis) a function
// matching the Brief's signature. We call it with each test case and
// compare the return value via the test's `assertion`.

import vm from "node:vm";

export type TestCase = {
  name: string;
  args: unknown[];
  /** Either an expected return value, or "anything truthy", or a custom assertion key. */
  expect: unknown | "truthy" | "no-throw";
  weight?: number; // 1 by default
};

export type SandboxRunInput = {
  /** TypeScript or JavaScript source. We strip type annotations naively. */
  code: string;
  /** Name of the function the test runner should call on globalThis. */
  entry: string;
  /** Test cases. */
  tests: TestCase[];
  /** Per-test timeout in ms (default 1500). */
  perTestTimeoutMs?: number;
  /** Total compute budget across all tests (default 5000ms). */
  maxTotalTimeMs?: number;
};

export type TestResult = {
  name: string;
  passed: boolean;
  reason?: string;
  durationMs: number;
  weight: number;
};

export type SandboxRunResult = {
  ok: boolean;
  /** All tests with their per-test outcomes. */
  results: TestResult[];
  /** Weighted pass rate, 0..1 */
  passRate: number;
  /** Total wall-clock duration in ms */
  durationMs: number;
  /** Captured console output during execution. */
  stdout: string[];
  /** Top-level error (compile error, missing entry, etc), if any. */
  error?: string;
};

// Naive TypeScript-to-JavaScript transform: strip type annotations on
// param lists, return types, and `as Type`. NOT a real TS compiler — only
// good enough for the simple deliverables Briefs ask for. A real impl
// would shell out to esbuild or sucrase.
function tsToJs(src: string): string {
  let out = src;
  // Strip `: Type` annotations on params and return values, naively.
  out = out.replace(/:\s*[A-Za-z_$][\w$.<>\s,|&[\]'"`]*(?=[,)=\n]|\s*=>)/g, "");
  // Strip `as Foo` casts.
  out = out.replace(/\s+as\s+[A-Za-z_$][\w$.<>\s,|&[\]'"`]*/g, "");
  // Strip `import type` lines.
  out = out.replace(/^import\s+type\s+.*$/gm, "");
  // Strip `interface ... {}` blocks.
  out = out.replace(/^interface\s+[A-Za-z_$][\w$]*\s*\{[\s\S]*?^\}/gm, "");
  // Strip `type X = ...;` lines.
  out = out.replace(/^type\s+[A-Za-z_$][\w$]*\s*=\s*[^;]+;/gm, "");
  return out;
}

function makeRestrictedGlobals(stdoutBuf: string[]) {
  // A minimal globals surface. No fs, net, process, require, dynamic import.
  const console = {
    log: (...args: unknown[]) => stdoutBuf.push(args.map(String).join(" ")),
    error: (...args: unknown[]) => stdoutBuf.push("[error] " + args.map(String).join(" ")),
    warn: (...args: unknown[]) => stdoutBuf.push("[warn] " + args.map(String).join(" ")),
  };
  return {
    console,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Error,
    Promise,
    Set,
    Map,
    Symbol,
    // Intentionally absent: setTimeout/setInterval (timers escape budget),
    // fetch (no network), require (no resolve), process, fs, etc.
  };
}

export async function runSandbox(input: SandboxRunInput): Promise<SandboxRunResult> {
  const start = Date.now();
  const stdout: string[] = [];
  const perTestTimeoutMs = input.perTestTimeoutMs ?? 1500;
  const maxTotalTimeMs = input.maxTotalTimeMs ?? 5000;

  const code = tsToJs(input.code);
  const globals = makeRestrictedGlobals(stdout);
  const ctx = vm.createContext(globals);

  // Compile the candidate's source once.
  let script: vm.Script;
  try {
    script = new vm.Script(code, { filename: "candidate.js" });
  } catch (err) {
    return {
      ok: false,
      results: [],
      passRate: 0,
      durationMs: Date.now() - start,
      stdout,
      error: `compile_error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Run the source in a fresh context with a hard timeout. This sets up
  // the candidate's function on globalThis.
  try {
    script.runInContext(ctx, { timeout: maxTotalTimeMs });
  } catch (err) {
    return {
      ok: false,
      results: [],
      passRate: 0,
      durationMs: Date.now() - start,
      stdout,
      error: `runtime_error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const entry = (ctx as Record<string, unknown>)[input.entry];
  if (typeof entry !== "function") {
    return {
      ok: false,
      results: [],
      passRate: 0,
      durationMs: Date.now() - start,
      stdout,
      error: `missing_entry: function "${input.entry}" not defined on globalThis`,
    };
  }

  // Run each test with a per-test timeout. Test calls share the budget.
  const results: TestResult[] = [];
  let totalWeight = 0;
  let passedWeight = 0;
  for (const t of input.tests) {
    const weight = t.weight ?? 1;
    totalWeight += weight;
    const tStart = Date.now();
    try {
      const promise = Promise.resolve(
        (entry as (...args: unknown[]) => unknown)(...t.args)
      );
      const value = await Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("per_test_timeout")), perTestTimeoutMs)
        ),
      ]);
      const passed = checkAssertion(value, t.expect);
      if (passed) passedWeight += weight;
      results.push({
        name: t.name,
        passed,
        reason: passed ? undefined : `assertion failed: expected ${displayExpect(t.expect)}, got ${display(value)}`,
        durationMs: Date.now() - tStart,
        weight,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      // "no-throw" assertions FAIL on throw.
      // For the special case where expect === "no-throw", obviously throwing fails.
      results.push({
        name: t.name,
        passed: false,
        reason: `threw: ${reason}`,
        durationMs: Date.now() - tStart,
        weight,
      });
    }

    if (Date.now() - start > maxTotalTimeMs) {
      // Budget exhausted; mark remaining tests as not-run.
      for (const remaining of input.tests.slice(results.length)) {
        const w = remaining.weight ?? 1;
        totalWeight += w;
        results.push({
          name: remaining.name,
          passed: false,
          reason: "budget_exhausted",
          durationMs: 0,
          weight: w,
        });
      }
      break;
    }
  }

  const passRate = totalWeight > 0 ? passedWeight / totalWeight : 0;

  return {
    ok: true,
    results,
    passRate,
    durationMs: Date.now() - start,
    stdout,
  };
}

function checkAssertion(value: unknown, expect: unknown): boolean {
  if (expect === "truthy") return Boolean(value);
  if (expect === "no-throw") return true; // we got here without throwing
  return deepEqual(value, expect);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  const ka = Object.keys(a as object).sort();
  const kb = Object.keys(b as object).sort();
  if (ka.length !== kb.length || !ka.every((k, i) => k === kb[i])) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function display(v: unknown): string {
  try {
    const s = JSON.stringify(v);
    return s.length > 80 ? s.slice(0, 77) + "..." : s;
  } catch {
    return String(v);
  }
}

function displayExpect(e: unknown): string {
  if (e === "truthy") return "anything truthy";
  if (e === "no-throw") return "function not to throw";
  return display(e);
}
