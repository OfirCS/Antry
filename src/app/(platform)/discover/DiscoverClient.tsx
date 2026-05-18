"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { getInitials, type Antathon, type Category } from "@/lib/mock-data";
import type { Brief } from "@/lib/receipts/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Cap on how many feed items receive a per-item stagger delay. Items beyond
 * this index animate in with no incremental delay, so long feeds don't accrue
 * a multi-second total animation. Reduced-motion users are already handled
 * globally by <MotionConfig reducedMotion="user"> in the platform layout.
 */
const STAGGER_LIMIT = 8;

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  category: Category;
  techStack: string[];
  gradient: string;
  likes: number;
  createdAt: string;
  builder: { username: string; name: string; gradient: string };
}

interface BuilderPreview {
  id: string;
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  gradient: string;
  projectCount: number;
}

type FeedKind = "all" | "builds" | "questions" | "collab" | "hackathons" | "briefs";

type FeedItem =
  | {
      id: string;
      kind: "build";
      title: string;
      body: string;
      href: string;
      builder: ProjectItem["builder"];
      meta: string;
      tags: string[];
      signal: number;
    }
  | {
      id: string;
      kind: "question" | "collab";
      title: string;
      body: string;
      href: string;
      builder: BuilderPreview;
      meta: string;
      tags: string[];
      signal: number;
    }
  | {
      id: string;
      kind: "hackathon";
      title: string;
      body: string;
      href: string;
      meta: string;
      tags: string[];
      signal: number;
      status: Antathon["status"];
    }
  | {
      id: string;
      kind: "brief";
      title: string;
      body: string;
      href: string;
      meta: string;
      tags: string[];
      signal: number;
      company: Brief["company"];
    };

const feedTabs: { key: FeedKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "builds", label: "Builds" },
  { key: "questions", label: "Questions" },
  { key: "collab", label: "Find people" },
  { key: "hackathons", label: "Hackathons" },
  { key: "briefs", label: "Briefs" },
];

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

const seededQuestions = [
  {
    id: "q-rag-evals",
    builderIndex: 0,
    title: "How are you testing RAG citations before shipping?",
    body: "I can catch bad retrieval, but citation drift is harder. What lightweight evals are people using before a demo goes public?",
    tags: ["RAG", "evals", "citations"],
    signal: 18,
  },
  {
    id: "q-agent-memory",
    builderIndex: 4,
    title: "Agent memory that does not turn into a research project?",
    body: "Need project-level memory for a coding agent. Most vector setups feel too heavy for a weekend product.",
    tags: ["agents", "memory", "MVP"],
    signal: 11,
  },
];

const seededCollabs = [
  {
    id: "c-voice-agent",
    builderIndex: 2,
    title: "Need a backend builder for a voice-agent experiment",
    body: "I have the interaction design and prototype. Looking for someone who likes realtime APIs and latency budgets.",
    tags: ["voice", "realtime", "agents"],
    signal: 9,
  },
  {
    id: "c-open-source",
    builderIndex: 3,
    title: "Who wants to build an MCP debugging tool?",
    body: "Inspector, logs, replay, and a clean local dashboard for Cursor, Codex, and Claude Code workflows.",
    tags: ["MCP", "devtools", "open source"],
    signal: 15,
  },
];

