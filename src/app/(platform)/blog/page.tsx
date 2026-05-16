import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { staticPosts } from "./posts";
import { getBlogPosts } from "@/lib/supabase/queries";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Blog";
const DESCRIPTION =
  "Notes from Antry on shipped work, better Briefs, and proof-of-work hiring.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/blog",
    image: ogImageUrl({
      title: "Antry Blog",
      subtitle: "Proof-of-work hiring, Briefs, and builder signal.",
      eyebrow: "Blog",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default async function BlogPage() {
  const databasePosts = await getBlogPosts();
  const posts =
    databasePosts.length > 0
      ? databasePosts.map((post) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: post.published_at || new Date().toISOString(),
          readTime: post.read_time || "3 min",
          category: post.category,
          author: "Antry Team",
        }))
      : staticPosts;

  return <BlogClient posts={posts} />;
}
