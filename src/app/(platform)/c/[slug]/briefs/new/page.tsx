import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Wrench,
  Cpu,
  Mail,
  Database,
  Globe,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { demoCompanies } from "@/lib/receipts/demo-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Post a Brief · ${slug}`,
    description: "Pick a quick-start template or write your own. Live in 60 seconds.",
    robots: { index: false, follow: false },
    alternates: { canonical: `/c/${slug}/briefs/new` },
  };
}

export async function generateStaticParams() {
  return Object.values(demoCompanies).map((c) => ({ slug: c.slug }));
}

const TEMPLATES = [
  {
    slug: "rag-pipeline",
    icon: <Database className="w-5 h-5" />,
    title: "RAG pipeline with citations",
    blurb:
      "Streaming RAG agent that respects citation discipline. Tests: streams correctly, all claims cited, no fabrication, hold-out pass rate.",
    difficulty: "senior",
    tokenCap: 50000,
    timeCapMin: 90,
    tools: ["file_search", "code_run", "judge"],
    color: "#D97757",
  },
  {
    slug: "edge-agent",
    icon: <Globe className="w-5 h-5" />,
    title: "Edge runtime agent under cold-start budget",
    blurb:
      "Routing agent on Vercel Edge with strict cold-start (<100ms p95) and bundle-size (<450KB) limits.",
    difficulty: "staff",
    tokenCap: 30000,
    timeCapMin: 70,
    tools: ["code_run", "file_search"],
    color: "#000000",
  },
  {
    slug: "email-engine",
    icon: <Mail className="w-5 h-5" />,
    title: "Transactional email orchestrator",
    blurb:
      "Bounce-aware email agent with deliverability rules and warm-up curves. 12 routing scenarios, 11 must converge.",
    difficulty: "mid",
    tokenCap: 25000,
    timeCapMin: 60,
    tools: ["file_search", "code_run", "judge"],
    color: "#1E1E1E",
  },
  {
    slug: "realtime-sync",
    icon: <Cpu className="w-5 h-5" />,
    title: "Multi-region Postgres sync",
    blurb:
      "Conflict-resolution agent for write conflicts during region failover. Idempotent. 25 scenarios, 22 must converge.",
    difficulty: "senior",
    tokenCap: 20000,
    timeCapMin: 60,
    tools: ["code_run", "file_search"],
    color: "#3ECF8E",
  },
  {
    slug: "tool-orchestrator",
    icon: <Wrench className="w-5 h-5" />,
    title: "Multi-tool orchestrator",
    blurb:
      "Agent that chooses between 8 tools and routes user requests correctly. Penalises wasted LLM calls; rewards deterministic-first thinking.",
    difficulty: "mid",
    tokenCap: 15000,
    timeCapMin: 45,
    tools: ["file_search", "code_run", "schema_lookup", "judge"],
    color: "#C6F135",
  },
];

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
        <Hero company={company} />

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <TemplateCard
                  key={t.slug}
                  template={t}
                  companySlug={slug}
                />
              ))}

              <BlankCard companySlug={slug} />
            </div>

            <div
              className="mt-14 rounded-[20px] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 items-center"
              style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#0A0A0A" }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
                  Templates skip the rubric work.
                </h3>
                <p className="mt-1 text-[13px] text-gray-600">
                  Each template ships with the rubric, hold-out test, and
                  allowed-tools whitelist already wired. Edit anything later.
                </p>
              </div>
              <Link
                href="/receipts/methodology"
                className="text-[13px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
              >
                Methodology <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Hero({
  company,
}: {
  company: { slug: string; name: string; sponsor_color: string };
}) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${company.sponsor_color}26 0%, transparent 55%)`,
        }}
      />
      <div className="relative mx-auto max-w-[1080px] px-6 sm:px-10 pt-20 pb-32 sm:pt-24 sm:pb-36">
        <Link
          href={`/c/${company.slug}`}
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] mb-8 hover:opacity-80 transition-opacity"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {company.name} workspace
        </Link>
        <p
          className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3"
          style={{ color: company.sponsor_color }}
        >
          New Brief
        </p>
        <h1
          className="font-display font-bold leading-[1.02] tracking-[-0.04em] max-w-[820px]"
          style={{ color: "#FFFFFF", fontSize: "clamp(2.4rem, 5.5vw, 3.6rem)" }}
        >
          Pick a template.{" "}
          <span style={{ color: company.sponsor_color }}>
            Edit two lines. Go live.
          </span>
        </h1>
        <p
          className="mt-6 max-w-[600px] text-[16px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.66)" }}
        >
          Five quick-start templates with rubric, hold-out test, and
          allowed-tools whitelist already wired. Customize anything later — or
          start from scratch.
        </p>
      </div>
    </section>
  );
}

function TemplateCard({
  template,
  companySlug,
}: {
  template: (typeof TEMPLATES)[number];
  companySlug: string;
}) {
  return (
    <Link
      href={`/c/${companySlug}/briefs/new/${template.slug}`}
      className="group rounded-[20px] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
    >
      <div className="h-1.5" style={{ background: template.color }} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: `${template.color}1F`,
              color: ["#0A0A0A", "#000000", "#1E1E1E"].includes(template.color)
                ? "#0A0A0A"
                : template.color,
            }}
          >
            {template.icon}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded"
            style={{ background: "#F5F5F5", color: "#525252" }}
          >
            {template.difficulty}
          </span>
        </div>
        <h3 className="text-[17px] font-bold tracking-[-0.015em] text-black leading-[1.35]">
          {template.title}
        </h3>
        <p className="mt-2 text-[13px] text-gray-600 leading-[1.55]">
          {template.blurb}
        </p>
        <div className="mt-4 flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-gray-500">
          <span>≤{(template.tokenCap / 1000).toFixed(0)}k tokens</span>
          <span>·</span>
          <span>{template.timeCapMin}m cap</span>
          <span>·</span>
          <span>{template.tools.length} tools</span>
        </div>
        <p
          className="mt-5 text-[13px] font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
          style={{ color: "#0A0A0A" }}
        >
          Use this template <ArrowRight className="w-3.5 h-3.5" />
        </p>
      </div>
    </Link>
  );
}

function BlankCard({ companySlug }: { companySlug: string }) {
  return (
    <Link
      href={`/c/${companySlug}/briefs/new/blank`}
      className="group rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center p-8"
      style={{
        border: "1.5px dashed #D4D4D4",
        background: "transparent",
      }}
    >
      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
        style={{ background: "#F5F5F5", color: "#525252" }}
      >
        <Sparkles className="w-5 h-5" />
      </span>
      <h3 className="text-[16px] font-bold tracking-[-0.015em] text-black">
        Start from scratch
      </h3>
      <p className="mt-2 text-[13px] text-gray-600 max-w-[280px] leading-[1.5]">
        Bring your own rubric. Markdown or YAML. We&apos;ll validate before
        going live.
      </p>
      <p className="mt-5 text-[13px] font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all text-black">
        Blank Brief <ArrowRight className="w-3.5 h-3.5" />
      </p>
    </Link>
  );
}
