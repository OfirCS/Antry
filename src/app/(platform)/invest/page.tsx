"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  Rocket,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Lightbulb,
  DollarSign,
  Users,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { startupIdeas } from "@/lib/mock-data";
import type { StartupIdea } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

const stageLabels: Record<string, string> = {
  idea: "Idea Stage",
  mvp: "MVP",
  seed: "Seed",
  "series-a": "Series A",
};

const stageColors: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700",
  mvp: "bg-blue-100 text-blue-700",
  seed: "bg-emerald-100 text-emerald-700",
  "series-a": "bg-amber-100 text-amber-700",
};

const categories = Array.from(
  new Set(startupIdeas.map((s) => s.category))
).sort();

function StartupCard({ idea }: { idea: StartupIdea }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="group rounded-xl border border-border-primary bg-surface p-6 hover:border-text-tertiary/30 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-[14px] font-bold text-white shrink-0"
              style={{ background: idea.gradient }}
            >
              {idea.title.charAt(0)}
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
                {idea.title}
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href={`/builders/${idea.builder.username}`}
                  className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  by {idea.builder.name}
                </Link>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    stageColors[idea.stage]
                  }`}
                >
                  {stageLabels[idea.stage]}
                </span>
              </div>
            </div>
          </div>
          {idea.demoUrl && (
            <a
              href={idea.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg border border-border-primary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-text-tertiary/40 transition-all shrink-0"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <p className="text-[14px] text-text-secondary mb-4 leading-relaxed">
          {idea.pitch}
        </p>

        {/* Traction */}
        {idea.traction && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-[12px] font-medium text-emerald-700">
              {idea.traction}
            </span>
          </div>
        )}

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {idea.techStack.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium text-text-tertiary bg-background-secondary px-1.5 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-secondary">
          <div className="flex items-center gap-4 text-[12px] text-text-tertiary">
            {idea.fundingGoal && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Seeking {idea.fundingGoal}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" /> {idea.likes} signals
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {idea.seeking.slice(0, 2).map((s) => (
              <span
                key={s}
                className="text-[10px] font-medium text-accent bg-accent/5 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function InvestPage() {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return startupIdeas.filter((s) => {
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.pitch.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase()) ||
        s.techStack.some((t) =>
          t.toLowerCase().includes(query.toLowerCase())
        );

      const matchesStage =
        stageFilter === "all" || s.stage === stageFilter;

      const matchesCategory =
        categoryFilter === "all" || s.category === categoryFilter;

      return matchesQuery && matchesStage && matchesCategory;
    });
  }, [query, stageFilter, categoryFilter]);

  const totalFunding = startupIdeas.reduce((sum, s) => {
    const match = s.fundingGoal?.match(/\$([0-9.]+)([KMB]?)/i);
    if (!match) return sum;
    const num = parseFloat(match[1]);
    const mult = match[2]?.toUpperCase() === "M" ? 1_000_000 : match[2]?.toUpperCase() === "K" ? 1_000 : 1;
    return sum + num * mult;
  }, 0);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16 sm:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Rocket className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-widest text-emerald-500">
            Startup Hub
          </span>
        </div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] tracking-tight text-text-primary mb-2">
          Discover the next big idea
        </h1>
        <p className="text-[16px] text-text-secondary max-w-[520px]">
          Browse startups from verified builders. Every project has real
          traction, live demos, and a proven track record.
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          {
            icon: Lightbulb,
            label: "Active Startups",
            value: startupIdeas.length,
            color: "#8B5CF6",
          },
          {
            icon: DollarSign,
            label: "Total Seeking",
            value: `$${(totalFunding / 1_000_000).toFixed(1)}M`,
            color: "#10B981",
          },
          {
            icon: Users,
            label: "Verified Builders",
            value: new Set(startupIdeas.map((s) => s.builder.username)).size,
            color: "#3B82F6",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border-primary bg-surface p-4 text-center"
          >
            <stat.icon
              className="h-4 w-4 mx-auto mb-2"
              style={{ color: stat.color }}
            />
            <div className="text-[20px] font-semibold text-text-primary tabular-nums">
              {stat.value}
            </div>
            <div className="text-[11px] text-text-tertiary">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-8 space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search startups by name, category, or tech..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border-primary rounded-xl text-[14px] outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/10 text-text-primary placeholder:text-text-tertiary transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-tertiary" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-border-primary bg-surface text-text-secondary outline-none"
          >
            <option value="all">All Stages</option>
            <option value="idea">Idea</option>
            <option value="mvp">MVP</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-border-primary bg-surface text-text-secondary outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-[12px] text-text-tertiary ml-auto">
            {filtered.length} startups
          </span>
        </div>
      </motion.div>

      {/* Startup List */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[15px] text-text-tertiary">
              No startups match your criteria.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setStageFilter("all");
                setCategoryFilter("all");
              }}
              className="text-[13px] text-accent font-medium mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((idea) => (
            <StartupCard key={idea.id} idea={idea} />
          ))
        )}
      </motion.div>

      {/* Investor CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 rounded-2xl border border-border-primary bg-surface p-8 sm:p-10 text-center"
      >
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] tracking-tight text-text-primary mb-2">
          Are you an investor?
        </h2>
        <p className="text-[14px] text-text-secondary mb-6 max-w-[420px] mx-auto">
          Get early access to startups built by verified builders. See real
          traction data, live demos, and verified project histories before
          anyone else.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get investor access <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/companies">
              For companies <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
