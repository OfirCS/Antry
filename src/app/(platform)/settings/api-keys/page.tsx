import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ApiKeysClient, type ApiKeyRow } from "./ApiKeysClient";

export const metadata: Metadata = {
  title: "API keys",
  description:
    "Manage your Antry MCP bearer tokens — mint, label, and revoke. Plaintext is shown once at mint time.",
};

export default async function ApiKeysPage() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/settings/api-keys");
  }

  // Lookup keys for this builder (admin client so we don't trip on RLS
  // race conditions during onboarding before profiles row exists).
  let keys: ApiKeyRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("api_keys")
      .select("id, label, created_at, last_used_at, revoked_at")
      .eq("owner_builder_id", user.id)
      .order("created_at", { ascending: false });
    keys = (data ?? []) as ApiKeyRow[];
  } catch {
    // DB unavailable — render empty list rather than crash. The mint flow
    // will surface the real error if the user tries to act.
    keys = [];
  }

  return <ApiKeysClient initialKeys={keys} />;
}
