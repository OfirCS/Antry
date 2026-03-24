import { getBlogPosts } from "@/lib/supabase/queries";
import BlogClient from "./BlogClient";

// Static fallback posts (used when Supabase returns empty)
const staticPosts = [
  {
    slug: "why-we-built-antry",
    title: "Why we built Antry",
    excerpt:
      "Resumes are broken. We asked: what if builders could be discovered by what they ship, not what they say? Here's the story behind Antry.",
    date: "2026-03-15",
    readTime: "5 min",
    category: "Story",
  },
  {
    slug: "wealthsimple-builder-program",
    title: "What we learned from Wealthsimple's builder experiment",
    excerpt:
      "Wealthsimple asked Canadians to build something instead of sending a resume. The results changed how we think about hiring forever.",
    date: "2026-03-10",
    readTime: "4 min",
    category: "Industry",
    externalUrl:
      "https://newsroom.wealthsimple.com/we-asked-canadians-to-build-something-instead-of-sending-a-resume-heres-what-happened",
  },
  {
    slug: "anatomy-of-a-great-builder-profile",
    title: "Anatomy of a great builder profile",
    excerpt:
      "We analyzed the top-performing profiles on Antry. Here are the 5 things they all have in common — and how to apply them to yours.",
    date: "2026-03-05",
    readTime: "6 min",
    category: "Guide",
  },
  {
    slug: "hackathons-that-matter",
    title: "Hackathons that actually matter",
    excerpt:
      "Most hackathons end with abandoned repos. Antathons are different — here's how we designed hackathons where projects survive past Sunday.",
    date: "2026-02-28",
    readTime: "4 min",
    category: "Product",
  },
  {
    slug: "ai-scout-agent",
    title: "Meet Scout: the AI that knows every builder",
    excerpt:
      "We built an AI agent that can search builders by skill, construct teams, compare profiles, and find demos — all through natural language.",
    date: "2026-02-20",
    readTime: "3 min",
    category: "Product",
  },
];

export default async function BlogPage() {
  const dbPosts = await getBlogPosts();

  const posts =
    dbPosts.length > 0
      ? dbPosts.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          date: p.published_at || p.created_at,
          readTime: p.read_time || "5 min",
          category: p.category,
        }))
      : staticPosts;

  return <BlogClient posts={posts} />;
}
