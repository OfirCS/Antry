import type { Metadata } from "next";
import {
  getProject as getProjectFromDb,
  getProjects as getProjectsFromDb,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import {
  getProject as getMockProject,
  getBuilderProjects as getMockBuilderProjects,
} from "@/lib/mock-data";
import type { Project } from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import ProjectDetailClient from "./ProjectDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dbProject = await getProjectFromDb(id).catch(() => null);
  const project =
    dbProject ??
    (() => {
      const mock = getMockProject(id);
      return mock
        ? {
            title: mock.title,
            tagline: mock.tagline,
            description: mock.description,
            tech_stack: mock.techStack,
            profiles: { full_name: mock.builder.name, username: mock.builder.username },
          }
        : null;
    })();

  if (!project) {
    return {
      title: "Project not found",
      description: "This project doesn't exist or hasn't been published yet.",
      robots: { index: false, follow: true },
    };
  }

  const builderName =
    "profiles" in project && project.profiles ? project.profiles.full_name : "an Antry builder";
  const techStack = (project.tech_stack || []).slice(0, 4).join(" · ");
  const subtitle = project.tagline || project.description?.slice(0, 140) || "";
  const path = `/projects/${id}`;
  const title = `${project.title} — by ${builderName}`;
  const description = project.tagline || project.description?.slice(0, 160) || "A shipped project on Antry.";
  const image = ogImageUrl({
    title: project.title,
    subtitle: subtitle || `By ${builderName}${techStack ? ` · ${techStack}` : ""}`,
    eyebrow: "Project",
    variant: "project",
  });

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({ title, description, path, image }),
    twitter: defaultTwitter({ title, description, image }),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get current user and check like status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("project_likes")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("project_id", id)
      .single();
    hasLiked = !!like;
  }

  // Try Supabase first
  const dbProject = await getProjectFromDb(id);

  if (dbProject && dbProject.profiles) {
    const profile = dbProject.profiles;

    // Get more projects from the same builder
    const allProjects = await getProjectsFromDb();
    const moreFromBuilder = allProjects
      .filter(
        (p) =>
          p.id !== dbProject.id &&
          p.profiles?.username === profile.username
      )
      .map(
        (p): Project => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          demoUrl: p.demo_url || "",
          sourceUrl: p.source_url || undefined,
          techStack: p.tech_stack || [],
          buildTime: p.build_time,
          category: p.category as Project["category"],
          builder: {
            username: p.profiles?.username || "",
            name: p.profiles?.full_name || "",
            gradient:
              p.profiles?.gradient ||
              "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
          },
          likes: p.likes_count,
          createdAt: p.created_at,
          gradient: p.gradient,
        })
      );

    return (
      <ProjectDetailClient
        project={{
          id: dbProject.id,
          title: dbProject.title,
          tagline: dbProject.tagline,
          description: dbProject.description,
          gradient: dbProject.gradient,
          likes: dbProject.likes_count,
          demoUrl: dbProject.demo_url || "",
          sourceUrl: dbProject.source_url || undefined,
          techStack: dbProject.tech_stack || [],
          buildTime: dbProject.build_time,
          category: dbProject.category,
          createdAt: dbProject.created_at,
          builder: {
            username: profile.username,
            name: profile.full_name,
            gradient: profile.gradient,
          },
        }}
        moreProjects={moreFromBuilder}
        isLoggedIn={!!user}
        hasLiked={hasLiked}
      />
    );
  }

  // Fallback to mock data
  const mockProject = getMockProject(id);

  if (!mockProject) {
    return <ProjectDetailClient project={null} moreProjects={[]} isLoggedIn={!!user} hasLiked={false} />;
  }

  const more = getMockBuilderProjects(mockProject.builder.username).filter(
    (p) => p.id !== mockProject.id
  );

  return (
    <ProjectDetailClient
      project={{
        id: mockProject.id,
        title: mockProject.title,
        tagline: mockProject.tagline,
        description: mockProject.description,
        gradient: mockProject.gradient,
        likes: mockProject.likes,
        demoUrl: mockProject.demoUrl,
        sourceUrl: mockProject.sourceUrl,
        techStack: mockProject.techStack,
        buildTime: mockProject.buildTime,
        category: mockProject.category,
        createdAt: mockProject.createdAt,
        builder: mockProject.builder,
      }}
      moreProjects={more}
      isLoggedIn={!!user}
      hasLiked={hasLiked}
    />
  );
}
