import type { Metadata } from "next";
import { getHackathon } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import {
  getAntathon as getMockAntathon,
  getAntathonProjects as getMockAntathonProjects,
} from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import HackathonDetailClient from "./HackathonDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dbResult = await getHackathon(id).catch(() => null);

  const hackathon =
    dbResult?.hackathon ??
    (() => {
      const mock = getMockAntathon(id);
      return mock
        ? {
            title: mock.title,
            theme: mock.theme,
            description: mock.description,
            status: mock.status,
            participant_count: mock.participantCount,
          }
        : null;
    })();

  if (!hackathon) {
    return {
      title: "Hackathon not found",
      description: "This Antathon doesn't exist or hasn't started yet.",
      robots: { index: false, follow: true },
    };
  }

  const path = `/hackathons/${id}`;
  const title = `${hackathon.title} — Antathon`;
  const description =
    hackathon.theme ||
    hackathon.description?.slice(0, 160) ||
    "A focused build event for AI builders on Antry.";
  const subtitle =
    hackathon.theme ||
    `${hackathon.participant_count ?? 0} builders shipping · status: ${hackathon.status}`;
  const image = ogImageUrl({
    title: hackathon.title,
    subtitle,
    eyebrow: "Antathon",
    variant: "hackathon",
  });

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({ title, description, path, image }),
    twitter: defaultTwitter({ title, description, image }),
  };
}

export default async function AntathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get current user info
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasJoined = false;
  let userProjects: { id: string; title: string }[] = [];

  if (user) {
    // Check if user has joined this hackathon
    const { data: participation } = await supabase
      .from("hackathon_participants")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("hackathon_id", id)
      .single();

    hasJoined = !!participation;

    // Get user's projects for submission
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title")
      .eq("builder_id", user.id)
      .order("created_at", { ascending: false });

    userProjects = projects || [];
  }

  // Try Supabase first
  const dbResult = await getHackathon(id);

  if (dbResult) {
    const { hackathon, submissions, participants } = dbResult;

    // Check which of user's projects are already submitted
    const submittedProjectIds = submissions
      .map((s: Record<string, unknown>) => {
        const project = s.projects as Record<string, unknown> | null;
        return project?.id as string | undefined;
      })
      .filter(Boolean) as string[];

    // Build participant avatar list
    const participantAvatars = (participants || []).slice(0, 12).map((p: Record<string, unknown>) => {
      const profile = p.profiles as Record<string, unknown> | null;
      return {
        name: (profile?.full_name as string) || "Builder",
        gradient: (profile?.gradient as string) || "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
      };
    });

    return (
      <HackathonDetailClient
        event={{
          id: hackathon.id,
          title: hackathon.title,
          theme: hackathon.theme,
          description: hackathon.description,
          status: hackathon.status,
          gradient: `linear-gradient(135deg, #18181b 0%, #000000 100%)`,
          prizes: Array.isArray(hackathon.prizes) ? hackathon.prizes : [],
          sponsors: hackathon.sponsors || [],
          participantCount: hackathon.participant_count,
          submissionCount: hackathon.submission_count,
          startDate: hackathon.start_date,
          endDate: hackathon.end_date,
          participantAvatars,
          submissions: submissions.map((s: Record<string, unknown>) => {
            const project = s.projects as Record<string, unknown> | null;
            const profiles = project?.profiles as Record<string, unknown> | null;
            return {
              id: (project?.id as string) || (s.id as string),
              title: (project?.title as string) || "Untitled",
              tagline: (project?.tagline as string) || "",
              gradient:
                (project?.gradient as string) ||
                "linear-gradient(135deg, #262626 0%, #171717 100%)",
              builder: {
                name: (profiles?.full_name as string) || "Unknown",
                gradient:
                  (profiles?.gradient as string) ||
                  "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
              },
            };
          }),
        }}
        isLoggedIn={!!user}
        hasJoined={hasJoined}
        userProjects={userProjects}
        submittedProjectIds={submittedProjectIds}
      />
    );
  }

  // Fallback to mock data
  const mockEvent = getMockAntathon(id);

  if (!mockEvent) {
    return (
      <HackathonDetailClient
        event={null}
        isLoggedIn={!!user}
        hasJoined={false}
        userProjects={[]}
        submittedProjectIds={[]}
      />
    );
  }

  const mockSubmissions = getMockAntathonProjects(id);

  return (
    <HackathonDetailClient
      event={{
        id: mockEvent.id,
        title: mockEvent.title,
        theme: mockEvent.theme,
        description: mockEvent.description,
        status: mockEvent.status,
        gradient: mockEvent.gradient,
        prizes: mockEvent.prizes,
        sponsors: mockEvent.sponsors.map((s) => s.name),
        participantCount: mockEvent.participantCount,
        submissionCount: mockEvent.submissionCount,
        startDate: mockEvent.startDate,
        endDate: mockEvent.endDate,
        participantAvatars: [],
        submissions: mockSubmissions.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          gradient: p.gradient,
          builder: {
            name: p.builder.name,
            gradient: p.builder.gradient,
          },
        })),
      }}
      isLoggedIn={!!user}
      hasJoined={hasJoined}
      userProjects={userProjects}
      submittedProjectIds={[]}
    />
  );
}
