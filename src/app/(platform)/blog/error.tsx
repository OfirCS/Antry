"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for the /blog route segment. Catches errors thrown while
 * rendering the blog index or an article and offers a recovery path.
 */
export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F7F8FA] px-6 py-16">
      <div className="w-full max-w-[520px]">
        <ErrorState
          title="The blog failed to load"
          reset={reset}
          showRetry
          description={
            error.message ||
            "We hit a snag loading the blog. Try again in a moment."
          }
          action={
            <Button variant="outline" size="sm" href="/discover">
              Back to the feed
            </Button>
          }
        />
        {error.digest ? (
          <p className="mt-4 text-center text-[12px] text-text-tertiary">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
