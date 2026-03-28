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
          joinedAt: profile.created_at,
          skills: profile.skills || [],
          gradient: profile.gradient,
          social: {
            github: profile.github_url || undefined,
            twitter: profile.twitter_url || undefined,
            website: profile.website_url || undefined,
          },
          outsideProjects: [],
          projects: projects.map((p) => ({
            id: p.id,
            title: p.title,
            tagline: p.tagline,
            description: p.description,
            gradient: p.gradient,
            likes: p.likes_count,
            demoUrl: p.demo_url || "",
            sourceUrl: p.source_url || undefined,
            techStack: p.tech_stack || [],
            buildTime: p.build_time || undefined,
            category: p.category || undefined,
            createdAt: p.created_at || undefined,
          })),
          hackathons: hackathons.map((h) => ({
            id: h.id,
            title: h.title,
            theme: h.theme,
            status: h.status,
            gradient: h.gradient,
            prizes: Array.isArray(h.prizes) ? h.prizes : [],
            participantCount: h.participant_count,
            submissionCount: h.submission_count,
            startDate: h.start_date || undefined,
            endDate: h.end_date || undefined,
            sponsors: Array.isArray(h.sponsors) ? h.sponsors : [],
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
        joinedAt: mockBuilder.joinedAt,
        skills: mockBuilder.skills,
        gradient: mockBuilder.gradient,
        social: mockBuilder.social,
        outsideProjects: mockBuilder.outsideProjects,
        projects: mockProjects.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          gradient: p.gradient,
          likes: p.likes,
          demoUrl: p.demoUrl,
          sourceUrl: p.sourceUrl,
          techStack: p.techStack,
          buildTime: p.buildTime,
          category: p.category,
          createdAt: p.createdAt,
        })),
        hackathons: mockAntathons.map((h) => ({
          id: h.id,
          title: h.title,
          theme: h.theme,
          status: h.status,
          gradient: h.gradient,
          prizes: h.prizes,
          participantCount: h.participantCount,
          submissionCount: h.submissionCount,
          startDate: h.startDate,
          endDate: h.endDate,
          sponsors: h.sponsors,
        })),
      }}
    />
  );
}
