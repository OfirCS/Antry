import type { Metadata } from "next";
import { getPlatformStats, getBuilders } from "@/lib/supabase/queries";
import {
  builders as mockBuilders,
  projects as mockProjects,
  antathons as mockAntathons,
} from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import CompaniesClient from "./CompaniesClient";

const TITLE = "For companies — hire AI engineers by what they shipped";
const DESCRIPTION =
  "Antry helps teams find AI engineers by signed Receipts — not résumés. Post a Brief, see how candidates think, hire on output.";

export const metadata: Metadata = {
  title: "For companies",
  description: DESCRIPTION,
  alternates: { canonical: "/companies" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/companies",
    image: ogImageUrl({
      title: "Hire by Receipt.",
      subtitle: "How AI engineers actually solve your problems.",
      eyebrow: "Antry · For companies",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

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
