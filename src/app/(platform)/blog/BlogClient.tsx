"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  externalUrl?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="bg-background-primary min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 pt-28 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease }}
          className="mb-12"
        >
          <h1 className="font-display text-[32px] text-text-primary mb-3">
            Blog
          </h1>
          <p className="text-[15px] text-text-tertiary">
            Thoughts on building, hiring, and the future of talent discovery.
          </p>
        </motion.div>

        <div className="space-y-2">
          {posts.map((post, i) => {
            const Wrapper = post.externalUrl ? "a" : Link;
            const wrapperProps = post.externalUrl
              ? { href: post.externalUrl, target: "_blank", rel: "noopener noreferrer" }
              : { href: `/blog/${post.slug}` };

            return (
              <motion.div
                key={post.slug}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4, delay: i * 0.04, ease }}
              >
                <Wrapper
                  {...(wrapperProps as React.ComponentProps<"a"> & React.ComponentProps<typeof Link>)}
                  className="group block py-6 border-b border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="text-[17px] font-semibold text-text-primary group-hover:text-accent transition-colors mb-1.5">
                        {post.title}
                      </h2>
                      <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                      <span className="text-[12px] text-text-tertiary mt-2 block">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-text-tertiary text-[15px]">No posts yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
