import { describe, it, expect } from "vitest";
import {
  buildOutreachTemplate,
  buildOutreachPrompt,
  candidateFromReceipt,
  topDimensions,
  type OutreachCandidate,
} from "@/lib/scout/outreach";
import { demoReceipts } from "@/lib/receipts/demo-data";

const candidate: OutreachCandidate = {
  receipt_id: "rc_test_001",
  builder_username: "mara",
  builder_name: "Mara Vance",
  brief_title: "Streaming RAG with citation discipline",
  company: "Anthropic",
  composite_score: 87,
  fingerprint: {
    tokenEconomy: 80,
    throughput: 75,
    toolChoiceIQ: 95,
    recoveryIndex: 70,
    promptDiscipline: 72,
    verificationRigor: 91,
    spendVsJudgment: 78,
  },
  highlight: "Used file_search 14× before any LLM call.",
};

const RECEIPT_URL = "https://antry.com/receipts/rc_test_001";

describe("topDimensions()", () => {
  it("returns the strongest dimensions first", () => {
    const top = topDimensions(candidate.fingerprint, 2);
    expect(top).toEqual([
      { dim: "toolChoiceIQ", score: 95 },
      { dim: "verificationRigor", score: 91 },
    ]);
  });

  it("respects the n parameter", () => {
    expect(topDimensions(candidate.fingerprint, 3)).toHaveLength(3);
    expect(topDimensions(candidate.fingerprint)).toHaveLength(2);
  });
});

describe("buildOutreachTemplate()", () => {
  it("cites the candidate's actual evidence", () => {
    const draft = buildOutreachTemplate(candidate, RECEIPT_URL);

    // Subject carries the headline numbers.
    expect(draft.subject).toContain("87/100");
    expect(draft.subject).toContain("Streaming RAG with citation discipline");

    // Message greets by first name and cites score, Brief, company.
    expect(draft.message).toContain("Hi Mara,");
    expect(draft.message).toContain("87/100");
    expect(draft.message).toContain(
      '"Streaming RAG with citation discipline"'
    );
    // Indefinite article handled: "an Anthropic Brief", not "a Anthropic".
    expect(draft.message).toContain("an Anthropic Brief");

    // Top-2 dimensions appear with human labels + scores.
    expect(draft.message).toContain("Tool-Choice IQ 95");
    expect(draft.message).toContain("Verification Rigor 91");

    // Highlight + verifiable Receipt link.
    expect(draft.message).toContain(
      "Used file_search 14× before any LLM call."
    );
    expect(draft.message).toContain(RECEIPT_URL);

    // Attribution footer.
    expect(draft.message).toContain("— Sent via Antry Scout");
  });

  it("weaves in role context when provided", () => {
    const draft = buildOutreachTemplate(
      candidate,
      RECEIPT_URL,
      "Senior agent engineer, prod RAG"
    );
    expect(draft.message).toContain(
      "We're hiring for: Senior agent engineer, prod RAG"
    );
  });

  it("omits the role line when context is blank", () => {
    const draft = buildOutreachTemplate(candidate, RECEIPT_URL, "   ");
    expect(draft.message).not.toContain("We're hiring for:");
  });

  it("omits the highlight line when no highlight was captured", () => {
    const draft = buildOutreachTemplate(
      { ...candidate, highlight: "" },
      RECEIPT_URL
    );
    expect(draft.message).not.toContain("stood out from the trace");
  });

  it("falls back gracefully on an empty name", () => {
    const draft = buildOutreachTemplate(
      { ...candidate, builder_name: "  " },
      RECEIPT_URL
    );
    expect(draft.message).toContain("Hi there,");
  });
});

describe("buildOutreachPrompt()", () => {
  it("packs the full evidence block for the LLM", () => {
    const prompt = buildOutreachPrompt(candidate, RECEIPT_URL, "Prod ML role");
    expect(prompt).toContain("Mara Vance (@mara)");
    expect(prompt).toContain("87/100");
    expect(prompt).toContain("Tool-Choice IQ=95");
    expect(prompt).toContain(RECEIPT_URL);
    expect(prompt).toContain("Role context from the hiring company: Prod ML role");
  });

  it("signals when no role context exists", () => {
    const prompt = buildOutreachPrompt(candidate, RECEIPT_URL);
    expect(prompt).toContain("No role context provided");
  });
});

describe("candidateFromReceipt()", () => {
  it("maps a real demo Receipt to the drafting shape", () => {
    const receipt = demoReceipts[0];
    const c = candidateFromReceipt(receipt);
    expect(c.receipt_id).toBe(receipt.id);
    expect(c.builder_name).toBe(receipt.builder.name);
    expect(c.company).toBe(receipt.company.name);
    expect(c.composite_score).toBe(receipt.composite_score);
    expect(c.highlight).toBe(receipt.highlights[0] ?? "");
  });
});
