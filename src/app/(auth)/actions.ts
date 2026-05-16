"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, resetPasswordSchema } from "@/lib/schemas";

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

async function getRequestOrigin() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost || headerStore.get("host");

  if (host) {
    const forwardedProto = headerStore.get("x-forwarded-proto");
    const protocol =
      forwardedProto || (host.startsWith("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const redirectTo = formData.get("redirect") as string;
  redirect(redirectTo || "/discover");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    invite: formData.get("invite"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
        invite_code: parsed.data.invite || null,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: "Something went wrong. Try again." };
  }

  redirect("/discover");
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const origin = await getRequestOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=auth");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = await getRequestOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=auth");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ── Reset password ──────────────────────────────────────

export async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/auth/callback?next=/settings`,
    }
  );

  if (error) {
    return { error: "Failed to send reset email. Try again." };
  }

  // Always return success to avoid leaking whether the email exists
  return { success: "If an account exists with that email, a reset link has been sent." };
}
