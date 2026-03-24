import { getBlogPost } from "@/lib/supabase/queries";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-8">
        <div className="text-center">
          <p className="text-text-tertiary text-[15px] mb-4 font-medium">
            This post doesn&apos;t exist or hasn&apos;t been published yet.
          </p>
          <Link
            href="/blog"
            className="text-accent font-semibold hover:underline text-[14px]"
          >
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-background-primary min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 pt-28 pb-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-text-tertiary hover:text-text-primary transition-colors mb-10 uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to blog
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              {post.category}
            </span>
            {post.read_time && (
              <span className="text-[11px] text-text-tertiary">
                {post.read_time} read
              </span>
            )}
          </div>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-text-primary tracking-[-0.02em] leading-[1.1] mb-4">
            {post.title}
          </h1>
          <p className="text-[16px] text-text-secondary leading-relaxed">
            {post.excerpt}
          </p>
          {publishedDate && (
            <p className="text-[13px] text-text-tertiary mt-4">
              {publishedDate}
            </p>
          )}
        </header>

        <article
          className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed text-text-secondary [&_h2]:text-text-primary [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:tracking-[-0.02em] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-text-primary [&_h3]:text-[18px] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/30 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-text-tertiary [&_code]:text-[13px] [&_code]:bg-background-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-background-secondary [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
