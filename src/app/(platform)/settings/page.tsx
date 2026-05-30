import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsNav } from "./_components/SettingsNav";
import { SettingsCard } from "./_components/SettingsCard";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Claim your identity: name, handle, bio, and the links that make a Receipt yours.",
};

/**
 * Settings hub — hero-less. Editorial header band, then a single white
 * card with the Profile form. Sub-nav lives at the top of every
 * /settings page for one-tap switching to Cursor / Portability.
 */
export default async function SettingsPage() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/settings");
  }

  const { data: profile } = await sb
    .from("profiles")
    .select(
      "full_name, username, bio, skills, github_url, twitter_url, website_url"
    )
    .eq("id", user.id)
    .maybeSingle();

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
            Profile.
          </h1>
        </header>

        <SettingsNav />

        <SettingsCard
          title="Identity"
          caption="The name, handle and links that show on your public builder card."
        >
          <ProfileForm initial={profile ?? null} />
        </SettingsCard>
      </div>
    </div>
  );
}
