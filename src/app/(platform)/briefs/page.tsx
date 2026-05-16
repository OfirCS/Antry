import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Code2, Search, Trophy, Users } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs } from "@/lib/receipts/demo-data";
import type { Brief } from "@/lib/receipts/types";

const TITLE = "Briefs - Antry";
const DESCRIPTION = "Live assignments, proof volume, and review state.";

type BriefsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    difficulty?: string | string[];
  }>;
};

const difficulties = ["intro", "mid", "senior", "staff"] as const;
type Difficulty = (typeof difficulties)[number];

export const metadata: Metadata = {
  title: "Briefs",
  description: DESCRIPTION,
  alternates: { canonical: "/briefs" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/briefs",
    image: ogImageUrl({
      title: "Briefs",
      subtitle: "Live assignments and signed proof.",
      eyebrow: "Antry",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function filterHref({
  query,
  category,
  difficulty,
}: {
  query: string;
  category?: string;
  difficulty?: string;
}): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  const qs = params.toString();
  return qs ? `/briefs?${qs}` : "/briefs";
}

function formatDifficulty(difficulty: Difficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function formatTime(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes - hours * 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default async function BriefsPage({ searchParams }: BriefsPageProps) {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const selectedCategory = firstParam(params.category).trim();
  const difficultyParam = firstParam(params.difficulty).trim();
  const selectedDifficulty = difficulties.includes(difficultyParam as Difficulty)
    ? (difficultyParam as Difficulty)
    : "";

  const liveBriefs = demoBriefs.filter((brief) => brief.status === "live");
  const categories = Array.from(new Set(liveBriefs.map((brief) => brief.category))).sort();
  const q = query.toLowerCase();
  const filtered = liveBriefs.filter((brief) => {
    const matchesCategory = !selectedCategory || brief.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || brief.difficulty === selectedDifficulty;
    const haystack = [
      brief.title,
      brief.company.name,
      brief.sponsor_label,
      brief.category,
      brief.difficulty,
      brief.tagline,
    ]
      .join(" ")
      .toLowerCase();
    return matchesCategory && matchesDifficulty && (!q || haystack.includes(q));
  });

  const receipts = liveBriefs.reduce((sum, brief) => sum + brief.receipts_count, 0);
  const medianScore = Math.round(
    liveBriefs.reduce((sum, brief) => sum + (brief.median_score ?? 0), 0) /
      Math.max(1, liveBriefs.length)
  );
  const featured = liveBriefs[0];

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-black">
      <section className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
        <header className="grid gap-6 border-b border-black/10 pb-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="min-w-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Briefs
              </p>
              <h1 className="mt-2 max-w-[760px] text-[36px] font-bold leading-[0.98] tracking-[-0.045em] text-balance sm:text-[48px] lg:text-[58px]">
                Pick a real assignment. Leave with signed proof.
              </h1>
              <p className="mt-4 max-w-[660px] text-[15px] leading-[1.6] text-gray-600">
                Browse live company-style briefs, start the attempt in your IDE, then publish a Receipt that shows how you worked.
              </p>
            </div>
            <div className="mt-6 grid max-w-[520px] grid-cols-3 gap-4 border-t border-black/10 pt-5">
              <Stat label="Live briefs" value={liveBriefs.length.toString()} />
              <Stat label="Receipts" value={receipts.toString()} />
              <Stat label="Median" value={medianScore.toString()} />
            </div>
          </div>
          <div className="rounded-md border border-black/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Flow</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <FlowStep number="1" title="Choose the brief" body="Filter by domain, difficulty, or proof volume." />
              <FlowStep number="2" title="Start in your IDE" body="Use Antry MCP from Cursor or Claude Code." />
              <FlowStep number="3" title="Mint the Receipt" body="Your signed trace lands on the leaderboard." />
            </ol>
          </div>
        </header>

        <section className="sticky top-[68px] z-30 -mx-4 border-b border-black/10 bg-[#F7F8FA]/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form action="/briefs" className="relative w-full lg:max-w-[360px]">
              <input type="hidden" name="category" value={selectedCategory} />
              <input type="hidden" name="difficulty" value={selectedDifficulty} />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search briefs"
                className="h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-gray-400 focus:border-black/30"
              />
            </form>
            <div className="flex flex-col gap-2 lg:items-end">
              <FilterBar
                label="Category"
                values={["", ...categories]}
                selected={selectedCategory}
                query={query}
                otherValue={selectedDifficulty}
                otherKey="difficulty"
              />
              <FilterBar
                label="Difficulty"
                values={["", ...difficulties]}
                selected={selectedDifficulty}
                query={query}
                otherValue={selectedCategory}
                otherKey="category"
              />
            </div>
          </div>
        </section>

        {featured && !query && !selectedCategory && !selectedDifficulty && (
          <section className="mt-6 grid gap-0 overflow-hidden rounded-md border border-black bg-black text-white lg:grid-cols-[minmax(0,1fr)_320px]">
            <Link href={`/briefs/${featured.slug}`} className="group p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Featured brief</p>
              <h2 className="mt-3 max-w-[680px] text-[28px] font-bold leading-[1.04] tracking-[-0.035em] text-balance sm:text-[40px]">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-[640px] text-[14px] leading-[1.65] text-white/62">{featured.tagline}</p>
              <div className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-white px-3.5 text-[13px] font-bold text-black transition-transform group-hover:translate-x-1">
                Open brief <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
            <div className="border-t border-white/10 p-5 sm:p-7 lg:border-l lg:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Snapshot</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Metric icon={<Clock className="h-3.5 w-3.5" />} label="Time cap" value={formatTime(featured.time_cap_seconds)} />
                <Metric icon={<Users className="h-3.5 w-3.5" />} label="Attempts" value={featured.attempts_count.toString()} />
                <Metric icon={<Trophy className="h-3.5 w-3.5" />} label="Median" value={featured.median_score?.toString() ?? "-"} />
                <Metric icon={<Code2 className="h-3.5 w-3.5" />} label="Difficulty" value={formatDifficulty(featured.difficulty)} />
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 overflow-hidden rounded-md border border-black/10 bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_130px_120px_120px_90px] border-b border-black/10 bg-gray-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 lg:grid">
            <span>Brief</span>
            <span>Difficulty</span>
            <span>Time cap</span>
            <span>Proof</span>
            <span className="text-right">Start</span>
          </div>

          <div className="divide-y divide-black/10">
            {filtered.map((brief) => (
              <BriefRow key={brief.id} brief={brief} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="text-[14px] font-semibold text-black">No briefs found</p>
              <Link href="/briefs" className="mt-2 inline-flex text-[13px] font-semibold text-gray-500 hover:text-black">
                Reset filters
              </Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[28px] font-bold leading-none tracking-[-0.04em] text-black">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{label}</div>
    </div>
  );
}

function FlowStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li className="grid grid-cols-[28px_1fr] gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-[12px] font-bold text-white">
        {number}
      </span>
      <span>
        <span className="block text-[13px] font-bold leading-tight text-black">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-[1.45] text-gray-500">{body}</span>
      </span>
    </li>
  );
}

function FilterBar({
  label,
  values,
  selected,
  query,
  otherValue,
  otherKey,
}: {
  label: string;
  values: readonly string[];
  selected: string;
  query: string;
  otherValue: string;
  otherKey: "category" | "difficulty";
}) {
  return (
    <nav aria-label={`${label} filters`} className="flex max-w-full items-center gap-1 overflow-x-auto">
      <span className="mr-1 hidden text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 sm:inline">
        {label}
      </span>
      {values.map((value) => {
        const active = selected === value;
        const href =
          otherKey === "difficulty"
            ? filterHref({ query, category: value, difficulty: otherValue })
            : filterHref({ query, category: otherValue, difficulty: value });
        const display = value
          ? difficulties.includes(value as Difficulty)
            ? formatDifficulty(value as Difficulty)
            : value
          : "All";
        return (
          <Link
            key={`${label}-${value || "all"}`}
            href={href}
            className={`inline-flex h-8 shrink-0 items-center rounded-md px-2.5 text-[12px] font-semibold transition-colors ${
              active ? "bg-black text-white" : "text-gray-500 hover:bg-white hover:text-black"
            }`}
          >
            {display}
          </Link>
        );
      })}
    </nav>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/42">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[20px] font-bold leading-none tracking-[-0.03em]">{value}</div>
    </div>
  );
}

function BriefRow({ brief }: { brief: Brief }) {
  return (
    <Link
      href={`/briefs/${brief.slug}`}
      className="group grid gap-4 px-4 py-4 transition-colors hover:bg-gray-50 lg:grid-cols-[minmax(0,1fr)_130px_120px_120px_90px] lg:items-center"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[12px] font-bold text-white"
            style={{ background: brief.company.sponsor_color }}
          >
            {brief.company.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-bold text-black">{brief.title}</h2>
            <p className="mt-0.5 truncate text-[12px] text-gray-500">
              {brief.company.name} / {brief.category}
            </p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-[13px] leading-[1.55] text-gray-600 lg:hidden">
          {brief.tagline}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
        <span className="lg:hidden text-[12px] font-medium text-gray-400">Difficulty</span>
        {formatDifficulty(brief.difficulty)}
      </div>
      <div className="flex items-center gap-2 text-[13px] text-gray-500">
        <Clock className="h-3.5 w-3.5 lg:hidden" />
        {formatTime(brief.time_cap_seconds)}
      </div>
      <div className="text-[13px] text-gray-500">
        <span className="font-semibold text-black">{brief.receipts_count}</span> receipts
        <span className="ml-2 text-gray-400">median {brief.median_score ?? "-"}</span>
      </div>
      <div className="flex justify-start lg:justify-end">
        <span className="inline-flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 text-[12px] font-semibold text-black transition-colors group-hover:border-black/25">
          Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
