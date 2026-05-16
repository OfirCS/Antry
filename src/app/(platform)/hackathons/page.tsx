import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Trophy, Users } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs } from "@/lib/receipts/demo-data";
import { demoHackathons, type DemoHackathon } from "@/lib/hackathons/demo";

const TITLE = "Hackathons - Antry";
const DESCRIPTION = "Build sprints ranked by signed Receipts.";

const STATUS_LABEL: Record<DemoHackathon["status"], string> = {
  live: "Live",
  upcoming: "Upcoming",
  closed: "Closed",
};

export const metadata: Metadata = {
  title: "Hackathons",
  description: DESCRIPTION,
  alternates: { canonical: "/hackathons" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/hackathons",
    image: ogImageUrl({
      title: "Hackathons",
      subtitle: "Build sprints. Signed proof.",
      eyebrow: "Antry",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

function briefCountFor(hackathon: DemoHackathon): number {
  return hackathon.briefSlugs.filter((slug) =>
    demoBriefs.some((brief) => brief.slug === slug)
  ).length;
}

export default function HackathonsPage() {
  const liveCount = demoHackathons.filter((hackathon) => hackathon.status === "live").length;
  const briefCount = demoHackathons.reduce((sum, hackathon) => sum + briefCountFor(hackathon), 0);

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-black">
      <section className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-black/10 pb-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Hackathons
              </p>
              <h1 className="mt-2 text-[34px] font-bold leading-none tracking-[-0.045em] sm:text-[52px]">
                Build sprints
              </h1>
            </div>
            <div className="flex items-end gap-8 sm:text-right">
              <Stat label="Live" value={liveCount.toString()} />
              <Stat label="Briefs" value={briefCount.toString()} />
              <Stat label="Total" value={demoHackathons.length.toString()} />
            </div>
          </div>
        </header>

        <div className="mt-5 flex justify-end">
          <Link
            href="/hackathons/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-black px-3.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Host <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <section className="mt-4 overflow-hidden rounded-md border border-black/10 bg-white">
          <div className="hidden grid-cols-[1fr_0.35fr_0.38fr_0.48fr_0.36fr] border-b border-black/10 bg-gray-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 lg:grid">
            <span>Sprint</span>
            <span>Briefs</span>
            <span>People</span>
            <span>Prize</span>
            <span className="text-right">Open</span>
          </div>
          <div className="divide-y divide-black/10">
            {demoHackathons.map((hackathon) => (
              <HackathonRow key={hackathon.slug} hackathon={hackathon} />
            ))}
          </div>
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

function HackathonRow({ hackathon }: { hackathon: DemoHackathon }) {
  const statusTone =
    hackathon.status === "live"
      ? "bg-black text-white border-black"
      : hackathon.status === "upcoming"
        ? "bg-gray-100 text-gray-700 border-gray-200"
        : "bg-white text-gray-500 border-gray-200";

  return (
    <Link
      href={`/h/${hackathon.slug}`}
      className="group grid gap-3 px-4 py-4 transition-colors hover:bg-gray-50 lg:grid-cols-[1fr_0.35fr_0.38fr_0.48fr_0.36fr] lg:items-center"
    >
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${statusTone}`}>
            {STATUS_LABEL[hackathon.status]}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
            <Clock className="h-3 w-3" />
            {hackathon.durationHours}h
          </span>
        </div>
        <h2 className="truncate text-[15px] font-semibold text-black">{hackathon.title}</h2>
        <p className="mt-1 truncate text-[12px] text-gray-500">{hackathon.theme}</p>
      </div>
      <div className="text-[13px] text-gray-500">
        <span className="font-semibold text-black">{briefCountFor(hackathon)}</span> briefs
      </div>
      <div className="inline-flex items-center gap-1.5 text-[13px] text-gray-500">
        <Users className="h-3.5 w-3.5" />
        {hackathon.participantCount}
      </div>
      <div className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-gray-700">
        <Trophy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{hackathon.prize}</span>
      </div>
      <div className="flex justify-end">
        <span className="inline-flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 text-[12px] font-semibold text-black transition-colors group-hover:border-black/25">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
