import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  projectSchema,
  profileSchema,
} from "@/lib/schemas";

// ── loginSchema ─────────────────────────────────────

describe("loginSchema", () => {
  it("passes with valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("fails with missing email", () => {
    const result = loginSchema.safeParse({ password: "secret" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("fails with empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails with missing password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });

  it("fails with empty object", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ── signupSchema ────────────────────────────────────

describe("signupSchema", () => {
  it("passes with valid data", () => {
    const result = signupSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(true);
  });

  it("passes with optional invite code", () => {
    const result = signupSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      invite: "BETA123",
    });
    expect(result.success).toBe(true);
  });

  it("fails with name too short", () => {
    const result = signupSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = signupSchema.safeParse({
      name: "John Doe",
      email: "invalid",
      password: "securepassword",
    });
    expect(result.success).toBe(false);
  });

  it("fails with password too short (under 8 chars)", () => {
    const result = signupSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("fails with missing required fields", () => {
    const result = signupSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("passes with exactly 8-char password", () => {
    const result = signupSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("passes with exactly 2-char name", () => {
    const result = signupSchema.safeParse({
      name: "Jo",
      email: "jo@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(true);
  });
});

// ── projectSchema ───────────────────────────────────

describe("projectSchema", () => {
  const validProject = {
    title: "My Project",
    tagline: "A cool project built with love",
    description: "Full description here.",
    category: "ai-agents" as const,
    tech_stack: "React, Next.js",
    demo_url: "https://example.com",
    source_url: "https://github.com/user/repo",
    build_time: "2 weeks",
  };

  it("passes with valid data", () => {
    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("passes with minimal required fields", () => {
    const result = projectSchema.safeParse({
      title: "AB",
      tagline: "Short tagline here",
      category: "tools",
    });
    expect(result.success).toBe(true);
  });

  it("fails with title too short", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      title: "A",
    });
    expect(result.success).toBe(false);
  });

  it("fails with tagline too short", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      tagline: "Hi",
    });
    expect(result.success).toBe(false);
  });

  it("fails with title too long (over 100 chars)", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      title: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("fails with tagline too long (over 200 chars)", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      tagline: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid category", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      category: "not-a-category",
    });
    expect(result.success).toBe(false);
  });

  it("validates all valid categories", () => {
    const validCategories = ["ai-agents", "web-apps", "tools", "design", "data-ml", "mobile"];
    validCategories.forEach((category) => {
      const result = projectSchema.safeParse({
        ...validProject,
        category,
      });
      expect(result.success).toBe(true);
    });
  });

  it("fails with invalid demo_url", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      demo_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid source_url", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      source_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("passes with empty string for demo_url (optional)", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      demo_url: "",
    });
    expect(result.success).toBe(true);
  });

  it("passes with empty string for source_url (optional)", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      source_url: "",
    });
    expect(result.success).toBe(true);
  });

  it("fails with description over 2000 chars", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      description: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("fails with build_time over 50 chars", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      build_time: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });
});

// ── profileSchema ───────────────────────────────────

describe("profileSchema", () => {
  const validProfile = {
    full_name: "John Doe",
    username: "john-doe",
    bio: "I build things",
    skills: "React, TypeScript",
    github_url: "https://github.com/johndoe",
    twitter_url: "https://twitter.com/johndoe",
    website_url: "https://johndoe.dev",
  };

  it("passes with valid data", () => {
    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("passes with minimal required fields", () => {
    const result = profileSchema.safeParse({
      full_name: "Jo",
      username: "abc",
    });
    expect(result.success).toBe(true);
  });

  it("fails with name too short", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      full_name: "J",
    });
    expect(result.success).toBe(false);
  });

  it("fails with username too short", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("fails with username over 30 chars", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      username: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("fails with uppercase in username", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      username: "JohnDoe",
    });
    expect(result.success).toBe(false);
  });

  it("fails with spaces in username", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      username: "john doe",
    });
    expect(result.success).toBe(false);
  });

  it("allows hyphens in username", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      username: "john-doe-42",
    });
    expect(result.success).toBe(true);
  });

  it("fails with invalid github_url", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      github_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("passes with empty string for optional URLs", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      github_url: "",
      twitter_url: "",
      website_url: "",
    });
    expect(result.success).toBe(true);
  });

  it("fails with bio over 500 chars", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      bio: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("fails with full_name over 100 chars", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      full_name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
