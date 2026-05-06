// Compute footprint computation for Antry Receipts.
//
// Translates the raw gateway telemetry of a Brief Attempt into a public-facing
// "compute footprint" — the numbers companies care about when hiring on
// efficiency, not just output:
//
//   - Lines of code generated (estimated from output tokens)
//   - Energy consumed (kWh, server-side LLM inference + client work)
//   - CO2 grams emitted (energy × grid intensity)
//   - Water litres (data-centre cooling proxy)
//   - Wall-clock seconds
//   - Peak memory MB (estimated)
//   - Cost in USD cents (sum of API + Antry overhead)
//
// All formulas are intentionally rough — they're calibration estimates, not
// audited. The methodology page documents every constant. We over-disclose
// the assumptions so anyone can replicate.

import type { GatewayCall } from "./fingerprint";

// ── Calibration constants ──────────────────────────────
//
// Energy per token is the largest unknown. Anthropic doesn't publish numbers,
// but research on LLaMA-class models suggests inference burns 0.0003-0.003
// Wh/token depending on model size. We use a conservative middle estimate.

const WH_PER_INPUT_TOKEN = 0.0006; // input is read-once, cheaper
const WH_PER_OUTPUT_TOKEN = 0.0030; // output tokens dominate compute
const KWH_PER_WH = 1 / 1000;

// US average grid intensity, 2026: ~370g CO2/kWh (declining as renewables
// expand). EU is ~250, China ~600. We default to the US number; companies
// can override via env if they're in a cleaner region.
const CO2_GRAMS_PER_KWH = Number(process.env.ANTRY_CO2_GRAMS_PER_KWH ?? 370);

// Data-centre water-usage effectiveness: ~1.8 L per kWh on average.
const WATER_LITRES_PER_KWH = 1.8;

// Output tokens to lines-of-code estimate: roughly 8-15 tokens per line of
// production-style code (whitespace/comments push it up). Use 11 as a
// reasonable mid-range. A real impl would read the actual code blocks
// emitted by the assistant.
const TOKENS_PER_LOC = 11;

// API cost (Anthropic Sonnet, May 2026 pricing).
const COST_INPUT_CENTS_PER_M = 300; // $3.00 / 1M
const COST_OUTPUT_CENTS_PER_M = 1500; // $15.00 / 1M
// Antry's overhead per attempt: signing + storage + bandwidth. ~10¢ flat.
const ANTRY_OVERHEAD_CENTS = 10;

// ── Types ──────────────────────────────────────────────

export type ComputeFootprint = {
  /** Total tokens spent through the gateway */
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;

  /** Estimated lines of code emitted (output_tokens / 11) */
  lines_of_code: number;

  /** Energy consumed by inference + adjacent compute, kWh */
  energy_kwh: number;

  /** CO2 emitted in grams (energy_kwh × grid intensity) */
  co2_grams: number;

  /** Water consumed by data-centre cooling, litres */
  water_litres: number;

  /** Wall-clock seconds from first call to last call */
  wall_clock_seconds: number;

  /** Peak in-process memory (estimated) */
  peak_memory_mb: number;

  /** Total cost in USD cents (Anthropic API + Antry overhead) */
  cost_usd_cents: number;

  /** Constants used for reproducibility — anyone can re-derive */
  constants: {
    wh_per_input_token: number;
    wh_per_output_token: number;
    co2_grams_per_kwh: number;
    water_litres_per_kwh: number;
    tokens_per_loc: number;
  };
};

// ── Computation ────────────────────────────────────────

