import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isDomainScopedAgentQuery,
  loadAgentDatasetStrict,
  runAgent,
} from "@/lib/agent/engine";
import { checkAgentRateLimit } from "@/lib/agent/rate-limit";

const requestSchema = z.object({
  message: z.string().trim().min(2).max(320),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(320),
      })
    )
    .max(6)
    .optional(),
});

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const userAgent = (request.headers.get("user-agent") || "na").slice(0, 80);
  return `${ip}:${userAgent}`;
}

function countWords(input: string): number {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function hasAbusivePayload(message: string): boolean {
  const lower = message.toLowerCase();
  const urlCount = (message.match(/https?:\/\//g) || []).length;

  return (
    countWords(message) > 60 ||
    urlCount > 2 ||
    /([a-z0-9])\1{9,}/i.test(message) ||
    lower.includes("ignore previous instructions") ||
    lower.includes("repeat this")
  );
}

export async function POST(request: Request) {
  try {
    const limit = checkAgentRateLimit(getClientKey(request));
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit reached. Try again soon.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
          },
        }
      );
    }

    const payload = await request.json();
    const parsed = requestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const totalHistoryChars = (parsed.data.history || []).reduce(
      (sum, turn) => sum + turn.content.length,
      0
    );

    if (totalHistoryChars > 1400 || hasAbusivePayload(parsed.data.message)) {
      return NextResponse.json(
        {
          error:
            "Scout is limited to short, focused product queries while free access is active.",
        },
        { status: 413 }
      );
    }

    if (!isDomainScopedAgentQuery(parsed.data.message)) {
      return NextResponse.json(
        {
          error:
            "Scout only answers Antry queries (builders, projects, hackathons, teams, comparisons, and stats).",
        },
        { status: 422 }
      );
    }

    const dataset = await loadAgentDatasetStrict();
    if (!dataset) {
      return NextResponse.json(
        {
          error: "Scout data source is unavailable right now.",
        },
        { status: 503 }
      );
    }

    const result = runAgent(
      parsed.data.message,
      parsed.data.history || [],
      dataset
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to process request",
      },
      { status: 500 }
    );
  }
}
