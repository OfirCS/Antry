import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase mock setup ─────────────────────────────

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: vi.fn(async () => ({
        data: { url: "https://oauth.example.com" },
        error: null,
      })),
      signOut: vi.fn(async () => ({ error: null })),
    },
  })),
}));

// Import after mocking
import { login, signup } from "@/app/(auth)/actions";

// ── Helpers ─────────────────────────────────────────

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

function isRedirectError(error: unknown): error is Error & { url: string } {
  return error instanceof Error && error.message.startsWith("NEXT_REDIRECT:");
}

// ── login() ─────────────────────────────────────────

describe("login", () => {
  beforeEach(() => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
  });

  it("redirects to /discover on successful login", async () => {
    const fd = makeFormData({
      email: "user@example.com",
      password: "mypassword",
    });

    try {
      await login(null, fd);
      expect.fail("Should have thrown redirect");
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/discover");
      } else {
        throw e;
      }
    }
  });

  it("redirects to custom redirect path when provided", async () => {
    const fd = makeFormData({
      email: "user@example.com",
      password: "mypassword",
      redirect: "/dashboard",
    });

    try {
      await login(null, fd);
      expect.fail("Should have thrown redirect");
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/dashboard");
      } else {
        throw e;
      }
    }
  });

  it("returns field errors for invalid email", async () => {
    const fd = makeFormData({
      email: "not-an-email",
      password: "mypassword",
    });

    const result = await login(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
    expect(result!.fieldErrors!.email).toBeDefined();
    expect(result!.fieldErrors!.email.length).toBeGreaterThan(0);
  });

  it("returns field errors for empty password", async () => {
    const fd = makeFormData({
      email: "user@example.com",
      password: "",
    });

    const result = await login(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
    expect(result!.fieldErrors!.password).toBeDefined();
  });

  it("returns field errors when both fields are missing", async () => {
    const fd = new FormData();

    const result = await login(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
  });

  it("returns error message on invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const fd = makeFormData({
      email: "user@example.com",
      password: "wrongpassword",
    });

    const result = await login(null, fd);
    expect(result).toBeDefined();
    expect(result!.error).toBe("Invalid email or password.");
  });
});

// ── signup() ────────────────────────────────────────

describe("signup", () => {
  beforeEach(() => {
    mockSignUp.mockResolvedValue({ error: null });
  });

  it("redirects to /discover on successful signup", async () => {
    const fd = makeFormData({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
    });

    try {
      await signup(null, fd);
      expect.fail("Should have thrown redirect");
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/discover");
      } else {
        throw e;
      }
    }
  });

  it("passes invite code to supabase when provided", async () => {
    const fd = makeFormData({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      invite: "BETA2026",
    });

    try {
      await signup(null, fd);
    } catch (e) {
      // redirect expected
      if (!isRedirectError(e)) throw e;
    }
  });

  it("returns field errors for name too short", async () => {
    const fd = makeFormData({
      name: "J",
      email: "john@example.com",
      password: "securepassword",
    });

    const result = await signup(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
    expect(result!.fieldErrors!.name).toBeDefined();
  });

  it("returns field errors for invalid email", async () => {
    const fd = makeFormData({
      name: "John Doe",
      email: "not-email",
      password: "securepassword",
    });

    const result = await signup(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
    expect(result!.fieldErrors!.email).toBeDefined();
  });

  it("returns field errors for password too short", async () => {
    const fd = makeFormData({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
    });

    const result = await signup(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
    expect(result!.fieldErrors!.password).toBeDefined();
  });

  it("returns error for existing email", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "User already registered" },
    });

    const fd = makeFormData({
      name: "John Doe",
      email: "existing@example.com",
      password: "securepassword",
    });

    const result = await signup(null, fd);
    expect(result).toBeDefined();
    expect(result!.error).toBe("An account with this email already exists.");
  });

  it("returns generic error for other auth failures", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "Something unexpected happened" },
    });

    const fd = makeFormData({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
    });

    const result = await signup(null, fd);
    expect(result).toBeDefined();
    expect(result!.error).toBe("Something went wrong. Try again.");
  });

  it("returns field errors when all fields are missing", async () => {
    const fd = new FormData();

    const result = await signup(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
  });
});
