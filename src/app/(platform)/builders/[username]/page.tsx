import { getBuilder as getBuilderFromDb } from "@/lib/supabase/queries";
import {
  getBuilder as getMockBuilder,
  getBuilderProjects as getMockBuilderProjects,
  getBuilderAntathons as getMockBuilderAntathons,
} from "@/lib/mock-data";
import BuilderProfileClient from "./BuilderProfileClient";

export default async function BuilderProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Try Supabase first
  const dbResult = await getBuilderFromDb(username);

  if (dbResult) {
    const { profile, projects, hackathons } = dbResult;
    const bio = profile.bio || "";
    const tagline = bio.includes(".") ? bio.split(".")[0] + "." : bio;

    return (
      <BuilderProfileClient
        builder={{
          username: profile.username,
          name: profile.full_name,
          tagline,
          bio,
          skills: profile.skills || [],
          gradient: profile.gradient,
          social: {
            github: profile.github_url || undefined,
            twitter: profile.twitter_url || undefined,
            website: profile.website_url || undefined,
          },
          projects: projects.map((p) => ({
            id: p.id,
            title: p.title,
            tagline: p.tagline,
            gradient: p.gradient,
            likes: p.likes_count,
            demoUrl: p.demo_url || "",
            sourceUrl: p.source_url || undefined,
            techStack: p.tech_stack || [],
          })),
          hackathons: hackathons.map((h) => ({
            id: h.id,
            title: h.title,
            theme: h.theme,
            status: h.status,
            prizes: Array.isArray(h.prizes) ? h.prizes : [],
            participantCount: h.participant_count,
          })),
        }}
      />
    );
  }

  // Fallback to mock data
  const mockBuilder = getMockBuilder(username);

  if (!mockBuilder) {
    return <BuilderProfileClient builder={null} />;
  }

  const mockProjects = getMockBuilderProjects(username);
  const mockAntathons = getMockBuilderAntathons(username);

  return (
    <BuilderProfileClient
      builder={{
        username: mockBuilder.username,
        name: mockBuilder.name,
        tagline: mockBuilder.tagline,
        bio: mockBuilder.bio,
        skills: mockBuilder.skills,
        gradient: mockBuilder.gradient,
        social: mockBuilder.social,
        projects: mockProjects.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          gradient: p.gradient,
          likes: p.likes,
          demoUrl: p.demoUrl,
          sourceUrl: p.sourceUrl,
          techStack: p.techStack,
        })),
        hackathons: mockAntathons.map((h) => ({
          id: h.id,
          title: h.title,
          theme: h.theme,
          status: h.status,
          prizes: h.prizes,
          participantCount: h.participantCount,
        })),
      }}
    />
  );
}
