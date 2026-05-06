import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/Nav";
import { getDemoBrief, demoBriefs } from "@/lib/receipts/demo-data";
import { LabClient } from "./LabClient";
import { enterBriefAction } from "./actions";

export async function generateStaticParams() {
  return demoBriefs.map((b) => ({ slug: b.slug }));
}

export const dynamic = "force-dynamic";

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

  // Mint a fresh Lab session (4-hour TTL).
  const { attemptId, sessionToken } = await enterBriefAction(slug);

  const gatewayMode = process.env.ANTHROPIC_API_KEY ? "anthropic" : "mock";

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

            <div className="inline-flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: "rgba(198,241,53,0.12)",
                  border: "1px solid rgba(198,241,53,0.28)",
                }}
              >
                <ShieldCheck className="w-3 h-3" style={{ color: "#C6F135" }} />
                <span
                  className="text-[10px] font-bold tracking-[0.18em] uppercase"
                  style={{ color: "#C6F135" }}
                >
                  Gateway live · {gatewayMode}
                </span>
              </span>
              {gatewayMode === "mock" && (
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  set ANTHROPIC_API_KEY for real Anthropic streaming
                </span>
              )}
            </div>
          </div>

          <LabClient brief={brief} attemptId={attemptId} sessionToken={sessionToken} />
        </div>
      </main>
    </>
  );
}
