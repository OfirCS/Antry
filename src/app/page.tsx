import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FeedCard, type PostKind } from "@/components/feed/FeedCard";
import { buildFeed } from "@/lib/feed/build";
import { getPosts } from "@/lib/posts/store";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { HeroStrip } from "@/components/home/HeroStrip";
import {
  FilterChips,
  type FilterKey,
} from "@/components/home/FilterChips";
import { FeedSkeleton } from "@/components/home/FeedSkeleton";
import { CompaniesRail } from "@/components/home/CompaniesRail";
import { HomeOnboardingBanner } from "@/app/(platform)/onboarding/_components/HomeOnboardingBanner";
import { Plus, TrendingUp, Trophy, Sparkles, Building2 } from "lucide-react";

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Resolve searchParams up-front — it's cheap and we need it for the
  // FilterChips active state (in the static shell). The feed itself
  // streams behind a Suspense boundary below.
  const sp = await searchParams;
  const active = parseFilter(sp.kind);

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

            <FilterChips active={active} />

            {/* Feed list — streams behind a Suspense boundary so the
                static shell (hero, compose, chips, rail) paints first. */}
            <Suspense
              key={active}
              fallback={<FeedSkeleton rows={6} />}
            >
              <FeedList filter={active} />
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
 * Async feed renderer. Awaits real + synth posts, filters by kind, and
 * renders the list (or the empty state). Lives inside a Suspense
 * boundary so the rest of the page is interactive while this resolves.
 */
async function FeedList({ filter }: { filter: FilterKey }) {
  const realPosts = await getPosts({ limit: 30 });
  const kindFilter: PostKind | undefined =
    filter === "all" ? undefined : (filter as PostKind);
  const synth = buildFeed({ kind: kindFilter });
  const realFiltered = kindFilter
    ? realPosts.filter((p) => p.kind === kindFilter)
    : realPosts;
  const feed = [...realFiltered, ...synth].slice(0, 40);

  if (feed.length === 0) {
    return <FeedEmpty filter={filter} />;
  }

  return (
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
        {isFiltered ? "Nothing here yet." : "Quiet feed today."}
      </p>
      <p className="mt-1.5 text-[13px] text-gray-500 max-w-[36ch] mx-auto leading-[1.5]">
        {isFiltered
          ? "First post wins the top slot. Receipts beat status updates."
          : "Ship something today. Your Receipt lands above the fold."}
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
