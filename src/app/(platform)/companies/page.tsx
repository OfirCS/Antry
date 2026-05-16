import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Users } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "For Companies";
const DESCRIPTION =
  "Use Antry to run scoped Briefs, review shipped work, and find builders with evidence instead of resume noise.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/companies" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/companies",
    image: ogImageUrl({
      title: "For companies",
      subtitle: "Find builders through shipped work.",
      eyebrow: "Recruiting",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const workflow = [
  {
    icon: Users,
    title: "Publish a Brief",
    body: "Turn a real product problem into a scoped challenge with review criteria your team can actually use.",
  },
  {
    icon: Search,
    title: "Review the strongest work",
    body: "Compare submissions by shipped output, stack choices, demo quality, and execution detail.",
  },
  {
    icon: ShieldCheck,
    title: "Move with evidence",
    body: "Receipts make the shortlist defensible before you spend time on interviews.",
  },
];

export default function CompaniesPage() {
  return (
    <div className="bg-[#F7F8FA] text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 pb-20 pt-20 sm:px-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              For companies
            </p>
            <h1 className="mt-4 max-w-[760px] text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[64px]">
              Hire from proof, not polish.
            </h1>
            <p className="mt-6 max-w-[620px] text-[17px] leading-[1.65] text-[#4B5563]">
              Antry helps teams find builders through scoped work, live demos,
              and review trails. Less keyword matching, more signal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/briefs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0A0A0A] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
              >
                View Briefs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-11 items-center rounded-md border border-[#D1D5DB] bg-white px-5 text-[14px] font-semibold text-[#0A0A0A] transition-colors hover:border-[#9CA3AF]"
              >
                See pricing
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-[#E5E7EB] bg-[#F7F8FA] p-5">
            {["Scope", "Review", "Shortlist"].map((item, index) => (
              <div key={item} className="flex items-start gap-4 border-b border-[#E5E7EB] py-4 first:pt-0 last:border-b-0 last:pb-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0A0A0A] text-[12px] font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <div className="text-[14px] font-semibold">{item}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#4B5563]">
                    {index === 0
                      ? "Define the challenge and evaluation criteria."
                      : index === 1
                        ? "Compare real submissions with consistent context."
                        : "Invite the builders whose work already fits."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-4 px-6 py-16 sm:px-10 md:grid-cols-3">
        {workflow.map((item) => {
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

      <section className="mx-auto max-w-[1180px] px-6 pb-16 sm:px-10">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-center">
            <div>
              <h2 className="text-[26px] font-semibold tracking-[-0.03em]">
                Built for teams that care how work gets done.
              </h2>
              <p className="mt-3 max-w-[620px] text-[14px] leading-relaxed text-[#4B5563]">
                Use Antry when the role depends on taste, velocity, and the
                ability to ship under constraints.
              </p>
            </div>
            <div className="space-y-3 text-[13px] text-[#4B5563]">
              {["No resume parsing theater", "Live demos over slide decks", "Clear review criteria"].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A0A0A]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
