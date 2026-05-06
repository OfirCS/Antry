import type { Metadata } from "next";
import { getBlogPost } from "@/lib/supabase/queries";
import Link from "next/link";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import BlogPostClient from "./BlogPostClient";
import { staticPosts, postContent } from "../posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dbPost = await getBlogPost(slug).catch(() => null);
  const staticPost = !dbPost ? staticPosts.find((p) => p.slug === slug) : null;

  const title = dbPost?.title || staticPost?.title;
  const description = dbPost?.excerpt || staticPost?.excerpt;
  const category = dbPost?.category || staticPost?.category || "Build Log";
  const author = staticPost?.author || "Antry";
  const publishedAt = dbPost?.published_at || staticPost?.date;

  if (!title || !description) {
    return {
      title: "Post not found",
      description: "This post doesn't exist or hasn't been published yet.",
      robots: { index: false, follow: true },
    };
  }

  const path = `/blog/${slug}`;
  const image = ogImageUrl({
    title,
    subtitle: `${category} · by ${author}`,
    eyebrow: "Build Log",
    variant: "blog",
  });

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...defaultOpenGraph({ title, description, path, image }),
      type: "article",
      publishedTime: publishedAt || undefined,
      authors: [author],
    },
    twitter: defaultTwitter({ title, description, image }),
  };
}

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
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#FAFAF7" }}>
      <div className="text-center">
        <p className="text-[15px] mb-4 font-medium" style={{ color: "#737373" }}>
          This post doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link
          href="/blog"
          className="font-semibold hover:underline text-[14px]"
          style={{ color: "#C6F135" }}
        >
          Back to blog
        </Link>
      </div>
    </div>
  );
}
