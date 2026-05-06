import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "cream" | "white" | "ink" | "sand";

const TONE_BG: Record<Tone, string> = {
  cream: "#FAFAF7",
  white: "#FFFFFF",
  ink: "#0A0A0A",
  sand: "#F4F1EA",
};

/**
 * Page section primitive. Always pads top/bottom on a generous Wealthsimple-style
 * scale (96px desktop, 72px mobile). Pass `tone` to switch background.
 */
export function Section({
  tone = "white",
  className,
  children,
  innerClassName,
  maxWidth = "max-w-[1080px]",
  ...rest
}: {
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  maxWidth?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className">) {
  return (
    <section
      className={cn("py-20 sm:py-28", className)}
      style={{ background: TONE_BG[tone] }}
      {...rest}
    >
      <div className={cn("mx-auto px-6 sm:px-10", maxWidth, innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * Tiny tracking-wide eyebrow label. Use above section headlines for rhythm.
 */
export function Eyebrow({
  className,
  color,
  children,
}: {
  className?: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.22em]",
        className
      )}
      style={{ color: color ?? "#737373" }}
    >
      {children}
    </p>
  );
}
