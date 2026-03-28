import { getBuilders } from "@/lib/supabase/queries";
import { builders as mockBuilders, projects as mockProjects } from "@/lib/mock-data";
import BuildersClient from "./BuildersClient";

export default async function BuildersPage() {
  const dbBuilders = await getBuilders();

  const useDb = dbBuilders.length > 0;

  const builders = useDb
      ? dbBuilders.map((b) => ({
        id: b.id,
        username: b.username,
        name: b.full_name,
        tagline: b.bio ? (b.bio.includes(".") ? b.bio.split(".")[0] + "." : b.bio) : "",
        skills: b.skills || [],
        gradient: b.gradient,
        projectCount: b.project_count ?? 0,
        totalLikes: b.total_likes ?? 0,
        joinedAt: b.created_at,
      }))
    : mockBuilders.map((b) => {
        const bp = mockProjects.filter((p) => p.builder.username === b.username);
        const likes = bp.reduce((s, p) => s + p.likes, 0);
        return {
          id: b.id,
          username: b.username,
          name: b.name,
          tagline: b.tagline,
          skills: b.skills,
          gradient: b.gradient,
          projectCount: bp.length,
          totalLikes: likes,
          joinedAt: b.joinedAt,
        };
      });

  return <BuildersClient builders={builders} />;
}
