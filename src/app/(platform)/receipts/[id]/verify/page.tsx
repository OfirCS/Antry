// Public Receipt verification result page.
//
// The "Verify" affordance on a Receipt links here. Anyone — recruiter,
// teammate, drive-by stranger — can hit this URL without an account
// and see, in plain language, that the Receipt was signed by the Antry
// MCP Gateway and hasn't been tampered with.
//
// We deliberately fetch the public /api/receipts/[id]/verify surface
// server-side rather than reading demo-data directly: the API is the
// canonical verification interface, and rendering its output here
// proves the round-trip works. If the page renders "verified", anyone
// hitting the same JSON endpoint will see the same signature.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Hash,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

// Design tokens — light editorial. Matches the rest of the Receipt surface.
const PAGE_BG = "#FAFAF7";
const CARD_BG = "#FFFFFF";
const HAIRLINE = "#EBEBEB";
const INK = "#0A0A0A";
const LIME = "#C6F135";
// Green for the "verified" affordance — we want the visual signal to be
// unmistakable. The rest of the brand stays lime-on-ink; verified is the
// one place we use a green that reads as "passed a check".
const GREEN_BG = "#ECFDF5";
const GREEN_BORDER = "#86EFAC";
const GREEN_DEEP = "#047857";
const RED_BG = "#FEF2F2";
const RED_BORDER = "#FCA5A5";
const RED_DEEP = "#B91C1C";

type VerifyResponse = {
  verified: boolean;
  receipt_id: string;
  content_hash?: string;
  signature?: string | null;
  signed_at?: string;
  issuer?: string;
  verified_at?: string;
  reason?: string;
};

