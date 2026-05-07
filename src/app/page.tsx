import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FeedCard } from "@/components/feed/FeedCard";
import { buildFeed } from "@/lib/feed/build";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { Plus, TrendingUp, Trophy } from "lucide-react";

const TITLE = "Antry";
const DESCRIPTION =
  "The feed for vibe coders. Ship in public, mint Receipts, win hackathons.";

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
      subtitle: "The feed for vibe coders.",
      eyebrow: "ANTRY",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function Home() {
  const feed = buildFeed().slice(0, 30);

  // Right rail: top 4 builders by demo composite + active hackathons.
  const topBuilders = [...demoReceipts]
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, 5);

  const hotBriefs = [...demoBriefs]
    .sort((a, b) => b.attempts_count - a.attempts_count)
    .slice(0, 4);

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <Nav />
      <main className="pt-16 pb-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-10">
          {/* ── Feed column ──────────────────────────── */}
          <section>
            {/* Compose chip */}
            <div
              className="rounded-[14px] p-3 sm:p-4 mb-4 flex items-center gap-3"
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
                className="flex-1 text-left text-[14px] text-gray-500 hover:text-gray-700 transition-colors"
              >
                Share what you&apos;re building…
              </Link>
              <Link
                href="/compose"
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                <Plus className="w-3.5 h-3.5" /> Post
              </Link>
            </div>

            {/* Feed list */}
            <div
              className="rounded-[14px] overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBEBEB",
              }}
            >
              {feed.length === 0 ? (
                <p className="p-8 text-center text-gray-500 text-[14px]">
                  Quiet feed today. Be first.
                </p>
              ) : (
                feed.map((p) => <FeedCard key={p.id} post={p} />)
              )}
            </div>
          </section>

          {/* ── Right rail ───────────────────────────── */}
          <aside className="hidden lg:block space-y-6">
            <RailCard title="Hot Briefs" icon={<TrendingUp className="w-3 h-3" />}>
              <ul className="space-y-1.5">
                {hotBriefs.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/briefs/${b.slug}`}
                      className="block py-1.5 group"
                    >
                      <p className="text-[13px] font-bold tracking-[-0.005em] text-black leading-[1.3] group-hover:underline underline-offset-2">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {b.attempts_count} attempts · {b.difficulty}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>

            <RailCard title="Top this week" icon={<Trophy className="w-3 h-3" />}>
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

            <RailCard title="Run a hack" icon={<Plus className="w-3 h-3" />}>
              <p className="text-[12px] leading-[1.5] text-gray-600 mb-3">
                Bundle Briefs into a vibe hackathon. 4–24h windows. Live
                leaderboards.
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
    </div>
  );
}

function RailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
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
      </h3>
      {children}
    </div>
  );
}
