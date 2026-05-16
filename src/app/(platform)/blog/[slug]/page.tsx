import { getBlogPost } from "@/lib/supabase/queries";
import Link from "next/link";
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

  return (
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#F7F8FA" }}>
      <div className="text-center">
        <p className="text-[15px] mb-4 font-medium" style={{ color: "#6B7280" }}>
          This post doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link
          href="/blog"
          className="font-semibold text-[#0A0A0A] hover:underline text-[14px]"
        >
          Back to blog
        </Link>
      </div>
    </div>
  );
}
