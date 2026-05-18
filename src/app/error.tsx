"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary. Catches errors thrown while rendering route segments
 * below the root layout. The layout (and <html>/<body>) stay mounted, so this
 * only needs to render the page body.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the console for local debugging / error reporting.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-[520px]">
        <ErrorState
          reset={reset}
          showRetry
          description={
            error.message ||
            "An unexpected error occurred while loading this page."
          }
          action={
            <Button variant="outline" size="sm" href="/">
              Go home
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
