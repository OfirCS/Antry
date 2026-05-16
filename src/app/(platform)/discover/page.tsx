import type { Metadata } from "next";
import DiscoverClient from "./DiscoverClient";
import { antathons, builders, projects } from "@/lib/mock-data";
import { demoBriefs } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter } from "@/lib/seo";

const TITLE = "Community - Antry";
const DESCRIPTION = "A feed for AI builders sharing projects, questions, build logs, hackathons, and professional Briefs.";

export const metadata: Metadata = {
  title: "Community",
  description: DESCRIPTION,
  alternates: { canonical: "/discover" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/discover",
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function DiscoverPage() {
  return (
    <DiscoverClient
      projects={projects}
      hackathons={antathons}
      briefs={demoBriefs.filter((brief) => brief.status === "live")}
      featuredBuilders={builders.map((builder) => ({
        id: builder.id,
        username: builder.username,
        name: builder.name,
        tagline: builder.tagline,
        skills: builder.skills,
        gradient: builder.gradient,
        projectCount: builder.projectCount,
      }))}
    />
  );
}
