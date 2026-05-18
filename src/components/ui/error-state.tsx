"use client";

import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * ErrorState — the canonical "something went wrong" surface.
 *
 * Designed to be dropped straight into a Next.js `error.tsx` boundary, where
 * `reset` is the framework-provided recovery callback. It also works as a
 * standalone inline error (e.g. a failed fetch inside a card) — just omit
 * `reset`.
 *
 * @example  // inside app/error.tsx
 *   "use client";
 *   export default function Error({ error, reset }) {
 *     return <ErrorState reset={reset} description={error.message} />;
 *   }
 */
export interface ErrorStateProps {
  /** Headline. Defaults to a friendly generic message. */
  title?: string;
  /** Supporting copy — safe to pass `error.message` here. */
  description?: ReactNode;
  /** Recovery callback, typically the `reset` prop from a Next.js error boundary. */
  reset?: () => void;
  /**
   * Whether to render the "Try again" retry button.
   * Defaults to `true` when `reset` is provided, `false` otherwise.
   */
  showRetry?: boolean;
  /** Optional extra action node rendered next to the retry button. */
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again, or head back and retry in a moment.",
  reset,
  showRetry,
  action,
  className,
}: ErrorStateProps) {
  const retryVisible = (showRetry ?? Boolean(reset)) && Boolean(reset);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-lg border border-border bg-bg-warm",
        "px-6 py-14 sm:py-16",
        className,
      )}
    >
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"
        aria-hidden="true"
      >
        <TriangleAlert className="h-6 w-6" />
      </div>
      <h2 className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-[440px] text-[14px] leading-[1.6] text-text-secondary">
          {description}
        </p>
      ) : null}
      {retryVisible || action ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {retryVisible ? (
            <Button variant="default" size="sm" onClick={reset}>
              Try again
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default ErrorState;
