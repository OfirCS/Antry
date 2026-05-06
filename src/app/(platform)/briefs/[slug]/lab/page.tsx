import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Nav } from "@/components/Nav";
import { getDemoBrief, demoBriefs } from "@/lib/receipts/demo-data";
import { LabPreviewClient } from "./LabPreviewClient";

export async function generateStaticParams() {
  return demoBriefs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brief = getDemoBrief(slug);
  return {
    title: brief ? `Lab · ${brief.title}` : "Lab",
    description: "Instrumented sandbox for solving Antry Briefs.",
    alternates: { canonical: `/briefs/${slug}/lab` },
    robots: { index: false, follow: true },
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brief = getDemoBrief(slug);
  if (!brief) notFound();

  return (
    <>
      <Nav />
      <main style={{ background: "#0A0A0A", minHeight: "100vh" }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <Link
              href={`/briefs/${slug}`}
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Brief
            </Link>

            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: "rgba(245,158,11,0.14)",
                border: "1px solid rgba(245,158,11,0.32)",
              }}
            >
              <AlertCircle className="w-3 h-3" style={{ color: "#F59E0B" }} />
              <span
                className="text-[10px] font-bold tracking-[0.18em] uppercase"
                style={{ color: "#F59E0B" }}
              >
                Lab preview · gateway not live yet (v0.2)
              </span>
            </div>
          </div>

          <LabPreviewClient brief={brief} />
        </div>
      </main>
    </>
  );
}
