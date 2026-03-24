import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase mock setup ─────────────────────────────

const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockInsertChain = vi.fn();
const mockDeleteChain = vi.fn();

let mockUser: { id: string } | null = { id: "user-123" };
let mockInsertError: { message: string } | null = null;
let mockExistingLike: { user_id: string } | null = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    const fromFn = (table: string) => {
      const chain: Record<string, any> = {};
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.neq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({ data: null, error: null });
      chain.select = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn((data) => {
        mockInsert(data);
        return { error: null };
      });
      chain.delete = vi.fn(() => {
        mockDelete();
        const dc: Record<string, any> = {};
        dc.eq = vi.fn().mockReturnValue(dc);
        return dc;
      });
      chain.update = vi.fn(() => {
        const uc: Record<string, any> = {};
        uc.eq = vi.fn().mockReturnValue(uc);
        return uc;
      });

      if (table === "projects") {
        chain.insert = vi.fn((data) => {
          mockInsert(data);
          return { error: mockInsertError };
        });
        chain.delete = vi.fn(() => {
          mockDelete();
          const dc: Record<string, any> = {};
          dc.eq = vi.fn().mockReturnValue(dc);
          return dc;
        });
      }

      if (table === "project_likes") {
        chain.select = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockExistingLike,
                error: mockExistingLike ? null : { code: "PGRST116" },
              }),
            }),
          }),
        });
        chain.insert = vi.fn((data) => {
          mockInsertChain(data);
          return { error: null };
        });
        chain.delete = vi.fn(() => {
          mockDeleteChain();
          const dc: Record<string, any> = {};
          dc.eq = vi.fn().mockReturnValue(dc);
          return dc;
        });
      }

      return chain;
    };

    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: fromFn,
    };
  }),
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  })),
}));

import {
  createProject,
  deleteProject,
  toggleLike,
} from "@/app/(platform)/actions";

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

// ── Tests ───────────────────────────────────────────

describe("createProject", () => {
  beforeEach(() => {
    mockUser = { id: "user-123" };
    mockInsertError = null;
    mockInsert.mockClear();
    mockDelete.mockClear();
  });

  it("calls supabase insert with valid form data", async () => {
    const fd = makeFormData({
      title: "My Project",
      tagline: "A cool project tagline",
      description: "Project description",
      category: "ai-agents",
      tech_stack: "React, Next.js",
      demo_url: "https://example.com",
      source_url: "https://github.com/user/repo",
      build_time: "2 weeks",
    });

    try {
      await createProject(null, fd);
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/dashboard");
      }
    }

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.title).toBe("My Project");
    expect(insertedData.builder_id).toBe("user-123");
    expect(insertedData.tech_stack).toEqual(["React", "Next.js"]);
    expect(insertedData.category).toBe("ai-agents");
  });

  it("returns field errors for invalid data", async () => {
    const fd = makeFormData({
      title: "A",
      tagline: "Hi",
      category: "invalid-cat",
    });

    const result = await createProject(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
    expect(Object.keys(result!.fieldErrors!).length).toBeGreaterThan(0);
  });

  it("returns field errors when title is missing", async () => {
    const fd = makeFormData({
      tagline: "A valid tagline here",
      category: "tools",
    });

    const result = await createProject(null, fd);
    expect(result).toBeDefined();
    expect(result!.fieldErrors).toBeDefined();
  });

  it("redirects to login when not authenticated", async () => {
    mockUser = null;

    const fd = makeFormData({
      title: "My Project",
      tagline: "A cool project tagline",
      category: "ai-agents",
    });

    try {
      await createProject(null, fd);
      expect.fail("Should have thrown redirect");
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/login?redirect=/submit");
      } else {
        throw e;
      }
    }
  });

  it("returns error when supabase insert fails", async () => {
    mockInsertError = { message: "Database error" };

    const fd = makeFormData({
      title: "My Project",
      tagline: "A cool project tagline",
      category: "ai-agents",
    });

    // The function should return the error, not throw
    let result;
    try {
      result = await createProject(null, fd);
    } catch (e) {
      // If redirect fires, it means the error wasn't caught
      if (isRedirectError(e)) {
        expect.fail("Should not redirect when insert fails");
      }
      throw e;
    }
    expect(result).toBeDefined();
    expect(result!.error).toBe("Failed to create project. Try again.");
  });
});

describe("deleteProject", () => {
  beforeEach(() => {
    mockUser = { id: "user-123" };
    mockDelete.mockClear();
  });

  it("calls supabase delete when authenticated", async () => {
    const fd = makeFormData({ project_id: "proj-1" });

    try {
      await deleteProject(fd);
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/dashboard");
      }
    }

    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("redirects to login when not authenticated", async () => {
    mockUser = null;
    const fd = makeFormData({ project_id: "proj-1" });

    try {
      await deleteProject(fd);
      expect.fail("Should have thrown redirect");
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/login");
      } else {
        throw e;
      }
    }
  });

  it("does nothing when project_id is missing", async () => {
    const fd = new FormData();
    await deleteProject(fd);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

describe("toggleLike", () => {
  beforeEach(() => {
    mockUser = { id: "user-123" };
    mockExistingLike = null;
    mockInsertChain.mockClear();
    mockDeleteChain.mockClear();
  });

  it("redirects to login when not authenticated", async () => {
    mockUser = null;
    const fd = makeFormData({ project_id: "proj-1" });

    try {
      await toggleLike(fd);
      expect.fail("Should have thrown redirect");
    } catch (e) {
      if (isRedirectError(e)) {
        expect(e.url).toBe("/login");
      } else {
        throw e;
      }
    }
  });

  it("does nothing when project_id is missing", async () => {
    const fd = new FormData();
    await toggleLike(fd);
    expect(mockInsertChain).not.toHaveBeenCalled();
    expect(mockDeleteChain).not.toHaveBeenCalled();
  });

  it("inserts a like when no existing like found", async () => {
    mockExistingLike = null;
    const fd = makeFormData({ project_id: "proj-1" });

    await toggleLike(fd);
    expect(mockInsertChain).toHaveBeenCalledWith({
      user_id: "user-123",
      project_id: "proj-1",
    });
  });

  it("deletes like when existing like found", async () => {
    mockExistingLike = { user_id: "user-123" };
    const fd = makeFormData({ project_id: "proj-1" });

    await toggleLike(fd);
    expect(mockDeleteChain).toHaveBeenCalledTimes(1);
  });
});
