import { getBuilders } from "@/lib/supabase/queries";
import { builders as mockBuilders } from "@/lib/mock-data";
import DiscoverClient from "./DiscoverClient";

export default async function DiscoverPage() {
  const dbBuilders = await getBuilders();

  // Map DB rows to the shape the client component expects
  const builders =
    dbBuilders.length > 0
      ? dbBuilders.map((b) => ({
          id: b.id,
          username: b.username,
          name: b.full_name,
          tagline: b.bio ? (b.bio.includes(".") ? b.bio.split(".")[0] + "." : b.bio) : "",
          skills: b.skills || [],
          gradient: b.gradient,
        }))
      : mockBuilders.map((b) => ({
          id: b.id,
          username: b.username,
          name: b.name,
          tagline: b.tagline,
          skills: b.skills,
          gradient: b.gradient,
        }));

  return <DiscoverClient builders={builders} />;
}
