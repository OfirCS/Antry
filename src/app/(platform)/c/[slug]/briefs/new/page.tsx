import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { Nav } from "@/components/Nav";
import { demoCompanies } from "@/lib/receipts/demo-data";
import { BriefAuthorChat } from "./BriefAuthorChat";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Compose a Brief · ${slug}`,
    description:
      "Describe the role. Antry's Brief Composer drafts the rubric, caps, and hold-out test. You confirm.",
    robots: { index: false, follow: false },
    alternates: { canonical: `/c/${slug}/briefs/new` },
  };
}

export async function generateStaticParams() {
  return Object.values(demoCompanies).map((c) => ({ slug: c.slug }));
}

export default async function NewBriefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = Object.values(demoCompanies).find((c) => c.slug === slug);
  if (!company) notFound();

  return (
    <>
      <Nav />
      <main>
        <section style={{ background: "#0A0A0A" }} className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${company.sponsor_color}1F 0%, transparent 55%)`,
            }}
          />
          <div className="relative mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 pb-16 sm:pt-24 sm:pb-20">
            <Link
              href={`/c/${slug}`}
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] mb-7 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <ArrowLeft className="w-3 h-3" />
              {company.name} workspace
            </Link>
            <p
              className="text-[11px] font-bold tracking-[0.28em] uppercase mb-5 inline-flex items-center gap-2"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <Bot className="w-3.5 h-3.5" style={{ color: "#C6F135" }} />
              Brief Composer
            </p>
            <h1
              className="font-display font-bold leading-[1] tracking-[-0.04em]"
              style={{ color: "#FFFFFF", fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
            >
              Describe the role.
              <br />
              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                I&apos;ll draft the Brief.
              </span>
            </h1>
            <p
              className="mt-5 max-w-[600px] text-[15px] sm:text-[16px] leading-[1.6]"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Paste a job description or describe what you&apos;re hiring for.
              The composer proposes rubric weights, caps, allowed tools, and a
              hold-out test. You confirm.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 -mt-12 sm:-mt-16 pb-24 relative z-10">
            <BriefAuthorChat
              slug={slug}
              companyName={company.name}
              companyColor={company.sponsor_color}
            />
          </div>
        </section>
      </main>
    </>
  );
}
