import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilder as getBuilderFromDb } from "@/lib/supabase/queries";
import {
  getBuilder as getMockBuilder,
  getBuilderProjects as getMockBuilderProjects,
  getBuilderAntathons as getMockBuilderAntathons,
} from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import BuilderProfileClient from "./BuilderProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const dbResult = await getBuilderFromDb(username).catch(() => null);

  let name: string | null = null;
  let bio = "";
  let skills: string[] = [];
  let projectCount = 0;

  if (dbResult) {
    name = dbResult.profile.full_name;
    bio = dbResult.profile.bio || "";
    skills = dbResult.profile.skills || [];
    projectCount = dbResult.projects.length;
  } else {
    const mock = getMockBuilder(username);
    if (mock) {
      name = mock.name;
      bio = mock.bio;
      skills = mock.skills;
      projectCount = getMockBuilderProjects(username).length;
    }
  }

  if (!name) {
    return {
      title: `@${username}`,
      description: "Builder profile not found.",
      robots: { index: false, follow: true },
    };
  }

  const path = `/builders/${username}`;
  const title = `${name} (@${username})`;
  const tagline = bio.includes(".") ? bio.split(".")[0] + "." : bio;
  const description =
    tagline ||
    `${name} ships projects on Antry${skills.length ? ` — ${skills.slice(0, 3).join(", ")}` : ""}.`;
  const image = ogImageUrl({
    title: name,
    subtitle: `${projectCount} shipped${skills.length ? ` · ${skills.slice(0, 3).join(" · ")}` : ""}`,
    eyebrow: "Builder",
    variant: "builder",
  });

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({ title, description, path, image }),
    twitter: defaultTwitter({ title, description, image }),
  };
}

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
          hackathons: hackathons.map((h) => {
            // h.sponsors is text[] in the schema; coerce to SponsorItem[].
            const rawSponsors = (h as { sponsors?: unknown }).sponsors;
            const sponsors: { name: string; tier: string }[] = Array.isArray(rawSponsors)
              ? rawSponsors.map((s) =>
                  typeof s === "string"
                    ? { name: s, tier: "" }
                    : (s as { name: string; tier: string })
                )
              : [];
            // h.gradient isn't in the row schema; fall back to the per-builder gradient.
            const gradient =
              (h as { gradient?: string }).gradient ||
              "linear-gradient(135deg, #18181b 0%, #000000 100%)";
            return {
              id: h.id,
              title: h.title,
              theme: h.theme,
              status: h.status,
              gradient,
              prizes: Array.isArray(h.prizes) ? (h.prizes as { place: string; reward: string }[]) : [],
              participantCount: h.participant_count,
              submissionCount: h.submission_count,
              startDate: h.start_date || undefined,
              endDate: h.end_date || undefined,
              sponsors,
            };
          }),
        }}
      />
    );
  }

  // Fallback to mock data
  const mockBuilder = getMockBuilder(username);

  if (!mockBuilder) {
    // No DB profile and no mock builder for this username — render 404.
    notFound();
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
