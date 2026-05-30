"use client";

import { useState } from "react";
import { Copy, Check, Linkedin, FileDown, Github } from "lucide-react";
import { SettingsCard } from "../_components/SettingsCard";

/**
 * Portability surfaces — README badge, LinkedIn link, PDF export.
 *
 * Each section is a SettingsCard with a single primary action. The
 * README badge preview is a static SVG-shaped placeholder (lime accent,
 * handle, composite score) so the user knows what their visitors will
 * actually see. PDF is `window.print()` for now; the print CSS hint is
 * inlined so the resume looks clean off the bat.
 */
export function PortabilityClient({ username }: { username: string }) {
  const profileUrl = `https://antry.com/u/${username}`;
  const badgeSnippet = `<a href="${profileUrl}">
  <img src="https://antry.com/api/u/${username}/badge.svg" alt="Antry" />
</a>`;

  return (
    <>
      <SettingsCard
        title="GitHub README"
        caption="Drop this snippet into your repo's README. Updates live as your score changes."
      >
        <div className="p-6 sm:p-7">
          <BadgePreview username={username} />

          <div className="mt-5">
            <CodeSnippet code={badgeSnippet} label="Copy snippet" />
          </div>
          <p
            className="mt-3 inline-flex items-center gap-1.5 text-[12px]"
            style={{ color: "#737373" }}
          >
            <Github className="h-3 w-3" />
            Renders the same badge on GitHub, GitLab, or any markdown surface.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard
        title="LinkedIn"
        caption="Pin your Antry profile in your featured section. Recruiters click it first."
      >
        <div className="p-6 sm:p-7">
          <CodeSnippet code={profileUrl} label="Copy URL" inline />
          <ul
            className="mt-5 space-y-2 text-[13px]"
            style={{ color: "#525252" }}
          >
            <li className="flex gap-2">
              <span style={{ color: "#0A0A0A" }}>1.</span>
              <span>
                Open your LinkedIn profile and click{" "}
                <span style={{ color: "#0A0A0A", fontWeight: 600 }}>
                  Add featured
                </span>{" "}
                in the Featured section.
              </span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: "#0A0A0A" }}>2.</span>
              <span>
                Choose{" "}
                <span style={{ color: "#0A0A0A", fontWeight: 600 }}>Add a link</span>{" "}
                and paste the URL above.
              </span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: "#0A0A0A" }}>3.</span>
              <span>
                Tip: pin your top Receipt as a separate featured link so
                visitors land on a proof, not a profile.
              </span>
            </li>
          </ul>
          <a
            href="https://www.linkedin.com/in/me/edit/forms/featured/new/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-[40px] items-center gap-2 rounded-full px-5 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: "#0A0A0A", color: "#FFFFFF" }}
          >
            <Linkedin className="h-3.5 w-3.5" />
            Open LinkedIn featured
          </a>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Resume"
        caption="A signed PDF that travels with you, even if Antry goes dark."
      >
        <div className="p-6 sm:p-7">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-[44px] items-center gap-2 rounded-full px-6 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: "#C6F135", color: "#0A0A0A" }}
          >
            <FileDown className="h-3.5 w-3.5" />
            Generate PDF resume
          </button>
          <p
            className="mt-3 text-[12px]"
            style={{ color: "#737373" }}
          >
            Includes your top 3 Receipts, Fingerprint, and verifiable
            signatures.
          </p>
        </div>
      </SettingsCard>

      {/* Print-friendly stylesheet hint: hide nav and card chrome when
          the browser is in print mode so the resume reads cleanly. */}
      <style jsx global>{`
        @media print {
          nav,
          header p,
          button {
            display: none !important;
          }
          body {
            background: #ffffff !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Static SVG-shaped preview of the README badge. Not the real svg — the
 * real one is rendered by the (out-of-scope) /api/u/[username]/badge.svg
 * endpoint. This is the visual contract: lime accent strip, builder
 * handle, composite score, micro-mark.
 */
function BadgePreview({ username }: { username: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[12px]"
      style={{
        background: "#0A0A0A",
        width: "100%",
        maxWidth: 360,
        aspectRatio: "360 / 96",
        border: "1px solid #EBEBEB",
      }}
      aria-label="Antry badge preview"
    >
      <div
        className="absolute left-0 top-0 h-full"
        style={{ width: 6, background: "#C6F135" }}
      />
      <div className="flex h-full items-center justify-between gap-4 pl-6 pr-5">
        <div className="min-w-0">
          <p
            className="text-[9px] font-bold uppercase tracking-[0.28em]"
            style={{ color: "#A3A3A3" }}
          >
            Antry
          </p>
          <p
            className="mt-1 truncate font-display text-[15px] font-bold tracking-[-0.01em]"
            style={{ color: "#FFFFFF" }}
          >
            @{username}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className="text-[9px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#A3A3A3" }}
          >
            Score
          </p>
          <p
            className="mt-1 font-display text-[22px] font-bold leading-none tracking-[-0.02em]"
            style={{ color: "#C6F135" }}
          >
            872
          </p>
        </div>
      </div>
    </div>
  );
}

function CodeSnippet({
  code,
  label,
  inline,
}: {
  code: string;
  label: string;
  inline?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="flex items-start gap-2 rounded-[12px] p-3"
      style={{ background: "#0A0A0A" }}
    >
      {inline ? (
        <code
          className="flex-1 truncate font-mono text-[12px] leading-[1.55]"
          style={{ color: "#FFFFFF" }}
        >
          {code}
        </code>
      ) : (
        <pre
          className="flex-1 overflow-x-auto font-mono text-[12px] leading-[1.55] whitespace-pre"
          style={{ color: "#FFFFFF" }}
        >
          {code}
        </pre>
      )}
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: "#C6F135", color: "#0A0A0A" }}
        aria-label={label}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" strokeWidth={3} />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