function buildFeed({
  projects,
  builders,
  hackathons,
  briefs,
}: {
  projects: ProjectItem[];
  builders: BuilderPreview[];
  hackathons: Antathon[];
  briefs: Brief[];
}): FeedItem[] {
  const buildItems: FeedItem[] = projects.slice(0, 7).map((project) => ({
    id: `build-${project.id}`,
    kind: "build",
    title: project.title,
    body: project.tagline,
    href: `/projects/${project.id}`,
    builder: project.builder,
    meta: `${dateFormatter.format(new Date(project.createdAt))} / shipped build`,
    tags: project.techStack.slice(0, 3),
    signal: project.likes,
  }));

  const questionItems: FeedItem[] = seededQuestions.map((item) => {
    const builder = builders[item.builderIndex % builders.length];
    return {
      id: item.id,
      kind: "question",
      title: item.title,
      body: item.body,
      href: `/builders/${builder.username}`,
      builder,
      meta: "Question / needs answers",
      tags: item.tags,
      signal: item.signal,
    };
  });

  const collabItems: FeedItem[] = seededCollabs.map((item) => {
    const builder = builders[item.builderIndex % builders.length];
    return {
      id: item.id,
      kind: "collab",
      title: item.title,
      body: item.body,
      href: `/builders/${builder.username}`,
      builder,
      meta: "Collab request / looking for builders",
      tags: item.tags,
      signal: item.signal,
    };
  });

  const hackathonItems: FeedItem[] = hackathons.slice(0, 3).map((hackathon) => ({
    id: `hackathon-${hackathon.id}`,
    kind: "hackathon",
    title: hackathon.title,
    body: hackathon.theme,
    href: `/hackathons/${hackathon.id}`,
    meta: `${hackathon.status} / ${hackathon.participantCount} builders`,
    tags: hackathon.sponsors.slice(0, 3).map((sponsor) => sponsor.name),
    signal: hackathon.submissionCount,
    status: hackathon.status,
  }));

  const briefItems: FeedItem[] = briefs.slice(0, 4).map((brief) => ({
    id: `brief-${brief.id}`,
    kind: "brief",
    title: brief.title,
    body: brief.tagline,
    href: `/briefs/${brief.slug}`,
    meta: `${brief.company.name} / median ${brief.median_score ?? "-"} / ${brief.receipts_count} receipts`,
    tags: [brief.difficulty, brief.category, "MCP"],
    signal: brief.attempts_count,
    company: brief.company,
  }));

  return [
    ...buildItems.slice(0, 2),
    questionItems[0],
    collabItems[0],
    hackathonItems[0],
    ...buildItems.slice(2, 4),
    briefItems[0],
    questionItems[1],
    ...buildItems.slice(4),
    collabItems[1],
    ...hackathonItems.slice(1),
    ...briefItems.slice(1),
  ].filter(Boolean);
}

function kindMeta(item: FeedItem): { label: string; icon: ReactNode; className: string } {
  if (item.kind === "build") {
    return { label: "Build", icon: <Code2 className="h-3.5 w-3.5" />, className: "bg-black text-white" };
  }
  if (item.kind === "question") {
    return { label: "Question", icon: <MessageSquare className="h-3.5 w-3.5" />, className: "bg-[#FFF7CC] text-black" };
  }
  if (item.kind === "collab") {
    return { label: "Find people", icon: <Users className="h-3.5 w-3.5" />, className: "bg-[#DFF3FF] text-black" };
  }
  if (item.kind === "hackathon") {
    return { label: "Hackathon", icon: <Trophy className="h-3.5 w-3.5" />, className: "bg-[#DDFBEA] text-black" };
  }
  return { label: "Brief", icon: <BriefcaseBusiness className="h-3.5 w-3.5" />, className: "bg-[#ECE7FF] text-black" };
}

