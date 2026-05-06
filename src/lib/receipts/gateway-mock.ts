// Realistic mock streaming source for the gateway. Used when
// ANTHROPIC_API_KEY is not configured. Mirrors Anthropic's SSE event
// shape so client-side stream parsers work identically against either.

export type SSEEvent = { event: string; data: string };

type MockTurn = {
  text: string;
  tools?: { name: string; type: "deterministic" | "generative" }[];
  inputTokens: number;
  outputTokens: number;
};

const MOCK_RESPONSES: MockTurn[] = [
  {
    text:
      "I'll start by mapping the corpus before any LLM-heavy work — knowing the document distribution shapes my chunking strategy.\n\nCalling file_search to summarize document types and lengths.",
    tools: [{ name: "file_search", type: "deterministic" }],
    inputTokens: 142,
    outputTokens: 96,
  },
  {
    text:
      "Found 2,387 docs across 4 types. Median 412 tokens. Marketing prose runs 2× the length of changelog entries — I'll use type-aware chunk sizes.\n\nNext: implement streaming with citation guards. I'll enforce citations through a structured-output schema pinned to corpus IDs so the model can't fabricate.",
    inputTokens: 0,
    outputTokens: 168,
  },
  {
    text:
      "Drafting the agent loop now. I'll test on three sample queries before scaling — cheaper to fail fast.",
    tools: [{ name: "code_run", type: "deterministic" }],
    inputTokens: 280,
    outputTokens: 142,
  },
  {
    text:
      "First sample query passed. Streaming first token at 380ms — well under the 600ms budget. Second query revealed citation drift on long answers; adding a hard length cap with explicit truncation.",
    tools: [{ name: "judge", type: "generative" }],
    inputTokens: 156,
    outputTokens: 248,
  },
  {
    text:
      "All three samples passing. Running the hold-out test: 12 queries, expecting ≥80% pass rate.\n\nResult: 11/12 passed. The single miss was a query that asked for a date that wasn't in the corpus — the agent correctly refused to fabricate. That's actually a feature, not a bug.\n\nReady to mint.",
    tools: [{ name: "code_run", type: "deterministic" }],
    inputTokens: 312,
    outputTokens: 188,
  },
];

// Stream a mock turn as SSE events that mirror Anthropic's shape.
export async function* mockStream(opts: {
  turnIndex: number;
}): AsyncGenerator<SSEEvent, void, unknown> {
  const turn = MOCK_RESPONSES[opts.turnIndex % MOCK_RESPONSES.length];
  if (!turn) return;

  // message_start event
  yield {
    event: "message_start",
    data: JSON.stringify({
      type: "message_start",
      message: {
        id: `msg_mock_${Date.now()}`,
        type: "message",
        role: "assistant",
        model: "claude-sonnet-4-6-mock",
        usage: { input_tokens: turn.inputTokens, output_tokens: 0 },
      },
    }),
  };

  // content_block_start
  yield {
    event: "content_block_start",
    data: JSON.stringify({
      type: "content_block_start",
      index: 0,
      content_block: { type: "text", text: "" },
    }),
  };

  // Stream text in word-sized chunks.
  const words = turn.text.split(/(\s+)/);
  for (const word of words) {
    yield {
      event: "content_block_delta",
      data: JSON.stringify({
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: word },
      }),
    };
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
  }

  // content_block_stop
  yield {
    event: "content_block_stop",
    data: JSON.stringify({ type: "content_block_stop", index: 0 }),
  };

  // Tool calls (if any)
  if (turn.tools) {
    for (const t of turn.tools) {
      yield {
        event: "content_block_start",
        data: JSON.stringify({
          type: "content_block_start",
          index: 1,
          content_block: { type: "tool_use", name: t.name, input: {} },
        }),
      };
      yield {
        event: "content_block_stop",
        data: JSON.stringify({ type: "content_block_stop", index: 1 }),
      };
    }
  }

  // message_delta with usage
  yield {
    event: "message_delta",
    data: JSON.stringify({
      type: "message_delta",
      delta: { stop_reason: "end_turn" },
      usage: { output_tokens: turn.outputTokens },
    }),
  };

  // message_stop
  yield {
    event: "message_stop",
    data: JSON.stringify({ type: "message_stop" }),
  };
}

export function mockToolsForTurn(turnIndex: number): {
  name: string;
  type: "deterministic" | "generative";
}[] {
  return MOCK_RESPONSES[turnIndex % MOCK_RESPONSES.length]?.tools ?? [];
}

export function mockInputTokensForTurn(turnIndex: number): number {
  return MOCK_RESPONSES[turnIndex % MOCK_RESPONSES.length]?.inputTokens ?? 0;
}

export function mockOutputTokensForTurn(turnIndex: number): number {
  return MOCK_RESPONSES[turnIndex % MOCK_RESPONSES.length]?.outputTokens ?? 0;
}
