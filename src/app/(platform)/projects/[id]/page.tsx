import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject as getDbProject } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import {
  getProject as getMockProject,
  projects as mockProjects,
  type Project,
} from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import ProjectDetailClient from "./ProjectDetailClient";

function mapDbProject(project: NonNullable<Awaited<ReturnType<typeof getDbProject>>>) {
  return {
    id: project.id,
    title: project.title,
    tagline: project.tagline,
    description: project.description,
    gradient: project.gradient || "linear-gradient(135deg, #262626 0%, #171717 100%)",
    likes: project.likes_count || 0,
    demoUrl: project.demo_url || "",
    sourceUrl: project.source_url || undefined,
    techStack: project.tech_stack || [],
    buildTime: project.build_time || "Shipped",
    category: project.category || "tools",
    createdAt: project.created_at,
    builder: {
      username: project.profiles?.username || "builder",
      name: project.profiles?.full_name || "Antry Builder",
      gradient:
        project.profiles?.gradient ||
        "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dbProject = await getDbProject(id).catch(() => null);
  const project = (dbProject ? mapDbProject(dbProject) : getMockProject(id)) ?? null;

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: true },
    };
  }

  const path = `/projects/${id}`;
  const title = `${project.title} by ${project.builder.name}`;
  const description =
    project.tagline ||
    `${project.title} — shipped by ${project.builder.name} on Antry.`;
  const techLine = project.techStack.length
    ? project.techStack.slice(0, 3).join(" · ")
    : project.category;
  const image = ogImageUrl({
    title: project.title,
    subtitle: `${project.builder.name}${techLine ? ` · ${techLine}` : ""}`,
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
  const dbProject = await getDbProject(id).catch(() => null);
  const project = (dbProject ? mapDbProject(dbProject) : getMockProject(id)) ?? null;

  if (!project) {
    // Unknown project id — render the 404 page.
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasLiked = false;

  if (user && project) {
    const { data } = await supabase
      .from("project_likes")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("project_id", project.id)
      .maybeSingle();

    hasLiked = Boolean(data);
  }

  const moreProjects: Project[] = mockProjects.filter((p) => p.id !== id);

  return (
    <ProjectDetailClient
      project={project}
      moreProjects={moreProjects}
      isLoggedIn={Boolean(user)}
      hasLiked={hasLiked}
    />
  );
}
