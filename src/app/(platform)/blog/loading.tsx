function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0.04) 100%)",
      }}
    />
  );
}

/**
 * Route-level loading skeleton for /blog. Mirrors the real layout: a header,
 * a category filter row, a featured article, and the post grid.
 */
export default function BlogLoading() {
  return (
    <main
      className="min-h-[100svh] bg-[#F7F8FA]"
      role="status"
      aria-label="Loading the blog"
    >
      <span className="sr-only">Loading the blog</span>
      <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="mt-3 h-10 w-full max-w-[420px]" />
        <Shimmer className="mt-4 h-4 w-full max-w-[560px]" />

        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Shimmer key={index} className="h-9 w-24" />
          ))}
        </div>

        <Shimmer className="mt-8 h-64 w-full rounded-lg" />

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-black/10 bg-white"
            >
              <Shimmer className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-5 w-full" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
