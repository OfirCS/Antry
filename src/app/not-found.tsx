import type { Metadata } from "next";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist or has moved.",
};

/**
 * Root 404 boundary. Rendered inside the root layout whenever a route is not
 * matched or `notFound()` is called.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-[520px]">
        <EmptyState
          icon={<FileQuestion className="h-6 w-6" />}
          title="404 — Page not found"
          description="The page you're looking for doesn't exist or has moved. Check the URL, or head back to safe ground."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="sm" href="/">
                Go home
              </Button>
              <Button variant="outline" size="sm" href="/discover">
                Browse projects
              </Button>
            </div>
          }
        />
      </div>
    </main>
  );
}
