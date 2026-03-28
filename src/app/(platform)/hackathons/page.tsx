import { getHackathons } from "@/lib/supabase/queries";
import { antathons as mockAntathons } from "@/lib/mock-data";
import HackathonsClient from "./HackathonsClient";

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
