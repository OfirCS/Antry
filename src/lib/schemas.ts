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
