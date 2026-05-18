"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import "./globals.css";

/**
 * Global error boundary. This is the last line of defence — it catches errors
 * thrown in the root layout itself, so it must render its own <html> and
 * <body> (the root layout is unavailable here).
 */
export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <main
          style={{
            display: "flex",
            minHeight: "100svh",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1.5rem",
            background: "#ffffff",
          }}
        >
          <div style={{ width: "100%", maxWidth: "520px" }}>
            <ErrorState
              reset={reset}
              showRetry
              title="The app failed to load"
              description={
                error.message ||
                "A critical error stopped Antry from rendering. Please try again."
              }
            />
            {error.digest ? (
              <p
                style={{
                  marginTop: "1rem",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#6B7280",
                }}
              >
                Reference: {error.digest}
              </p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  );
}
