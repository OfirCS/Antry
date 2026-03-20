"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const posts = [
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
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
      </div>
    </div>
  );
}
