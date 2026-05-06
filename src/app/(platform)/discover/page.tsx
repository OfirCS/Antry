import type { Metadata } from "next";
import { getProjects } from "@/lib/supabase/queries";
import { getBuilders } from "@/lib/supabase/queries";
import { projects as mockProjects, builders as mockBuilders } from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import DiscoverClient from "./DiscoverClient";

const TITLE = "Discover — projects shipped on Antry";
const DESCRIPTION =
  "Browse real projects shipped by AI builders on Antry. Demo links, tech stacks, and signed Receipts that show how each one came together.";

export const metadata: Metadata = {
  title: "Discover",
  description: DESCRIPTION,
  alternates: { canonical: "/discover" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/discover",
    image: ogImageUrl({
      title: "Discover what builders ship.",
      subtitle: "Real projects. Live demos. Verifiable Receipts.",
      eyebrow: "Antry · Discover",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default async function DiscoverPage() {
  const [dbProjects, dbBuilders] = await Promise.all([
    getProjects(),
    getBuilders(),
  ]);

  const projects =
    dbProjects.length > 0
      ? dbProjects.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          category: p.category,
          techStack: p.tech_stack || [],
          gradient: p.gradient,
          likes: p.likes_count,
          createdAt: p.created_at,
          builder: {
            username: p.profiles?.username || "unknown",
            name: p.profiles?.full_name || "Unknown",
            gradient: p.profiles?.gradient || "",
          },
        }))
      : mockProjects.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          category: p.category,
          techStack: p.techStack,
          gradient: p.gradient,
          likes: p.likes,
          createdAt: p.createdAt,
          builder: p.builder,
        }));

  const builders =
    dbBuilders.length > 0
      ? dbBuilders.slice(0, 6).map((b) => ({
          id: b.id,
          username: b.username,
          name: b.full_name,
          tagline: b.bio ? (b.bio.includes(".") ? b.bio.split(".")[0] + "." : b.bio) : "",
          skills: b.skills || [],
          gradient: b.gradient,
          projectCount: b.project_count || 0,
        }))
      : mockBuilders.slice(0, 6).map((b) => ({
          id: b.id,
          username: b.username,
          name: b.name,
          tagline: b.tagline,
          skills: b.skills,
          gradient: b.gradient,
          projectCount: b.projectCount,
        }));

  return <DiscoverClient projects={projects} featuredBuilders={builders} />;
}
