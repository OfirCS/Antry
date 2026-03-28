import { getBlogPosts } from "@/lib/supabase/queries";
import BlogClient from "./BlogClient";
import { staticPosts } from "./posts";

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
