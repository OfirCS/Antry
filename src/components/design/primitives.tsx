// Antry design primitives.
//
// Use these on every page to keep the system tight. They encode the
// canonical values for spacing, color, typography, and motion. If you
// find yourself repeating any of the JSX patterns below, reach for one
// of these instead.
//
// Tokens (single source of truth):
//   ink           = #0A0A0A   (the deepest black; preferred over #111)
//   ink-soft      = #1A1A1A
//   bg-warm       = #FAFAF7   (off-white)
//   bg            = #FFFFFF
//   border        = #EBEBEB
//   border-soft   = #F5F5F5
//   lime          = #C6F135   (the accent)
//   text-muted    = rgba(255,255,255,0.55) on dark / #525252 on light
//   text-faint    = rgba(255,255,255,0.40) on dark / #737373 on light
//
// Typography hierarchy:
//   editorial-h1  = clamp(2.6rem, 6vw, 4.6rem),  font-display, weight 700, tracking -0.04em, leading 0.98
//   editorial-h2  = clamp(2rem, 4.5vw, 3rem),    font-display, weight 700, tracking -0.035em, leading 1.05
//   editorial-h3  = clamp(1.6rem, 3.2vw, 2.2rem), font-display, weight 700, tracking -0.025em, leading 1.08
//   editorial-h4  = clamp(1.25rem, 2.5vw, 1.6rem), font-display, weight 700, tracking -0.015em, leading 1.2
//   eyebrow       = 11px,  font-sans, weight 700, uppercase, tracking 0.22em
//
// Sectioning:
//   section-pad   = py-24 sm:py-28 (98px → 112px)
//   hero-pad      = pt-20 pb-32 sm:pt-24 sm:pb-36

import type { ReactNode, CSSProperties } from "react";

// ─────────────────────────────────────────────────────
// Eyebrow — the small uppercase label on every page.
// ─────────────────────────────────────────────────────
export function Eyebrow({
  children,
  tone = "default",
  className = "",
  color,
}: {
  children: ReactNode;
  tone?: "default" | "lime" | "ink" | "muted";
  className?: string;
  /** Override colour explicitly (sponsor color etc) */
  color?: string;
}) {
  const baseColor =
    color ??
    (tone === "lime"
      ? "#C6F135"
      : tone === "ink"
        ? "#0A0A0A"
        : tone === "muted"
          ? "rgba(255,255,255,0.55)"
          : "#737373");
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.22em] ${className}`}
      style={{ color: baseColor }}
    >
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────
// Editorial typography
// ─────────────────────────────────────────────────────
export function EditorialH1({
  children,
  className = "",
  style,
  invert = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Light text on dark background */
  invert?: boolean;
}) {
  return (
    <h1
      className={`font-display font-bold leading-[0.98] tracking-[-0.04em] ${className}`}
      style={{
        color: invert ? "#FFFFFF" : "#0A0A0A",
        fontSize: "clamp(2.6rem, 6vw, 4.6rem)",
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

export function EditorialH2({
  children,
  className = "",
  style,
  invert = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  invert?: boolean;
}) {
  return (
    <h2
      className={`font-display font-bold leading-[1.05] tracking-[-0.035em] ${className}`}
      style={{
        color: invert ? "#FFFFFF" : "#0A0A0A",
        fontSize: "clamp(2rem, 4.5vw, 3rem)",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function EditorialH3({
  children,
  className = "",
  style,
  invert = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  invert?: boolean;
}) {
  return (
    <h3
      className={`font-display font-bold leading-[1.08] tracking-[-0.025em] ${className}`}
      style={{
        color: invert ? "#FFFFFF" : "#0A0A0A",
        fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

// ─────────────────────────────────────────────────────
// DarkHero — the canonical dark hero pattern used on
// /, /briefs, /pricing, /missions, /c/[slug]/*, etc.
// Sponsor color tints the radial glow + eyebrow.
// ─────────────────────────────────────────────────────
export function DarkHero({
  children,
  sponsorColor = "#C6F135",
  showGrid = true,
  className = "",
}: {
  children: ReactNode;
  sponsorColor?: string;
  showGrid?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ background: "#0A0A0A" }}
    >
      {/* Top-centre lime glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${
            sponsorColor === "#C6F135" ? "rgba(198,241,53,0.16)" : `${sponsorColor}26`
          } 0%, transparent 55%)`,
        }}
      />
      {/* Subtle grid */}
      {showGrid && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      )}
      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10 pt-20 pb-32 sm:pt-24 sm:pb-36">
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────
// Section — a light-background section with consistent
// padding and a max-width container.
// ─────────────────────────────────────────────────────
export function Section({
  children,
  background = "#FFFFFF",
  border = false,
  padded = true,
  pull = false,
  className = "",
}: {
  children: ReactNode;
  background?: "#FFFFFF" | "#FAFAF7";
  border?: boolean;
  /** Apply standard vertical padding (py-24 sm:py-28) */
  padded?: boolean;
  /** Pull the inner container up by ~80px to overlap the hero */
  pull?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`${border ? "border-y border-gray-100" : ""} ${className}`}
      style={{ background }}
    >
      <div
        className={`mx-auto max-w-[1240px] px-6 sm:px-10 ${
          padded ? "py-24 sm:py-28" : ""
        } ${pull ? "-mt-20 sm:-mt-24 pb-24 relative z-10" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────
// Card — uniform white card with the canonical border.
// Use `tone="warm"` for the off-white variant, `tone="dark"` for
// the inverted variant used on dark backgrounds.
// ─────────────────────────────────────────────────────
export function Card({
  children,
  tone = "default",
  hoverable = false,
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: "default" | "warm" | "dark";
  hoverable?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    background:
      tone === "warm" ? "#FAFAF7" : tone === "dark" ? "#0A0A0A" : "#FFFFFF",
    border:
      tone === "dark"
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid #EBEBEB",
    boxShadow:
      tone === "dark" ? "none" : "0 1px 0 rgba(0,0,0,0.03)",
    color: tone === "dark" ? "#FFFFFF" : "#0A0A0A",
  };
  return (
    <div
      className={`rounded-[20px] ${
        hoverable ? "transition-all duration-300 hover:-translate-y-1" : ""
      } ${className}`}
      style={{ ...base, ...style }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SectionHeader — the eyebrow + h2 + subtitle pattern
// used at the top of many sections. Optional right-aligned
// CTA link.
// ─────────────────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  rightSlot,
  invert = false,
  className = "",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  rightSlot?: ReactNode;
  invert?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between flex-wrap gap-4 ${className}`}>
      <div className="max-w-[760px]">
        {eyebrow && (
          <Eyebrow tone={invert ? "muted" : "default"} className="mb-3">
            {eyebrow}
          </Eyebrow>
        )}
        <EditorialH2 invert={invert}>{title}</EditorialH2>
        {subtitle && (
          <p
            className="mt-4 text-[15px] sm:text-[16px] leading-[1.6] max-w-[560px]"
            style={{ color: invert ? "rgba(255,255,255,0.65)" : "#525252" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}