export function computeFootprint(opts: {
  calls: Pick<GatewayCall, "inputTokens" | "outputTokens" | "latencyMs">[];
  startedAt: number;
  endedAt: number;
}): ComputeFootprint {
  const inputTokens = opts.calls.reduce((s, c) => s + c.inputTokens, 0);
  const outputTokens = opts.calls.reduce((s, c) => s + c.outputTokens, 0);
  const totalTokens = inputTokens + outputTokens;

  const energyKwh =
    (inputTokens * WH_PER_INPUT_TOKEN + outputTokens * WH_PER_OUTPUT_TOKEN) *
    KWH_PER_WH;

  const co2Grams = energyKwh * CO2_GRAMS_PER_KWH;
  const waterLitres = energyKwh * WATER_LITRES_PER_KWH;

  const linesOfCode = Math.round(outputTokens / TOKENS_PER_LOC);

  const wallClockSeconds = Math.max(
    1,
    Math.round((opts.endedAt - opts.startedAt) / 1000)
  );

  // Peak memory: very rough — assume ~100MB base + 20MB per 1k output tokens
  // for the candidate's running solution. Real impl would sample the sandbox.
  const peakMemoryMb = Math.round(100 + (outputTokens / 1000) * 20);

  const apiCostCents =
    (inputTokens / 1_000_000) * COST_INPUT_CENTS_PER_M +
    (outputTokens / 1_000_000) * COST_OUTPUT_CENTS_PER_M;
  const costUsdCents = Math.round(apiCostCents + ANTRY_OVERHEAD_CENTS);

  return {
    total_tokens: totalTokens,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    lines_of_code: linesOfCode,
    energy_kwh: round(energyKwh, 6),
    co2_grams: round(co2Grams, 3),
    water_litres: round(waterLitres, 4),
    wall_clock_seconds: wallClockSeconds,
    peak_memory_mb: peakMemoryMb,
    cost_usd_cents: costUsdCents,
    constants: {
      wh_per_input_token: WH_PER_INPUT_TOKEN,
      wh_per_output_token: WH_PER_OUTPUT_TOKEN,
      co2_grams_per_kwh: CO2_GRAMS_PER_KWH,
      water_litres_per_kwh: WATER_LITRES_PER_KWH,
      tokens_per_loc: TOKENS_PER_LOC,
    },
  };
}

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// ── Synthesise a footprint from a Receipt summary ──────
// For demo data we don't have per-call telemetry, so derive from totals.
export function footprintFromReceiptSummary(opts: {
  tokens_spent: number;
  attempt_duration_seconds: number;
  cost_usd_cents: number;
}): ComputeFootprint {
  // Assume 60/40 split input/output (typical for tool-using agent attempts).
  const inputTokens = Math.round(opts.tokens_spent * 0.6);
  const outputTokens = opts.tokens_spent - inputTokens;

  const energyKwh =
    (inputTokens * WH_PER_INPUT_TOKEN + outputTokens * WH_PER_OUTPUT_TOKEN) *
    KWH_PER_WH;
  const co2Grams = energyKwh * CO2_GRAMS_PER_KWH;
  const waterLitres = energyKwh * WATER_LITRES_PER_KWH;
  const linesOfCode = Math.round(outputTokens / TOKENS_PER_LOC);
  const peakMemoryMb = Math.round(100 + (outputTokens / 1000) * 20);

  return {
    total_tokens: opts.tokens_spent,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    lines_of_code: linesOfCode,
    energy_kwh: round(energyKwh, 6),
    co2_grams: round(co2Grams, 3),
    water_litres: round(waterLitres, 4),
    wall_clock_seconds: opts.attempt_duration_seconds,
    peak_memory_mb: peakMemoryMb,
    cost_usd_cents: opts.cost_usd_cents,
    constants: {
      wh_per_input_token: WH_PER_INPUT_TOKEN,
      wh_per_output_token: WH_PER_OUTPUT_TOKEN,
      co2_grams_per_kwh: CO2_GRAMS_PER_KWH,
      water_litres_per_kwh: WATER_LITRES_PER_KWH,
      tokens_per_loc: TOKENS_PER_LOC,
    },
  };
}

// ── Display helpers ────────────────────────────────────

export function formatEnergy(kwh: number): string {
  if (kwh < 0.001) return `${(kwh * 1_000_000).toFixed(0)} µWh`;
  if (kwh < 1) return `${(kwh * 1000).toFixed(2)} Wh`;
  return `${kwh.toFixed(3)} kWh`;
}

export function formatCo2(grams: number): string {
  if (grams < 1) return `${(grams * 1000).toFixed(0)} mg`;
  if (grams < 1000) return `${grams.toFixed(2)} g`;
  return `${(grams / 1000).toFixed(2)} kg`;
}

export function formatWater(litres: number): string {
  if (litres < 1) return `${(litres * 1000).toFixed(0)} ml`;
  return `${litres.toFixed(2)} L`;
}

export function formatCost(cents: number): string {
  if (cents < 100) return `$${(cents / 100).toFixed(3)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

// Compare to relatable reference units.
export function co2EquivalentLine(grams: number): string {
  if (grams < 0.5) return "≈ less than a Google search";
  if (grams < 5) return `≈ ${(grams / 0.2).toFixed(0)} Google searches`;
  if (grams < 50) return `≈ ${(grams / 4.6).toFixed(0)} m driving a car`;
  return `≈ ${(grams / 4600).toFixed(2)} km driving a car`;
}

export function energyEquivalentLine(kwh: number): string {
  // 1 LED bulb running for 1 hour ≈ 0.01 kWh
  if (kwh < 0.001) return "≈ a smartphone charge starting from 95%";
  if (kwh < 0.01) return `≈ an LED bulb for ${Math.round(kwh / 0.01 * 60)} min`;
  return `≈ an LED bulb for ${(kwh / 0.01).toFixed(1)} hours`;
}