// Build the absolute base URL from the incoming request headers so the
// internal fetch works in dev, preview, and prod without a hard-coded
// origin. In a server component we can't use a relative URL with fetch.
async function absoluteBase(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  if (!host) {
    // Fall back to the configured site URL (used in static builds).
    return (
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://antry.com"
    );
  }
  return `${proto}://${host}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = `/receipts/${id}/verify`;
  const title = `Verify Receipt · ${id}`;
  const description =
    "Cryptographic verification of an Antry Receipt — the signed, portable proof of how a builder shipped.";
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: defaultOpenGraph({
      title,
      description,
      path,
      image: ogImageUrl({
        title: "Receipt verified",
        subtitle: id,
        eyebrow: "ANTRY · VERIFY",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await absoluteBase();

  let data: VerifyResponse | null = null;
  let status = 0;
  try {
    const res = await fetch(`${base}/api/receipts/${id}/verify`, {
      // Re-run the verification on each request — the whole point of a
      // verification page is "live status", not a cached page.
      cache: "no-store",
    });
    status = res.status;
    data = (await res.json()) as VerifyResponse;
  } catch {
    data = null;
  }

  // 404: the Receipt simply doesn't exist. Route to the Next.js
  // not-found page rather than a half-rendered failure state.
  if (status === 404 || !data) {
    notFound();
  }

  const verified = data.verified === true;
  const signedAt = data.signed_at ? new Date(data.signed_at) : null;
  const verifiedAt = data.verified_at ? new Date(data.verified_at) : null;

  return (
    <main style={{ background: PAGE_BG }} className="min-h-screen">
      {/* Lime accent stripe pinned to the very top — same convention as
          the Receipt page, so the visual rhyme is intentional. */}
      <div
        className="h-[3px] w-full"
        style={{ background: LIME }}
        aria-hidden
      />

      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pt-8 sm:pt-12 pb-24">
        {/* Breadcrumb back to the Receipt */}
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <Link
            href={`/receipts/${id}`}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Receipt
          </Link>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            Antry · Verify
          </p>
        </div>

        {/* Eyebrow + headline */}
        <div className="mb-8">
          <p
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] mb-4"
            style={{ color: verified ? GREEN_DEEP : RED_DEEP }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: verified ? GREEN_DEEP : RED_DEEP }}
            />
            {verified ? "Verified" : "Verification failed"}
          </p>
          <h1
            className="font-display font-bold tracking-[-0.03em] leading-[1.05]"
            style={{
              color: INK,
              fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            }}
          >
            {verified ? "Receipt verified." : "Receipt failed verification."}
          </h1>
          <p
            className="mt-3 text-[14px] leading-[1.6] max-w-[520px]"
            style={{ color: "#525252" }}
          >
            {verified
              ? "This Receipt was signed by the Antry MCP Gateway at mint time. The signature and content hash below were re-checked against our records on this request."
              : "We could not confirm this Receipt's signature against our records. It may have been tampered with after minting, or it was never signed by the Antry Gateway."}
          </p>
        </div>

        {/* Result card — green for verified, red for failure. Big and
            obvious; a recruiter should not need to read fine print to
            know what they're looking at. */}
        <section
          className="rounded-[20px] p-6 sm:p-8"
          style={{
            background: verified ? GREEN_BG : RED_BG,
            border: `1px solid ${verified ? GREEN_BORDER : RED_BORDER}`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "#FFFFFF",
                border: `1px solid ${verified ? GREEN_BORDER : RED_BORDER}`,
              }}
            >
              {verified ? (
                <ShieldCheck
                  className="w-6 h-6"
                  style={{ color: GREEN_DEEP }}
                  aria-hidden
                />
              ) : (
                <ShieldAlert
                  className="w-6 h-6"
                  style={{ color: RED_DEEP }}
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: verified ? GREEN_DEEP : RED_DEEP }}
              >
                {verified ? "Signature valid" : "Signature invalid"}
              </p>
              <p
                className="mt-1 font-display font-bold tracking-[-0.015em]"
                style={{
                  color: INK,
                  fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                  lineHeight: 1.25,
                }}
              >
                {verified
                  ? `Issued by ${data.issuer ?? "Antry MCP Gateway"}.`
                  : data.reason
                    ? `Reason: ${data.reason.replace(/_/g, " ")}.`
                    : "Signature did not match the stored value."}
              </p>
              {verifiedAt && (
                <p className="mt-2 text-[12px]" style={{ color: "#525252" }}>
                  Re-checked{" "}
                  <span className="font-mono">
                    {verifiedAt.toISOString().slice(0, 19).replace("T", " ")} UTC
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Signature details — only render when there's something to show. */}
          {(data.content_hash || data.signature || signedAt) && (
            <dl
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t"
              style={{
                borderColor: verified ? GREEN_BORDER : RED_BORDER,
              }}
            >
              {data.content_hash && (
                <DetailRow
                  icon={<Hash className="w-3 h-3" />}
                  label="Content hash"
                  value={data.content_hash}
                  mono
                />
              )}
              {data.signature && (
                <DetailRow
                  icon={<KeyRound className="w-3 h-3" />}
                  label="Signature (HMAC-SHA256)"
                  value={data.signature}
                  mono
                />
              )}
              {signedAt && (
                <DetailRow
                  icon={<Clock className="w-3 h-3" />}
                  label="Signed at"
                  value={`${signedAt.toISOString().slice(0, 19).replace("T", " ")} UTC`}
                />
              )}
              {data.issuer && (
                <DetailRow
                  icon={<ShieldCheck className="w-3 h-3" />}
                  label="Issuer"
                  value={data.issuer}
                />
              )}
            </dl>
          )}
        </section>

        {/* CTA back to the rendered Receipt */}
        <div className="mt-8 flex items-center gap-4 flex-wrap">
          <Link
            href={`/receipts/${id}`}
            className="inline-flex items-center gap-2 rounded-[12px] h-[44px] px-5 text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: INK, color: "#FFFFFF" }}
          >
            View Receipt
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/api/receipts/${id}/verify`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[12px] font-semibold underline underline-offset-4 hover:opacity-70"
            style={{ color: INK }}
          >
            View verification JSON
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* "How verification works" — 3 sentence factual explainer. The
            audience here is a recruiter who has never heard of Antry,
            so we keep it concrete and avoid marketing language. */}
        <section
          className="mt-12 rounded-[16px] p-6"
          style={{ background: CARD_BG, border: `1px solid ${HAIRLINE}` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: PAGE_BG, border: `1px solid ${HAIRLINE}` }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: INK }} aria-hidden />
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#737373" }}
              >
                How verification works
              </p>
              <h2
                className="mt-1 font-display font-bold tracking-[-0.015em]"
                style={{
                  color: INK,
                  fontSize: "1.05rem",
                  lineHeight: 1.3,
                }}
              >
                Three steps, all deterministic.
              </h2>
            </div>
          </div>
          <ol
            className="mt-5 space-y-3 text-[13.5px] leading-[1.6]"
            style={{ color: "#404040" }}
          >
            <li>
              <span
                className="font-bold tabular-nums mr-2"
                style={{ color: INK }}
              >
                1.
              </span>
              When a builder finishes a Brief, the Antry Gateway canonicalises
              the Receipt and signs it with HMAC-SHA256 under a key only Antry
              holds. The signature is stored alongside the Receipt at mint
              time and never re-derived from live data.
            </li>
            <li>
              <span
                className="font-bold tabular-nums mr-2"
                style={{ color: INK }}
              >
                2.
              </span>
              When you visit this page, Antry refetches the stored signature
              and the original canonical form, then compares them. Any
              mutation to the fingerprint, score, or signed_at field after
              minting breaks the check.
            </li>
            <li>
              <span
                className="font-bold tabular-nums mr-2"
                style={{ color: INK }}
              >
                3.
              </span>
              The same answer is available as machine-readable JSON at{" "}
              <code
                className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                style={{ background: PAGE_BG, border: `1px solid ${HAIRLINE}` }}
              >
                /api/receipts/{id}/verify
              </code>
              {" "}— so third-party tools (HR systems, hiring rubrics) can
              verify Receipts without ever loading antry.com in a browser.
            </li>
          </ol>
        </section>

        {/* Methodology footer link — quiet but discoverable. */}
        <p className="mt-6 text-[12px]" style={{ color: "#737373" }}>
          Want the long version?{" "}
          <Link
            href="/receipts/methodology"
            className="underline underline-offset-4 hover:text-neutral-900"
          >
            Read the full methodology
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt
        className="text-[9px] font-bold uppercase tracking-[0.22em] inline-flex items-center gap-1"
        style={{ color: "#737373" }}
      >
        {icon}
        {label}
      </dt>
      <dd
        className={`mt-1 text-[12px] break-all ${mono ? "font-mono" : ""}`}
        style={{ color: "#262626" }}
      >
        {value}
      </dd>
    </div>
  );
}
