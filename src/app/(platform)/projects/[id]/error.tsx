"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for the /projects/[id] route segment. Catches errors thrown
 * while rendering a project's detail page and offers a recovery path.
 */
export default function ProjectDetailError({
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
          title="This project failed to load"
          reset={reset}
          showRetry
          description={
            error.message ||
            "We hit a snag loading this project. Try again in a moment."
          }
          action={
            <Button variant="outline" size="sm" href="/discover">
              Explore the feed
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
