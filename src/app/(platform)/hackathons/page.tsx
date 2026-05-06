import type { Metadata } from "next";
import { getHackathons } from "@/lib/supabase/queries";
import { antathons as mockAntathons } from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import HackathonsClient from "./HackathonsClient";

const TITLE = "Antathons — 48-hour build events on Antry";
const DESCRIPTION =
  "Themed 48-hour build events for AI engineers. Ship something real, mint a Receipt, and let your work speak.";

export const metadata: Metadata = {
  title: "Antathons",
  description: DESCRIPTION,
  alternates: { canonical: "/hackathons" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/hackathons",
    image: ogImageUrl({
      title: "Antathons.",
      subtitle: "48-hour focused build events for AI engineers.",
      eyebrow: "Antry · Antathons",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default async function HackathonsPage() {
  const dbHackathons = await getHackathons();

  const hackathons =
    dbHackathons.length > 0
      ? dbHackathons.map((h) => ({
          id: h.id,
          title: h.title,
          theme: h.theme,
          status: h.status,
          gradient: `linear-gradient(135deg, #18181b 0%, #000000 100%)`,
          prizes: Array.isArray(h.prizes) ? h.prizes : [],
          participantCount: h.participant_count,
          startDate: h.start_date,
          endDate: h.end_date,
        }))
      : mockAntathons.map((h) => ({
          id: h.id,
          title: h.title,
          theme: h.theme,
          status: h.status,
          gradient: h.gradient,
          prizes: h.prizes,
          participantCount: h.participantCount,
          startDate: h.startDate,
          endDate: h.endDate,
        }));

  return <HackathonsClient hackathons={hackathons} />;
}
