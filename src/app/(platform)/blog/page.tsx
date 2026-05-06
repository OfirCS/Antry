import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/supabase/queries";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import BlogClient from "./BlogClient";
import { staticPosts } from "./posts";

const TITLE = "Build log — Antry";
const DESCRIPTION =
  "Notes from building Antry in public. Why we measure how engineers think, what we shipped this week, and which builder you should be watching.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/blog",
    image: ogImageUrl({
      title: "Build log",
      subtitle: "Why we measure how engineers think.",
      eyebrow: "Antry · Blog",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

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
          author: "Antry Team",
        }))
      : staticPosts.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          date: p.date,
          readTime: p.readTime,
          category: p.category,
          author: p.author,
          externalUrl: p.externalUrl,
        }));

  return <BlogClient posts={posts} />;
}
