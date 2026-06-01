import type { Metadata } from "next";
import { AntryChatHome } from "@/app/_landing/AntryChatHome";
import { getSeriousAiNews } from "@/lib/ai-news";
import { builders } from "@/lib/mock-data";
import { demoHackathons } from "@/lib/hackathons/demo";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Antry - Ask Antry.";
const DESCRIPTION =
  "Antry is a chat-first proof-of-work platform for AI builders, serious AI news, vibe coders, Briefs, Receipts, and hackathons.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/",
    image: ogImageUrl({
      title: "Ask Antry.",
      subtitle: "AI news, vibe coders, Briefs, Receipts, and hackathons in one chat.",
      eyebrow: "Antry",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default async function Home() {
  const news = await getSeriousAiNews(6);

  const featuredBuilders = builders.slice(0, 5).map((builder) => ({
    username: builder.username,
    name: builder.name,
    tagline: builder.tagline,
    skills: builder.skills.slice(0, 3),
    projectCount: builder.projectCount,
  }));

  const featuredBriefs = demoBriefs
    .filter((brief) => brief.status === "live")
    .slice(0, 5)
    .map((brief) => ({
      slug: brief.slug,
      title: brief.title,
      company: brief.company.name,
      difficulty: brief.difficulty,
      attempts: brief.attempts_count,
      receipts: brief.receipts_count,
    }));

  const featuredReceipts = demoReceipts.slice(0, 4).map((receipt) => ({
    id: receipt.id,
    title: receipt.brief_title,
    builder: receipt.builder.name,
    company: receipt.company.name,
    score: receipt.composite_score,
  }));

  const featuredHackathons = demoHackathons.slice(0, 3).map((hackathon) => ({
    slug: hackathon.slug,
    title: hackathon.title,
    theme: hackathon.theme,
    status: hackathon.status,
    participants: hackathon.participantCount,
  }));

  return (
    <AntryChatHome
      news={news}
      builders={featuredBuilders}
      briefs={featuredBriefs}
      receipts={featuredReceipts}
      hackathons={featuredHackathons}
    />
  );
}
