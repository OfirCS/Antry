import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs, demoCompanies } from "@/lib/receipts/demo-data";
import { BriefCard } from "@/components/BriefCard";

const COMPANY_BLURBS: Record<string, string> = {
  anthropic:
    "Anthropic builds Claude. They posted the Streaming RAG Brief to find engineers who think about citation discipline as a product constraint, not an afterthought.",
  vercel:
    "Vercel ships the platform a lot of you build on. Their Edge Brief is about treating cold-start budgets as a first-class constraint.",
  resend:
    "Resend is rebuilding email developer-first. Their Brief tests how you reason about deliverability state machines under token budgets.",
  supabase:
    "Supabase is the open-source Firebase. Their Brief tests conflict-resolution thinking in a multi-region Postgres.",
};

const ALL_COMPANY_SLUGS = Object.values(demoCompanies).map((c) => c.slug);

export async function generateStaticParams() {
  return ALL_COMPANY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = Object.values(demoCompanies).find((c) => c.slug === slug);
  if (!company) return { title: "Company not found", robots: { index: false, follow: true } };
  const path = `/c/${slug}`;
  const title = `${company.name} on Antry`;
  const description = `${company.name} authors Briefs on Antry to find AI engineers who ship with judgment.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({
      title,
      description,
      path,
      image: ogImageUrl({
        title: company.name,
        subtitle: "Authoring Antry Briefs · hiring on output",
        eyebrow: "Company",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isWelcome = sp.welcome === "1";
  const company = Object.values(demoCompanies).find((c) => c.slug === slug);
  if (!company) notFound();
  const briefs = demoBriefs.filter((b) => b.company.slug === slug);
  const blurb = COMPANY_BLURBS[slug] ?? `${company.name} authors Briefs on Antry.`;

  return (
    <>
      <Nav />
      <main>
        <section
          className="relative overflow-hidden"
          style={{ background: "#0A0A0A" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${company.sponsor_color}26 0%, transparent 55%)`,
            }}
          />
          <div className="relative mx-auto max-w-[1080px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
            <Link
              href="/briefs"
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] mb-8 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ← All Briefs
            </Link>

            <div className="flex items-center gap-5 sm:gap-6 mb-6 flex-wrap">
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-[28px] font-bold font-display"
                style={{
                  background: company.sponsor_color,
                  color: ["#0A0A0A", "#000000"].includes(company.sponsor_color)
                    ? "#C6F135"
                    : "#FFFFFF",
                  boxShadow: "0 12px 32px -8px rgba(0,0,0,0.4)",
                }}
              >
                {company.name.charAt(0)}
              </div>
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.22em] mb-1"
                  style={{ color: company.sponsor_color }}
                >
                  Brief sponsor
                </p>
                <h1
                  className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em]"
                  style={{ color: "#FFFFFF" }}
                >
                  {company.name}
                </h1>
              </div>
            </div>

            <p
              className="max-w-[640px] text-[15px] sm:text-[16px] leading-[1.65]"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              {blurb}
            </p>

            <div className="mt-8 flex items-center gap-x-6 gap-y-3 flex-wrap text-[12px] font-medium">
              {[
                { label: "Active Briefs", value: briefs.filter((b) => b.status === "live").length.toString() },
                { label: "Total attempts", value: briefs.reduce((s, b) => s + b.attempts_count, 0).toString() },
                { label: "Receipts minted", value: briefs.reduce((s, b) => s + b.receipts_count, 0).toString() },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  {i > 0 && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    />
                  )}
                  <span
                    className="tabular-nums font-bold tracking-tight"
                    style={{ color: "#FFFFFF" }}
                  >
                    {s.value}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
                  Briefs by {company.name}
                </p>
                <h2 className="mt-2 text-[clamp(1.6rem,3.5vw,2.2rem)] font-bold tracking-[-0.025em] text-black">
                  Hire on output, not résumés.
                </h2>
              </div>
            </div>

            {isWelcome && (
              <div
                className="mb-8 rounded-[20px] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 items-center"
                style={{
                  background: "rgba(198,241,53,0.08)",
                  border: "1px solid rgba(198,241,53,0.45)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#0A0A0A" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
                    Welcome to {company.name}.
                  </h3>
                  <p className="mt-0.5 text-[13px] text-gray-600">
                    Workspace is reserved. Post your first Brief to go live.
                  </p>
                </div>
                <Link
                  href={`/c/${slug}/briefs/new`}
                  className="inline-flex items-center gap-1.5 rounded-[12px] px-4 h-[40px] text-[13px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                  style={{ background: "#C6F135", color: "#0A0A0A" }}
                >
                  Post first Brief <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {briefs.length === 0 ? (
              <EmptyBriefs slug={slug} companyName={company.name} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {briefs.map((b, i) => (
                  <BriefCard key={b.id} brief={b} index={i} />
                ))}
              </div>
            )}

            <div
              className="mt-16 rounded-[24px] p-6 sm:p-8 relative overflow-hidden"
              style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "#0A0A0A" }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] sm:text-[17px] font-bold tracking-[-0.01em] text-black">
                    Author a new Brief.
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-[1.55] text-gray-700 max-w-[640px]">
                    Pick a template or start from scratch. Public for marketing, private for confidential evals — your choice per Brief.
                  </p>
                </div>
                <Link
                  href={`/c/${slug}/briefs/new`}
                  className="inline-flex items-center gap-1.5 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                  style={{ background: "#0A0A0A", color: "#fff" }}
                >
                  New Brief <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function EmptyBriefs({ slug, companyName }: { slug: string; companyName: string }) {
  return (
    <div
      className="rounded-[24px] p-10 sm:p-14 text-center"
      style={{
        background: "#FAFAF7",
        border: "1.5px dashed #D4D4D4",
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: "#0A0A0A" }}
      >
        <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
      </div>
      <h3 className="text-[18px] font-bold tracking-[-0.01em] text-black">
        No Briefs yet at {companyName}.
      </h3>
      <p className="mt-2 text-[14px] leading-[1.55] text-gray-600 max-w-[440px] mx-auto">
        Pick a template or start from scratch. Goes live in 60 seconds.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
        <Link
          href={`/c/${slug}/briefs/new`}
          className="inline-flex items-center gap-1.5 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
          style={{
            background: "#C6F135",
            color: "#0A0A0A",
            boxShadow: "0 8px 24px rgba(198,241,53,0.30)",
          }}
        >
          New Brief <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/briefs"
          className="inline-flex items-center gap-1.5 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold text-black hover:bg-gray-100 transition-colors"
        >
          Browse examples
        </Link>
      </div>
    </div>
  );
}

// Suppress unused import lint
export { ExternalLink };
