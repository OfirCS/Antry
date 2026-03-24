import { vi } from "vitest";
import "@testing-library/dom";

// Mock next/navigation
vi.mock("next/navigation", () => {
  class RedirectError extends Error {
    digest: string;
    url: string;
    constructor(url: string) {
      super(`NEXT_REDIRECT:${url}`);
      this.digest = "NEXT_REDIRECT";
      this.url = url;
    }
  }
  return {
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}));
