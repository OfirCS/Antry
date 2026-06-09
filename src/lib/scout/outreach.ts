/**
 * Scout outreach drafting — shared between the API route and tests.
 *
 * The "Reach out" CTA on Scout/Compare opens a drawer that drafts a
 * personalized first-contact message citing the candidate's actual
 * Receipt evidence (composite, top Fingerprint dimensions, highlight).
 *
 * Two paths, same contract as the rest of the agentic stack:
 *   - Claude Sonnet 4.6 drafts when ANTHROPIC_API_KEY is set (route).
 *   - `buildOutreachTemplate()` is the deterministic fallback — pure,
 *     env-free, unit-tested here so the no-key experience stays solid.
 */

import {
  DIMENSION_LABELS,
  type FingerprintDimension,
  type Receipt,
} from "@/lib/receipts/types";

export type OutreachDraft = {
  subject: string;
  message: string;
};

/** The slice of a Receipt the drafter needs. Kept flat so the API route
 *  can build it from its scout pool rows without a full Receipt. */
export type OutreachCandidate = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  brief_title: string;
  company: string;
  composite_score: number;
  fingerprint: Receipt["fingerprint"];
  highlight: string;
};

export function candidateFromReceipt(r: Receipt): OutreachCandidate {
  return {
    receipt_id: r.id,
    builder_username: r.builder.username,
    builder_name: r.builder.name,
    brief_title: r.brief_title,
    company: r.company.name,
    composite_score: r.composite_score,
    fingerprint: r.fingerprint,
    highlight: r.highlights[0] ?? "",
  };
}

/** Top-N fingerprint dimensions, strongest first. */
export function topDimensions(
  fingerprint: Receipt["fingerprint"],
  n = 2
): { dim: FingerprintDimension; score: number }[] {
  return (
    Object.entries(fingerprint) as [FingerprintDimension, number][]
  )
    .map(([dim, score]) => ({ dim, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/**
 * Deterministic outreach draft. Cites the same evidence the LLM path
 * does — composite, top-2 dimensions, first highlight, Receipt link —
 * so the no-key experience is a real product, not a degraded one.
 *
 * `receiptUrl` is passed in (rather than derived here) so the template
 * stays pure for tests; the route resolves it via siteUrl().
 */
export function buildOutreachTemplate(
  candidate: OutreachCandidate,
  receiptUrl: string,
  context?: string
): OutreachDraft {
  const firstName = candidate.builder_name.trim().split(/\s+/)[0] || "there";
  const top = topDimensions(candidate.fingerprint, 2);
  const dims = top
    .map(({ dim, score }) => `${DIMENSION_LABELS[dim]} ${score}`)
    .join(" and ");

  const roleLine = context?.trim()
    ? `We're hiring for: ${context.trim()}\n\n`
    : "";

  const highlightLine = candidate.highlight
    ? `What stood out from the trace: "${candidate.highlight}"\n\n`
    : "";

  const subject = `Your ${candidate.composite_score}/100 on ${candidate.brief_title} — open to a chat?`;

  // "an Anthropic Brief" vs "a Vercel Brief".
  const article = /^[aeiou]/i.test(candidate.company) ? "an" : "a";

  const message = `Hi ${firstName},

I found your signed Receipt on Antry — ${candidate.composite_score}/100 on "${candidate.brief_title}" (${article} ${candidate.company} Brief). Your ${dims} are exactly the profile we look for.

${roleLine}${highlightLine}The Receipt that convinced me: ${receiptUrl}

Would you be open to a quick intro call this week?

— Sent via Antry Scout`;

  return { subject, message };
}

/** Compact evidence block for the LLM drafter's user turn. */
export function buildOutreachPrompt(
  candidate: OutreachCandidate,
  receiptUrl: string,
  context?: string
): string {
  const fp = (
    Object.entries(candidate.fingerprint) as [FingerprintDimension, number][]
  )
    .map(([dim, score]) => `${DIMENSION_LABELS[dim]}=${score}`)
    .join(", ");

  return `Candidate: ${candidate.builder_name} (@${candidate.builder_username})
Brief: ${candidate.brief_title} (${candidate.company})
Composite: ${candidate.composite_score}/100
Fingerprint: ${fp}
Highlight: ${candidate.highlight || "(none captured)"}
Receipt URL: ${receiptUrl}
${context?.trim() ? `Role context from the hiring company: ${context.trim()}` : "No role context provided — keep it general."}

Draft the outreach now.`;
}
