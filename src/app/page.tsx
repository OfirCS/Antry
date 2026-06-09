import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FeedCard, type PostKind, type Post } from "@/components/feed/FeedCard";
import { buildFeed, type FeedSort } from "@/lib/feed/build";
import { getPosts } from "@/lib/posts/store";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import { HeroStrip } from "@/components/home/HeroStrip";
import {
  FilterChips,
  type FilterKey,
} from "@/components/home/FilterChips";
import { FeedSkeleton } from "@/components/home/FeedSkeleton";
import { CompaniesRail } from "@/components/home/CompaniesRail";
import { SortToggle, type SortKey } from "@/components/home/SortToggle";
import { TrendingRail } from "@/components/home/TrendingRail";
import { HomeOnboardingBanner } from "@/app/(platform)/onboarding/_components/HomeOnboardingBanner";
import { Pin, Plus, TrendingUp, Trophy, Sparkles, Building2, Hash } from "lucide-react";

const TITLE = "Antry";
const DESCRIPTION =
  "Shipping replays, not interview replays. Mint signed Receipts as you build. One Receipt, every job board.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/",
    image: ogImageUrl({
      title: "Antry",
      subtitle: "Shipping replays, not interview replays.",
      eyebrow: "ANTRY",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

/** Search-param filter keys (mirror FilterChips). */
const FILTER_KEYS = new Set<FilterKey>([
  "all",
  "receipt",
  "hack-win",
  "hack-launch",
  "build",
]);

function parseFilter(raw: string | string[] | undefined): FilterKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && FILTER_KEYS.has(v as FilterKey)) return v as FilterKey;
  return "all";
}

/** Sort param — "hot" or anything else falls back to "new". */
function parseSort(raw: string | string[] | undefined): SortKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "hot" ? "hot" : "new";
}