function FeedCard({ item, index }: { item: FeedItem; index: number }) {
  const meta = kindMeta(item);
  const person = item.kind === "build" || item.kind === "question" || item.kind === "collab" ? item.builder : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index, STAGGER_LIMIT) * 0.018, ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-black/10 px-0 py-5 last:border-b-0 sm:px-1"
    >
      <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
        {person ? (
          <Link
            href={`/builders/${person.username}`}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white text-[12px] font-bold text-black"
          >
            {getInitials(person.name)}
          </Link>
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md text-[12px] font-bold text-white"
            style={{ background: item.kind === "brief" ? item.company.sponsor_color : "#111111" }}
          >
            {item.kind === "brief" ? item.company.name.charAt(0) : "H"}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-bold", meta.className)}>
              {meta.icon}
              {meta.label}
            </span>
            {person && (
              <Link href={`/builders/${person.username}`} className="text-[13px] font-bold text-black hover:underline">
                {person.name}
              </Link>
            )}
            <span className="text-[12px] font-medium text-gray-400">{item.meta}</span>
          </div>

          <Link href={item.href} className="mt-3 block">
            <h2 className="text-[20px] font-bold leading-[1.08] tracking-[-0.035em] text-black transition-colors group-hover:text-gray-700 sm:text-[24px]">
              {item.title}
            </h2>
            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.55] text-gray-600">{item.body}</p>
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-black/[0.04] px-2 py-1 text-[11px] font-semibold text-gray-500">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[12px] font-bold text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {item.signal}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </span>
            </div>
            <Link href={item.href} className="inline-flex items-center gap-1 text-[12px] font-bold text-black">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function DiscoverClient({
  projects,
  featuredBuilders,
  hackathons,
  briefs,
}: {
  projects: ProjectItem[];
  featuredBuilders: BuilderPreview[];
  hackathons: Antathon[];
  briefs: Brief[];
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FeedKind>("all");

  const feedItems = useMemo(
    () => buildFeed({ projects, builders: featuredBuilders, hackathons, briefs }),
    [briefs, featuredBuilders, hackathons, projects]
  );

  const filteredFeed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedItems.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "builds" && item.kind === "build") ||
        (activeTab === "questions" && item.kind === "question") ||
        (activeTab === "collab" && item.kind === "collab") ||
        (activeTab === "hackathons" && item.kind === "hackathon") ||
        (activeTab === "briefs" && item.kind === "brief");

      const haystack = [item.title, item.body, item.meta, ...item.tags].join(" ").toLowerCase();
      return matchesTab && (!q || haystack.includes(q));
    });
  }, [activeTab, feedItems, query]);

  const activeHackathon = hackathons.find((hackathon) => hackathon.status === "active") ?? hackathons[0];
  const featuredBrief = briefs[0];
  const topBuilders = featuredBuilders.slice(0, 4);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBFAF7] text-black">
      <section className="mx-auto max-w-[1160px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="grid gap-6 border-b border-black/10 pb-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Antry community</p>
            <h1 className="mt-3 max-w-[780px] text-[40px] font-bold leading-[0.96] tracking-[-0.05em] sm:text-[72px]">
              See what AI builders are making today.
            </h1>
            <p className="mt-4 max-w-[620px] text-[15px] leading-[1.6] text-gray-600 sm:text-[16px]">
              Demos, questions, collab requests, hackathons, and scored Briefs for people building with AI.
            </p>
          </div>

          <div className="min-w-0 border-t border-black/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <p className="text-[13px] font-semibold leading-[1.55] text-gray-700">
              Post work, ask for help, find collaborators, or open a Brief in Cursor, Codex, or Claude Code.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-black/10 pt-4">
              <Stat value={projects.length.toString()} label="builds" />
              <Stat value={featuredBuilders.length.toString()} label="builders" />
              <Stat value={briefs.length.toString()} label="briefs" />
            </div>
          </div>
        </header>

        <section className="border-b border-black/10 py-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <Link
              href="/submit"
              className="group flex min-w-0 items-center gap-3 rounded-md border border-black/10 bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:border-black/20"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-black text-white">
                <Plus className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-black">What are you building?</span>
                <span className="block truncate text-[12px] text-gray-500">Post a demo, question, or collab request</span>
              </span>
              <span className="hidden h-8 items-center rounded-md bg-black px-3 text-[12px] font-bold text-white sm:inline-flex">
                Post
              </span>
            </Link>
            <div className="relative w-full lg:max-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the feed"
                aria-label="Search the feed"
                className="h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-gray-400 focus:border-black/30"
              />
            </div>
          </div>
        </section>

        <section className="sticky top-[58px] z-30 -mx-4 border-b border-black/10 bg-[#FBFAF7]/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <nav aria-label="Feed filters" className="mx-auto flex max-w-[1160px] gap-1 overflow-x-auto">
            {feedTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={activeTab === tab.key}
                className={cn(
                  "h-9 shrink-0 rounded-md px-3 text-[12px] font-bold transition-colors",
                  activeTab === tab.key ? "bg-black text-white" : "text-gray-500 hover:bg-white hover:text-black"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </section>

        <section className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0">
            <div className="border-y border-black/10 bg-white/60 px-4 py-3 sm:px-5">
              <p
                aria-live="polite"
                className="text-[12px] font-bold uppercase tracking-[0.16em] text-gray-400"
              >
                {filteredFeed.length} posts / {activeTab === "all" ? "everything" : feedTabs.find((tab) => tab.key === activeTab)?.label}
              </p>
            </div>

            {filteredFeed.length > 0 ? (
              filteredFeed.map((item, index) => <FeedCard key={item.id} item={item} index={index} />)
            ) : (
              <EmptyState
                className="rounded-none border-x-0 border-b border-t-0"
                icon={<Search className="h-6 w-6" />}
                title={query ? "No posts match your search" : "Nothing here yet"}
                description={
                  query
                    ? "Try a different search term, or reset the feed to see everything."
                    : "There are no posts in this filter yet. Switch tabs or check back soon."
                }
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveTab("all");
                    }}
                    className="inline-flex h-9 items-center rounded-md bg-black px-4 text-[13px] font-bold text-white transition-colors hover:bg-gray-800"
                  >
                    Reset feed
                  </button>
                }
              />
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-[110px] lg:self-start">
            <Rail title="Start fast">
              <RailLink href="/submit" title="Share a build" description="Drop a demo, build log, or launch note." />
              <RailLink href="/builders" title="Find collaborators" description="Browse people by skills and shipped work." />
              <RailLink href="/hackathons" title="Join a hackathon" description="Build in public with teams and sponsors." />
              <RailLink href="/briefs" title="Prove skill with Briefs" description="One-click MCP starts for hiring-grade tasks." />
            </Rail>

            {activeHackathon && (
              <Rail title="Live now">
                <Link href={`/hackathons/${activeHackathon.id}`} className="group block">
                  <p className="text-[18px] font-bold leading-tight tracking-[-0.03em]">{activeHackathon.title}</p>
                  <p className="mt-2 text-[13px] leading-[1.5] text-gray-600">{activeHackathon.theme}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-black">
                    Open hackathon <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </Rail>
            )}

            {featuredBrief && (
              <Rail title="Hiring proof">
                <Link href={`/briefs/${featuredBrief.slug}`} className="group block">
                  <p className="text-[18px] font-bold leading-tight tracking-[-0.03em]">{featuredBrief.title}</p>
                  <p className="mt-2 text-[13px] leading-[1.5] text-gray-600">
                    {featuredBrief.company.name} / median {featuredBrief.median_score ?? "-"} / MCP start
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-black">
                    Start Brief <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </Rail>
            )}

            <Rail title="Builders">
              <div className="space-y-2">
                {topBuilders.map((builder) => (
                  <Link key={builder.id} href={`/builders/${builder.username}`} className="flex items-center gap-3 py-1.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black/10 bg-white text-[10px] font-bold text-black">
                      {getInitials(builder.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-black">{builder.name}</span>
                      <span className="block truncate text-[12px] text-gray-500">{builder.skills.slice(0, 2).join(" / ")}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Rail>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[24px] font-bold leading-none tracking-[-0.04em] text-black">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{label}</div>
    </div>
  );
}

function Rail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-black/10 pt-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function RailLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="group block border-b border-black/10 py-3 last:border-b-0">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold text-black">{title}</span>
        <ArrowRight className="h-3.5 w-3.5 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
      </span>
      <span className="mt-1 block text-[12px] leading-[1.45] text-gray-500">{description}</span>
    </Link>
  );
}
