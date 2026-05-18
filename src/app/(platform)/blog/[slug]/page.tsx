import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/supabase/queries";
import BlogPostClient from "./BlogPostClient";
import { staticPosts, postContent } from "../posts";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  // Try database first, then fall back to static posts
  if (post) {
    return (
      <BlogPostClient
        post={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          read_time: post.read_time,
          published_at: post.published_at,
          author: "Antry Team",
        }}
      />
    );
  }

  // Check static posts
  const staticPost = staticPosts.find((p) => p.slug === slug);
  const content = postContent[slug];

  if (staticPost && content) {
    return (
      <BlogPostClient
        post={{
          slug: staticPost.slug,
          title: staticPost.title,
          excerpt: staticPost.excerpt,
          content: content,
          category: staticPost.category,
          read_time: staticPost.readTime,
          published_at: staticPost.date,
          author: staticPost.author,
        }}
      />
    );
  }

  // No DB post and no static post for this slug — render the 404 page.
  notFound();
}
