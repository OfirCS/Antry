"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { demoCompanies } from "@/lib/receipts/demo-data";

export type StartWorkspaceResult =
  | { ok: true; slug: string }
  | { ok: false; field?: "company_name" | "slug" | "email"; error: string };

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RESERVED_SLUGS = new Set([
  "start",
  "admin",
  "api",
  "app",
  "auth",
  "login",
  "signup",
  "settings",
  "support",
  "help",
  "new",
  "billing",
  "team",
]);

/**
 * Provision a workspace from the marketing /c/start form.
 *
 * v0: validates input, normalises the slug, parks the intent in a short-lived
 * cookie keyed by slug, then redirects to /c/[slug]. The actual tenant row is
 * created on first authenticated visit. Lets us ship the flow without forcing
 * full-stack auth into the marketing-side /c/start page.
 */
export async function startWorkspaceAction(
  _prev: StartWorkspaceResult | undefined,
  formData: FormData
): Promise<StartWorkspaceResult> {
  const companyName = String(formData.get("company_name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const plan = String(formData.get("plan") ?? "growth");

  if (companyName.length < 2) {
    return {
      ok: false,
      field: "company_name",
      error: "Company name must be at least 2 characters.",
    };
  }
  if (!SLUG_RE.test(rawSlug)) {
    return {
      ok: false,
      field: "slug",
      error:
        "Slug must be lowercase, 1–32 chars, letters/numbers/hyphens, no leading or trailing hyphen.",
    };
  }
  if (RESERVED_SLUGS.has(rawSlug)) {
    return { ok: false, field: "slug", error: "That slug is reserved." };
  }
  if (Object.values(demoCompanies).some((c) => c.slug === rawSlug)) {
    return { ok: false, field: "slug", error: "Slug already taken." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, field: "email", error: "Enter a valid work email." };
  }

  const jar = await cookies();
  jar.set(
    `antry_workspace_intent_${rawSlug}`,
    JSON.stringify({
      company_name: companyName,
      email,
      plan,
      created_at: new Date().toISOString(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    }
  );

  redirect(`/c/${rawSlug}?welcome=1`);
}
