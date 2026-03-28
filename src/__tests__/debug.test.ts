import { describe, it, expect, vi } from "vitest";

const mockSignUp = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: mockSignUp,
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: "x" }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

import { signup } from "@/app/(auth)/actions";

describe("debug signup", () => {
  it("should call signUp mock", async () => {
    const fd = new FormData();
    fd.set("name", "John Doe");
    fd.set("email", "john@example.com");
    fd.set("password", "securepassword");
    
    let result;
    let caught;
    try {
      result = await signup(null, fd);
    } catch (e: unknown) {
      caught = e;
    }

    console.log("result:", result);
    console.log("caught:", caught?.constructor?.name, (caught as Error)?.message);
    console.log("signUp called:", mockSignUp.mock.calls.length);
  });
});