/** Topic slug — single-token kebab-case. Anything else → null. */
function parseTopic(raw: string | string[] | undefined): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return null;
  // Defensive: only accept short kebab slugs so we don't render arbitrary text.
  if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(v)) return null;
  return v;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Resolve searchParams up-front — it's cheap and we need it for the
  // FilterChips active state (in the static shell). The feed itself
  // streams behind a Suspense boundary below.
  const sp: { [key: string]: string | string[] | undefined } =
    process.env.STATIC_EXPORT === "1" ? {} : await searchParams;
  const active = parseFilter(sp.kind);
  const sort = parseSort(sp.sort);
  const topic = parseTopic(sp.topic);

  // Right rail data — synchronous, cheap, no awaits.
  const topBuilders = [...demoReceipts]
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, 5);

  const hotBriefs = [...demoBriefs]
    .sort((a, b) => b.attempts_count - a.attempts_count)
    .slice(0, 6);

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <Nav />
      <main className="pt-16 pb-24 sm:pb-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-10 pt-4 sm:pt-6">
          {/* ── Feed column ──────────────────────────── */}
          <section>
            <HomeOnboardingBanner />
            <HeroStrip />

            {/* Compose chip */}
            <div
              className="rounded-[14px] p-2.5 sm:p-3 mb-3 flex items-center gap-3"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBEBEB",
              }}
            >
              <div
                className="w-9 h-9 rounded-full shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #C6F135 100%)",
                }}
              />
              <Link
                href="/compose"
                className="flex-1 min-w-0 truncate text-left text-[14px] text-gray-500 hover:text-gray-700 transition-colors"
              >
                Post a build, not a status…
              </Link>
              <Link
                href="/compose"
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-11 sm:h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                <Plus className="w-3.5 h-3.5" /> Post
              </Link>
            </div>

            {/* Filter chips + sort toggle share a row. SortToggle is a
                client component (URL navigation via useSearchParams), so
                it lives inside its own Suspense boundary per Next docs to
                let the surrounding shell prerender. Hidden on mobile. */}
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <FilterChips active={active} />
              </div>
              <Suspense fallback={null}>
                <SortToggle active={sort} />
              </Suspense>
            </div>

            {/* Feed list — streams behind a Suspense boundary so the
                static shell (hero, compose, chips, rail) paints first.
                The key includes filter/sort/topic so changing any of them
                resets the boundary and shows the skeleton again. */}
            <Suspense
              key={`${active}|${sort}|${topic ?? ""}`}
              fallback={<FeedSkeleton rows={6} />}
            >
              <FeedList filter={active} sort={sort} topic={topic} />
            </Suspense>
          </section>

          {/* ── Right rail ───────────────────────────── */}
          <aside className="hidden lg:block space-y-4">
            <RailCard
              title="Hot Briefs"
              icon={<TrendingUp className="w-3 h-3" />}
            >
              <ul className="space-y-px -mx-1">
                {hotBriefs.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/briefs/${b.slug}`}
                      className="block rounded-[8px] px-1 py-1 group hover:bg-[#FAFAF7]"
                    >
                      <p className="text-[12px] font-bold tracking-[-0.005em] text-black leading-[1.25] group-hover:underline underline-offset-2 line-clamp-1">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {b.attempts_count} attempts · {b.difficulty}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>

            <RailCard title="Trending" icon={<Hash className="w-3 h-3" />}>
              <TrendingRail />
            </RailCard>

            <RailCard
              title="Top this week"
              icon={<Trophy className="w-3 h-3" />}
              pulse
            >
              <ul className="space-y-2">
                {topBuilders.map((r, i) => (
                  <li key={r.id}>
                    <Link
                      href={`/u/${r.builder.username}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <span
                        className="font-display font-bold text-[12px] w-4 text-right"
                        style={{
                          color:
                            i === 0
                              ? "#FF6B35"
                              : i < 3
                                ? "#0A0A0A"
                                : "#737373",
                        }}
                      >
                        {i + 1}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: r.builder.gradient }}
                      >
                        {r.builder.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-black truncate group-hover:underline underline-offset-2">
                          {r.builder.name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          @{r.builder.username}
                        </p>
                      </div>
                      <span className="font-display font-bold text-[14px] text-black">
                        {r.composite_score}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>

            <RailCard
              title="325 companies hiring"
              icon={<Building2 className="w-3 h-3" />}
            >
              <CompaniesRail />
            </RailCard>

            <RailCard title="Run a hack" icon={<Sparkles className="w-3 h-3" />}>
              <p className="text-[11px] leading-[1.5] text-gray-500 mb-2.5">
                Bundle Briefs into a vibe hackathon.
              </p>
              <Link
                href="/hackathons/new"
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-all hover:-translate-y-0.5 w-full"
                style={{ background: "#FF6B35", color: "#FFFFFF" }}
              >
                Start
              </Link>
            </RailCard>
          </aside>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}

/**
 * Async feed renderer. Awaits real + synth posts, filters by kind, sorts
 * (newest vs hot), and renders the list (or the empty state). Lives
 * inside a Suspense boundary so the rest of the page is interactive
 * while this resolves.
 *
 * When a `topic` is active we also surface a small pinned card above
 * the feed list — the homepage doesn't filter the feed by topic yet,
 * so the pin is the only topic context for v0.
 */
async function FeedList({
  filter,
  sort,
  topic,
}: {
  filter: FilterKey;
  sort: SortKey;
  topic: string | null;
}) {
  const realPosts = await getPosts({ limit: 30 });
  const kindFilter: PostKind | undefined =
    filter === "all" ? undefined : (filter as PostKind);
  // Map UI sort key → buildFeed contract (1:1 today, kept explicit for clarity).
  const feedSort: FeedSort = sort === "hot" ? "hot" : "new";
  const synth = buildFeed({ kind: kindFilter, sort: feedSort });
  const realFiltered = kindFilter
    ? realPosts.filter((p) => p.kind === kindFilter)
    : realPosts;
  // For "hot", interleave real posts then re-sort by the same hot signal so
  // the user-posted content participates in the ranking; for "new", real
  // posts stay on top (they're already timestamp-sorted, and they're fresh
  // by definition).
  const merged = [...realFiltered, ...synth];
  if (sort === "hot") {
    const now = latestPostTime(merged);
    merged.sort((a, b) => feedHotScore(b, now) - feedHotScore(a, now));
  }
  const feed = merged.slice(0, 40);

  const pinned = topic ? pickPinned(topic, realPosts) : null;

  if (feed.length === 0 && !pinned) {
    return <FeedEmpty filter={filter} />;
  }

  return (
    <>
      {pinned && <PinnedTopicCard topic={topic!} post={pinned} />}
      {feed.length === 0 ? (
        <FeedEmpty filter={filter} />
      ) : (
        <div
          className="rounded-[14px] overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EBEBEB",
          }}
        >
          {feed.map((p) => (
            <FeedCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Local copy of the synth feed's hot score so we can re-rank the merged
 * (real + synth) list. Same formula as `lib/feed/build.ts#hotScore`:
 *   score = likes*3 + comments*2 + recencyBoost(0..20 over 7 days)
 */
function feedHotScore(p: Post, now: number): number {
  const ageMs = Math.max(0, now - new Date(p.at).getTime());
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 20 - ageDays * (20 / 7));
  return p.reactions.likes * 3 + p.reactions.comments * 2 + recencyBoost;
}

function latestPostTime(posts: Post[]): number {
  return posts.reduce((latest, post) => {
    const time = Date.parse(post.at);
    return Number.isFinite(time) ? Math.max(latest, time) : latest;
  }, 0);
}

/**
 * Hardcoded topic → pinned post selection for v0.
 *
 *  - streaming-rag: top public Receipt for `streaming-rag-pipeline`.
 *  - cursor-tips:   the latest real "build" post, if any.
 *  - everything else: no pin.
 *
 * Returns a `Post` shaped for FeedCard, so the pinned slot reuses the
 * same accent system and layout as the rest of the feed.
 */
function pickPinned(topic: string, realPosts: Post[]): Post | null {
  if (topic === "streaming-rag") {
    const receipts = demoReceipts
      .filter(
        (r) =>
          r.brief_slug === "streaming-rag-pipeline" &&
          r.display_visibility === "public"
      )
      .sort((a, b) => b.composite_score - a.composite_score);
    const r = receipts[0];
    if (!r) return null;
    const tier = fingerprintTier(r.composite_score);
    const kind: PostKind = r.composite_score >= 80 ? "hack-win" : "receipt";
    return {
      id: `pin_r_${r.id}`,
      kind,
      author: {
        username: r.builder.username,
        name: r.builder.name,
        gradient: r.builder.gradient,
      },
      verb:
        kind === "hack-win"
          ? "topped the leaderboard on"
          : "minted a Receipt on",
      headline: r.brief_title,
      subtext: r.highlights[0],
      badges: [r.company.name.toLowerCase(), tier.label.toLowerCase()],
      href: `/receipts/${r.id}`,
      at: r.signed_at,
      metric: { label: "Score", value: String(r.composite_score) },
      reactions: { likes: 0, comments: 0 },
    };
  }

  if (topic === "cursor-tips") {
    // realPosts is already created_at desc → first build is "latest build".
    const latestBuild = realPosts.find((p) => p.kind === "build");
    return latestBuild ?? null;
  }

  return null;
}

/**
 * Small editorial "Top in #<topic>" card that sits above the main feed
 * list when a topic filter is active. The inner card is a real FeedCard
 * so it inherits the accent stripe + engagement actions; the wrapper is
 * just the eyebrow and hairline frame.
 */
function PinnedTopicCard({ topic, post }: { topic: string; post: Post }) {
  return (
    <div
      className="rounded-[14px] overflow-hidden mb-3"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div
        className="px-4 pt-3 pb-2 flex items-center gap-1.5"
        style={{ borderBottom: "1px solid #EBEBEB" }}
      >
        <Pin className="w-3 h-3 text-gray-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
          Top in
        </span>
        <span className="text-[11px] font-bold tracking-[-0.005em] text-black">
          #{topic}
        </span>
      </div>
      <FeedCard post={post} />
    </div>
  );
}

/** Warmer, actionable empty state with an inline Compose CTA. */
function FeedEmpty({ filter }: { filter: FilterKey }) {
  const isFiltered = filter !== "all";
  return (
    <div
      className="rounded-[14px] px-6 py-10 text-center"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <p className="font-display text-[18px] font-bold tracking-[-0.02em] text-black">
        {isFiltered ? "No posts in this category yet." : "Quiet feed today."}
      </p>
      <p className="mt-1.5 text-[13px] text-gray-500 max-w-[40ch] mx-auto leading-[1.5]">
        {isFiltered ? (
          <>
            <Link
              href="/compose"
              className="font-bold text-black hover:underline underline-offset-2"
            >
              Compose one
            </Link>
            <span aria-hidden> →</span>
          </>
        ) : (
          "Be first."
        )}
      </p>
      <div className="mt-4 inline-flex items-center gap-2">
        <Link
          href="/compose"
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
          style={{ background: "#0A0A0A", color: "#FFFFFF" }}
        >
          <Plus className="w-3.5 h-3.5" /> Compose
        </Link>
        {isFiltered && (
          <Link
            href="/"
            className="inline-flex items-center justify-center px-3 h-9 text-[13px] font-bold text-gray-600 hover:text-black transition-colors"
          >
            View all
          </Link>
        )}
      </div>
    </div>
  );
}

function RailCard({
  title,
  icon,
  pulse,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3 inline-flex items-center gap-1.5">
        {icon}
        {title}
        {pulse && (
          <span
            aria-hidden
            className="relative inline-flex w-1.5 h-1.5 ml-0.5"
          >
            <span
              className="absolute inset-0 rounded-full opacity-60 animate-ping"
              style={{ background: "#FF6B35" }}
            />
            <span
              className="relative inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#FF6B35" }}
            />
          </span>
        )}
      </h3>
      {children}
    </div>
  );
}
