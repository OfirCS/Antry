import type { Metadata } from "next";
import { getBuilders } from "@/lib/supabase/queries";
import { builders as mockBuilders, projects as mockProjects } from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import BuildersClient from "./BuildersClient";

const TITLE = "Builders — AI engineers shipping on Antry";
const DESCRIPTION =
  "Find AI builders by what they shipped. Real projects, signed Receipts, and verifiable Builder Fingerprints.";

export const metadata: Metadata = {
  title: "Builders",
  description: DESCRIPTION,
  alternates: { canonical: "/builders" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/builders",
    image: ogImageUrl({
      title: "Builders shipping on Antry.",
      subtitle: "Find engineers by Receipt — not résumé.",
      eyebrow: "Antry · Builders",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

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
