import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsNav } from "../_components/SettingsNav";
import { PortabilityClient } from "./PortabilityClient";

export const metadata: Metadata = {
  title: "Portability · Settings",
  description:
    "Take your Receipts off Antry. Embed in GitHub READMEs, link from LinkedIn, export as PDF.",
};

/**
 * Portability — the strategic page. A Receipt must work *off* Antry,
 * which is why the README badge, LinkedIn link, and PDF export each
 * get equal weight here. Username falls back to a placeholder when the
 * dev session has no resolved user, so the snippets still render.
 */
export default async function PortabilityPage() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/settings/portability");
  }

  // Resolve the visible handle. In dev — or before onboarding writes
  // the profile row — we fall back to a readable placeholder so the
  // copy/preview surfaces still demonstrate the feature.
  let username = "your-username";
  try {
    const { data: profile } = await sb
      .from("profiles")
      .select("username, full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.username) username = profile.username;
  } catch {
    // Keep the placeholder.
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
            Portability.
          </h1>
          <p
            className="mt-3 max-w-[560px] text-[14px] leading-[1.6]"
            style={{ color: "#525252" }}
          >
            Your Receipts work everywhere. Embed them in a README, pin them in
            LinkedIn, export the whole stack as a PDF resume.
          </p>
        </header>

        <SettingsNav />

        <PortabilityClient username={username} />
      </div>
    </div>
  );
}
