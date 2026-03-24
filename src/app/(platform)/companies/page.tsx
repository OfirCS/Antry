import { getPlatformStats, getBuilders } from "@/lib/supabase/queries";
import {
  builders as mockBuilders,
  projects as mockProjects,
  antathons as mockAntathons,
} from "@/lib/mock-data";
import CompaniesClient from "./CompaniesClient";

export default async function CompaniesPage() {
  const dbStats = await getPlatformStats();
  const dbBuilders = await getBuilders();

  const mockTotalLikes = mockProjects.reduce((a, p) => a + p.likes, 0);

  // Use DB stats if we have builders, otherwise fallback to mock data counts
  const useDb = dbBuilders.length > 0;

  const stats = useDb
    ? {
        builderCount: dbStats.builderCount,
        projectCount: dbStats.projectCount,
        hackathonCount: dbStats.hackathonCount,
        totalLikes: dbStats.totalLikes,
      }
    : {
        builderCount: mockBuilders.length,
        projectCount: mockProjects.length,
        hackathonCount: mockAntathons.length,
        totalLikes: mockTotalLikes,
      };

  const builders = useDb
    ? dbBuilders.map((b) => {
        const bio = b.bio || "";
        return {
          id: b.id,
          username: b.username,
          name: b.full_name,
          tagline: bio.includes(".") ? bio.split(".")[0] + "." : bio,
          skills: b.skills || [],
          gradient: b.gradient,
          projectCount: b.project_count ?? 0,
          totalLikes: b.total_likes ?? 0,
        };
      })
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
        };
      });

  return <CompaniesClient stats={stats} builders={builders} />;
}
