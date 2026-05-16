import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Pricing";
const DESCRIPTION =
  "Simple pricing for builders and companies using Antry Briefs and Receipts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: defaultOpenGraph({
    title: "Pricing",
    description: DESCRIPTION,
    path: "/pricing",
    image: ogImageUrl({
      title: "Simple pricing",
      subtitle: "Free for builders. Clear plans for teams.",
      eyebrow: "Pricing",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const tiers = [
  {
    name: "Builder",
    price: "$0",
    cadence: "forever",
    body: "Publish work, join Briefs, and build a credible public record.",
    href: "/signup",
    cta: "Start free",
    features: ["Public profile", "Project submissions", "Brief participation", "Receipt history"],
  },
  {
    name: "Team",
    price: "$499",
    cadence: "per month",
    body: "Run scoped Briefs and review builders through shipped work.",
    href: "/briefs",
    cta: "Start with a Brief",
    featured: true,
    features: ["4 active Briefs", "50 Receipt reviews", "Private invite lists", "Priority support"],
  },
  {
    name: "Platform",
    price: "Custom",
    cadence: "annual",
    body: "For larger programs, partner hackathons, and high-volume review.",
    href: "mailto:[email protected]?subject=Antry%20Platform",
    cta: "Talk to us",
    features: ["Unlimited Briefs", "Custom rubrics", "SSO and DPA", "Dedicated support"],
  },
];

const compare = [
  ["Active Briefs", "1", "4", "Unlimited"],
  ["Receipt reviews", "Public", "50 / month", "Custom"],
  ["Private review", false, true, true],
  ["Custom rubric", false, false, true],
  ["Support", "Community", "Priority", "Dedicated"],
] as const;

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="h-4 w-4 text-[#0A0A0A]" />;
  if (value === false) return <Minus className="h-4 w-4 text-[#9CA3AF]" />;
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="bg-[#F7F8FA] text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-20 sm:px-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
            Pricing
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-[740px] text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[64px]">
                Start free. Pay when review volume matters.
              </h1>
              <p className="mt-6 max-w-[620px] text-[17px] leading-[1.65] text-[#4B5563]">
                Builders stay free. Teams pay for structured Briefs, private
                review, and a clearer way to evaluate shipped work.
              </p>
            </div>
            <div className="rounded-md border border-[#E5E7EB] bg-[#F7F8FA] p-5 text-[14px] leading-relaxed text-[#4B5563]">
              No per-seat surprise. No posting fee. Upgrade only when your team
              needs more active Briefs or private review capacity.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-4 px-6 py-14 sm:px-10 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={[
              "rounded-md border p-6",
              tier.featured
                ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
                : "border-[#E5E7EB] bg-white text-[#0A0A0A]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{tier.name}</h2>
                <p className={tier.featured ? "mt-2 text-[14px] leading-relaxed text-white/60" : "mt-2 text-[14px] leading-relaxed text-[#4B5563]"}>
                  {tier.body}
                </p>
              </div>
              {tier.featured ? (
                <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">
                  Popular
                </span>
              ) : null}
            </div>
            <div className="mt-8">
              <span className="text-[42px] font-semibold tracking-[-0.04em]">{tier.price}</span>
              <span className={tier.featured ? "ml-2 text-[13px] text-white/55" : "ml-2 text-[13px] text-[#6B7280]"}>
                {tier.cadence}
              </span>
            </div>
            <ul className="mt-7 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className={tier.featured ? "flex gap-3 text-[14px] text-white/75" : "flex gap-3 text-[14px] text-[#4B5563]"}>
                  <Check className={tier.featured ? "mt-0.5 h-4 w-4 shrink-0 text-white" : "mt-0.5 h-4 w-4 shrink-0 text-[#0A0A0A]"} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={tier.featured
                ? "mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-[14px] font-semibold text-[#0A0A0A] transition-colors hover:bg-[#F3F4F6]"
                : "mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#D1D5DB] bg-white px-4 text-[14px] font-semibold text-[#0A0A0A] transition-colors hover:border-[#9CA3AF]"}
            >
              {tier.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-[1180px] px-6 pb-16 sm:px-10">
        <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
          <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] border-b border-[#E5E7EB] bg-[#F7F8FA] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
            <div className="p-4">Feature</div>
            <div className="p-4">Builder</div>
            <div className="p-4">Team</div>
            <div className="p-4">Platform</div>
          </div>
          {compare.map(([feature, builder, team, platform]) => (
            <div key={feature} className="grid grid-cols-[1.4fr_repeat(3,1fr)] border-b border-[#E5E7EB] text-[13px] last:border-b-0">
              <div className="p-4 font-medium">{feature}</div>
              <div className="p-4 text-[#4B5563]"><Cell value={builder} /></div>
              <div className="p-4 text-[#4B5563]"><Cell value={team} /></div>
              <div className="p-4 text-[#4B5563]"><Cell value={platform} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
