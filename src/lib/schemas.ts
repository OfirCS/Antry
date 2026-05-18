import { z } from "zod";

// ── Auth schemas ──────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  invite: z.string().nullish(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ── Project schemas ──────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(200),
  description: z.string().max(2000).nullish(),
  category: z.enum(["ai-agents", "web-apps", "tools", "design", "data-ml", "mobile"]),
  tech_stack: z.string().nullish(), // comma-separated
  demo_url: z.string().url("Must be a valid URL").nullish().or(z.literal("")),
  source_url: z.string().url("Must be a valid URL").nullish().or(z.literal("")),
  build_time: z.string().max(50).nullish(),
});

// ── Profile schemas ──────────────────────────────────────

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  bio: z.string().max(500).nullish(),
  skills: z.string().nullish(), // comma-separated
  github_url: z.string().url("Must be a valid URL").nullish().or(z.literal("")),
  twitter_url: z.string().url("Must be a valid URL").nullish().or(z.literal("")),
  website_url: z.string().url("Must be a valid URL").nullish().or(z.literal("")),
});

// ── API key schemas ──────────────────────────────────────

/** Body for POST /api/api-keys — mint a new API key for the caller. */
export const apiKeyCreateSchema = z.object({
  label: z.string().trim().min(1).max(80).default("Cursor MCP"),
});

// ── Hackathon schemas ────────────────────────────────────

/** Body for POST /api/hackathons — mint a hackathon. */
export const hackathonMintSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(80),
  vibe: z
    .enum(["speedrun", "build-night", "weekend-mode", "agent-cup"])
    .default("build-night"),
  durationHours: z.coerce.number().int().min(1).max(168).default(8),
  prize: z.string().max(200).default(""),
  briefSlugs: z
    .array(z.string().min(1))
    .min(1, "At least one brief is required")
    .max(10, "At most 10 briefs"),
});

// ── Gateway schemas ──────────────────────────────────────

/** A single chat turn in a gateway / agent request. */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(16000),
});

/** Body for POST /api/gateway/messages — instrumented LLM proxy. */
export const gatewayMessagesSchema = z
  .object({
    attempt_token: z.string().min(1).optional(),
    model: z.string().max(80).optional(),
    max_tokens: z.coerce.number().int().min(1).max(64000).optional(),
    messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  })
  .passthrough();

// ── Receipt schemas ──────────────────────────────────────

/** Path param for GET /api/v1/receipts/[id]/verify. */
export const receiptVerifyParamsSchema = z.object({
  id: z.string().trim().min(1, "Receipt id is required").max(200),
});

// ── Public API search schemas ────────────────────────────

/** Body for POST /api/v1/candidates/search. */
export const candidateSearchSchema = z.object({
  q: z.string().trim().min(1, "A search query is required").max(320),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});
