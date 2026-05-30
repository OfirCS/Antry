import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { SettingsNav } from "../_components/SettingsNav";
import { ApiKeysClient, type ApiKeyRow } from "./ApiKeysClient";

export const metadata: Metadata = {
  title: "Cursor · Settings",
  description:
    "Manage your Antry MCP bearer tokens — mint, label, and revoke. Plaintext is shown once at mint time.",
  robots: { index: false, follow: false },
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

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      <div className="mx-auto max-w-[760px] px-6 sm:px-10 py-12 sm:py-16">
        <header className="mb-8">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#737373" }}
          >
            Settings
          </p>
          <h1
            className="mt-2 font-display font-bold tracking-[-0.03em]"
            style={{ color: "#0A0A0A", fontSize: "clamp(2rem, 4.2vw, 2.5rem)" }}
          >
            Cursor.
          </h1>
          <p
            className="mt-3 max-w-[560px] text-[14px] leading-[1.6]"
            style={{ color: "#525252" }}
          >
            Bearer tokens authenticate your IDE against the Antry MCP gateway.
            Plaintext is shown once at mint time — copy it into your Cursor
            config immediately.
          </p>
        </header>

        <SettingsNav />

        <ApiKeysClient initialKeys={keys} />
      </div>
    </div>
  );
}
