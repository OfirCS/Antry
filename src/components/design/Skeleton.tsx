import { cn } from "@/lib/utils";

/**
 * Subtle shimmer skeleton block — matches Linear/Vercel pattern: a soft
 * #F7F8FA rectangle that pulses at 1.5s. Use as a placeholder for content
 * shape, never for stand-alone "loading…" text.
 */
export function Skeleton({
  className,
  rounded = "rounded-md",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { rounded?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse",
        rounded,
        className,
      )}
      style={{
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0.04) 100%)",
      }}
      {...rest}
    />
  );
}
