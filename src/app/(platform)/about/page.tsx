import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, GitBranch, Search, Trophy } from "lucide-react";
import { antathons, builders, projects } from "@/lib/mock-data";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "About Antry";
const DESCRIPTION =
  "Antry is a proof-of-work network where builders are evaluated by shipped projects, live Briefs, and verifiable Receipts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/about",
    image: ogImageUrl({
      title: "About Antry",
      subtitle: "Proof of work for builders.",
      eyebrow: "Company",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const stats = [
  { label: "builders", value: builders.length.toLocaleString() },
  { label: "projects", value: projects.length.toLocaleString() },
  { label: "hackathons", value: antathons.length.toLocaleString() },
];

const principles = [
  {
    icon: GitBranch,
    title: "Show the work",
    body: "A project page should answer what shipped, how it was built, and why it matters without forcing reviewers to chase context.",
  },
  {
    icon: Trophy,
    title: "Make pressure useful",
    body: "Briefs and hackathons create a consistent way to compare builders on real constraints, not polished claims.",
  },
  {
    icon: Search,
    title: "Help the right people find it",
    body: "Companies and collaborators can review a builder by output, stack, craft, and repeatable signal.",
  },
];

const timeline = [
  "Builders publish shipped work with demos, source links, and clear context.",
  "Briefs turn company problems into scoped challenges with public criteria.",
  "Receipts preserve the review trail so the result is easier to trust.",
];

export default function AboutPage() {
  return (
    <div className="bg-[#F7F8FA] text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 pb-20 pt-20 sm:px-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              About Antry
            </p>
            <h1 className="mt-4 max-w-[760px] text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[64px]">
              Builders should be judged by what they ship.
            </h1>
            <p className="mt-6 max-w-[620px] text-[17px] leading-[1.65] text-[#4B5563]">
              Antry gives builders a clean place to publish real work and gives
              companies a faster way to review talent with evidence attached.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discover"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0A0A0A] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
              >
                Explore work
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/briefs"
                className="inline-flex min-h-11 items-center rounded-md border border-[#D1D5DB] bg-white px-5 text-[14px] font-semibold text-[#0A0A0A] transition-colors hover:border-[#9CA3AF]"
              >
                View Briefs
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-[#E5E7EB] bg-[#F7F8FA] p-5">
            <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] rounded-md border border-[#E5E7EB] bg-white">
              {stats.map((item) => (
                <div key={item.label} className="p-4">
                  <div className="text-[26px] font-semibold tracking-[-0.03em]">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {timeline.map((item) => (
                <div key={item} className="flex gap-3 text-[13px] leading-relaxed text-[#4B5563]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A0A0A]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-4 px-6 py-16 sm:px-10 md:grid-cols-3">
        {principles.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-md border border-[#E5E7EB] bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F7F8FA]">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="mt-5 text-[18px] font-semibold tracking-[-0.02em]">
                {item.title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#4B5563]">
                {item.body}
              </p>
            </div>
          );
        })}
      </section>

      <section className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-14 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[26px] font-semibold tracking-[-0.03em]">
              Build the record before the resume.
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-[#4B5563]">
              The network is small on purpose: fewer claims, clearer evidence,
              and more useful review for everyone involved.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-[#0A0A0A] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
          >
            Join Antry
          </Link>
        </div>
      </section>
    </div>
  );
}
