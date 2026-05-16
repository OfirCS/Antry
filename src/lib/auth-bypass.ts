import type { User } from "@supabase/supabase-js";

export const AUTH_BYPASS_USER_ID = "00000000-0000-4000-8000-000000000001";

export const AUTH_BYPASS_USER = {
  id: AUTH_BYPASS_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "testing@antry.local",
  app_metadata: {
    provider: "testing",
    providers: ["testing"],
  },
  user_metadata: {
    full_name: "Testing Builder",
    name: "Testing Builder",
    username: "testing-builder",
  },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
} as User;

export function isAuthBypassEnabled() {
  const publicBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";
  const serverBypass =
    typeof window === "undefined" && process.env.AUTH_BYPASS === "true";

  return process.env.NODE_ENV !== "production" && (publicBypass || serverBypass);
}

type MutableClientWithAuthGetUser = {
  auth: {
    getUser: (...args: unknown[]) => unknown;
  };
};

export function attachAuthBypass<TClient>(client: TClient) {
  (client as MutableClientWithAuthGetUser).auth.getUser = async () => ({
    data: { user: AUTH_BYPASS_USER },
    error: null,
  });

  return client;
}
