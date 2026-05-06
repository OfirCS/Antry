import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Key,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { demoCompanies } from "@/lib/receipts/demo-data";

export async function generateStaticParams() {
  return Object.values(demoCompanies).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `API keys · ${slug}`,
    description: "Generate and revoke API keys for the Antry SDK.",
    robots: { index: false, follow: false },
    alternates: { canonical: `/c/${slug}/api-keys` },
  };
}

const DEMO_KEYS = [
  {
    id: "a1b2c3d4",
    env: "live",
    label: "Production",
    last_used: "2026-05-06 11:42:18",
    created: "2026-04-15",
  },
  {
    id: "e5f6a7b8",
    env: "test",
    label: "Local dev",
    last_used: "2026-05-06 09:14:02",
    created: "2026-04-15",
  },
];

export default async function ApiKeysPage({
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
          <div className="mx-auto max-w-[920px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <CreateForm />
            <KeyList />
            <SecurityNote />
            <SdkExample />
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
      <div className="relative mx-auto max-w-[920px] px-6 sm:px-10 pt-20 pb-32 sm:pt-24 sm:pb-36">
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
          API keys
        </p>
        <h1
          className="font-display font-bold leading-[1.02] tracking-[-0.04em] max-w-[760px]"
          style={{ color: "#FFFFFF", fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}
        >
          Programmatic access.{" "}
          <span style={{ color: company.sponsor_color }}>One key at a time.</span>
        </h1>
        <p
          className="mt-6 max-w-[600px] text-[15px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.66)" }}
        >
          Use these keys with the{" "}
          <code className="text-white font-mono">@antry/sdk</code> package or
          plain HTTP. We never log secrets and never share them between
          environments.
        </p>
      </div>
    </section>
  );
}

function CreateForm() {
  return (
    <form
      className="rounded-[20px] p-6 sm:p-7 mb-6 bg-white"
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
      action="#"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-2">
        Create a new key
      </p>
      <h2 className="text-[18px] font-bold tracking-[-0.015em] text-black">
        New API key
      </h2>
      <p className="mt-1 text-[13px] text-gray-600">
        Choose <code className="px-1 py-0.5 rounded bg-gray-100 text-[12px]">live</code> for production traffic, <code className="px-1 py-0.5 rounded bg-gray-100 text-[12px]">test</code> for local dev. The plaintext secret is shown once — copy it now.
      </p>
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <input
          name="label"
          placeholder="Key label (e.g. Production server)"
          autoComplete="off"
          className="flex-1 rounded-[12px] px-4 py-3 text-[14px] outline-none"
          style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
        />
        <select
          name="env"
          className="rounded-[12px] px-4 py-3 text-[14px] outline-none"
          style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
          defaultValue="live"
        >
          <option value="live">live</option>
          <option value="test">test</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-[12px] px-5 h-[46px] text-[13px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
          style={{
            background: "#0A0A0A",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(10,10,10,0.18)",
          }}
        >
          <Key className="w-3.5 h-3.5" />
          Generate key
        </button>
      </div>
    </form>
  );
}

function KeyList() {
  return (
    <div
      className="rounded-[20px] overflow-hidden bg-white mb-10"
      style={{ border: "1px solid #EBEBEB" }}
    >
      <div
        className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500"
        style={{ background: "#FAFAF7", borderBottom: "1px solid #EBEBEB" }}
      >
        <div>Label · ID</div>
        <div>Env</div>
        <div>Created</div>
        <div>Last used</div>
        <div className="text-right pr-1">Action</div>
      </div>
      {DEMO_KEYS.map((k, i) => (
        <div
          key={k.id}
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center"
          style={{
            borderBottom: i === DEMO_KEYS.length - 1 ? "none" : "1px solid #F5F5F5",
          }}
        >
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-black">
              {k.label}
            </p>
            <p className="text-[11px] font-mono text-gray-500 truncate">
              ant_{k.env}_{k.id}_***************************
            </p>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded inline-block"
            style={{
              background: k.env === "live" ? "rgba(198,241,53,0.18)" : "#F5F5F5",
              color: k.env === "live" ? "#0A0A0A" : "#525252",
            }}
          >
            {k.env}
          </span>
          <span className="text-[12px] text-gray-500 tabular-nums">{k.created}</span>
          <span className="text-[12px] text-gray-500 tabular-nums">{k.last_used}</span>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              title="Copy key id"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Revoke key"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityNote() {
  return (
    <div
      className="rounded-[20px] p-6 sm:p-7 mb-10 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start"
      style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "#FEF2F2" }}
      >
        <ShieldAlert className="w-4 h-4 text-red-600" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
          Treat secrets like passwords.
        </h3>
        <p className="mt-1 text-[13px] leading-[1.6] text-gray-700">
          Antry never displays a key&apos;s plaintext secret after creation —
          we only store an HMAC. If you lose a key, generate a new one and
          revoke the old. Keys never roll over between live and test; rotate
          on a schedule that matches your SOC2 controls.
        </p>
      </div>
    </div>
  );
}

function SdkExample() {
  return (
    <div className="rounded-[20px] p-6 sm:p-7" style={{ background: "#0A0A0A", color: "#fff" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "rgba(198,241,53,0.16)" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
        </span>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "#C6F135" }}
        >
          Quick start
        </p>
      </div>
      <pre
        className="text-[13px] font-mono leading-[1.6] overflow-x-auto p-4 rounded-[12px]"
        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)" }}
      >{`import { Antry } from "@antry/sdk";

const antry = new Antry({ apiKey: process.env.ANTRY_API_KEY });

const { data: receipts } = await antry.receipts.list({
  company: "your-slug",
  min_score: 80,
});`}</pre>
      <Link
        href="/docs/sdk"
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
        style={{ color: "#C6F135" }}
      >
        Full SDK reference →
      </Link>
    </div>
  );
}
