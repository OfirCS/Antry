import type { Metadata } from "next";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs } from "@/lib/receipts/demo-data";

const TITLE = "Briefs — Antry";
const DESCRIPTION =
  "Real AI engineering missions from real companies. Ship in Cursor with the Antry MCP, mint a signed Receipt.";

export const metadata: Metadata = {
  title: "Briefs",
  description: DESCRIPTION,
  alternates: { canonical: "/briefs" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/briefs",
    image: ogImageUrl({
      title: "Briefs.",
      subtitle: "Ship in Cursor. Mint a signed Receipt.",
      eyebrow: "ANTRY",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const DIFFICULTY_BG: Record<string, string> = {
  intro: "#A7F3D0",
  mid: "#3B82F6",
  senior: "#8B5CF6",
  staff: "#EC4899",
};
const DIFFICULTY_FG: Record<string, string> = {
  intro: "#0A0A0A",
  mid: "#FFFFFF",
  senior: "#FFFFFF",
  staff: "#FFFFFF",
};

export default function BriefsPage() {
  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#0A0A0A" }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-7 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
              Briefs
            </p>
            <h1
              className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
            >
              The resume for the AI era.
            </h1>
            <p className="mt-2 max-w-[520px] text-[14px] leading-[1.55] text-gray-600">
              Pick a Brief. Start in Cursor with the Antry MCP. Mint a
              signed Receipt that proves how you actually code.
            </p>
          </div>
          <Link
            href="/briefs/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#0A0A0A", color: "#FFFFFF" }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Author a Brief
          </Link>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoBriefs.map((b) => (
            <Link
              key={b.id}
              href={`/briefs/${b.slug}`}
              className="group rounded-[14px] p-5 transition-colors hover:bg-[#FAFAF7]"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em] inline-flex items-center gap-1.5"
                  style={{ color: b.company.sponsor_color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: b.company.sponsor_color }}
                  />
                  {b.company.name}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                  style={{
                    background: DIFFICULTY_BG[b.difficulty],
                    color: DIFFICULTY_FG[b.difficulty],
                  }}
                >
                  {b.difficulty}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">
                  {b.category}
                </span>
              </div>
              <h3 className="text-[16px] font-bold tracking-[-0.005em] text-black leading-[1.3]">
                {b.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-gray-600 line-clamp-2">
                {b.tagline}
              </p>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-500">
                <span>{b.attempts_count} attempts</span>
                <span>{b.receipts_count} Receipts</span>
                <span>
                  Median{" "}
                  <span className="text-black font-bold tabular-nums">
                    {b.median_score ?? "—"}
                  </span>
                </span>
                <span className="ml-auto">
                  {Math.round(b.time_cap_seconds / 60)}m cap
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
