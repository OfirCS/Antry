import type { Metadata } from "next";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { OnboardingClient } from "./OnboardingClient";

const TITLE = "Welcome to Antry";
const DESCRIPTION =
  "Claim a username, connect Cursor, and mint your first signed Receipt — in 90 seconds.";

export const metadata: Metadata = {
  title: "Welcome",
  description: DESCRIPTION,
  alternates: { canonical: "/onboarding" },
  // Onboarding is a per-user flow — keep it out of the index.
  robots: { index: false, follow: true },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/onboarding",
    image: ogImageUrl({
      title: "Welcome to Antry.",
      subtitle: "Show how you code with AI. Get hired on it.",
      eyebrow: "ANTRY · ONBOARDING",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

/**
 * Onboarding shell — server component. The flow itself is fully
 * client-side (localStorage-only until auth lands) so all of the
 * interactive surface lives in OnboardingClient.
 */
export default function OnboardingPage() {
  return (
    <div
      style={{ background: "#FAFAF7" }}
      className="min-h-[calc(100vh-4rem)] flex items-start sm:items-center justify-center px-4 py-10 sm:py-16"
    >
      <OnboardingClient />
    </div>
  );
}
