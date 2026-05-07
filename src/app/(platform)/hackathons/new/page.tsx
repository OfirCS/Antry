import type { Metadata } from "next";
import { VibeHackathonLauncher } from "./VibeHackathonLauncher";
import { demoBriefs } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Run a Vibe Hackathon";
const DESCRIPTION =
  "Bundle 1–10 Briefs, set a window, share one URL. Builders work in their real IDE via Antry MCP. Receipts mint to a leaderboard you control.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/hackathons/new" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/hackathons/new",
    image: ogImageUrl({
      title: "Run a Vibe Hackathon.",
      subtitle: "Real IDE. Signed Receipts. Live leaderboard.",
      eyebrow: "Antry · for hosts",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function NewHackathonPage() {
  // Server-side: pass the live Brief catalog to the launcher.
  // Real version pulls from the briefs table; demo data mirrors the
  // catalog the candidate sees on /briefs.
  const briefs = demoBriefs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    tagline: b.tagline,
    difficulty: b.difficulty,
    category: b.category,
    time_cap_seconds: b.time_cap_seconds,
    token_cap: b.token_cap,
    sponsor_color: b.company.sponsor_color,
    sponsor_name: b.company.name,
  }));

  return <VibeHackathonLauncher briefs={briefs} />;
}
