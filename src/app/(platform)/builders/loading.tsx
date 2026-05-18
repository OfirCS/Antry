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
 * Route-level loading skeleton for /builders. Mirrors the real directory
 * layout: a header, a sticky search + segment bar, and the builder table.
 */
export default function BuildersLoading() {
  return (
    <main
      className="min-h-[100svh] bg-[#F7F8FA]"
      role="status"
      aria-label="Loading the builder directory"
    >
      <span className="sr-only">Loading the builder directory</span>
      <section className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-black/10 pb-7">
          <Shimmer className="h-3 w-28" />
          <Shimmer className="mt-3 h-12 w-full max-w-[520px]" />
          <Shimmer className="mt-4 h-4 w-full max-w-[640px]" />
        </div>

        {/* Search + segments */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Shimmer className="h-10 w-full sm:max-w-[320px]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Shimmer key={index} className="h-9 w-20" />
            ))}
          </div>
        </div>

        <Shimmer className="mt-4 h-4 w-28" />

        {/* Builder table */}
        <div className="mt-3 overflow-hidden rounded-md border border-black/10 bg-white">
          <Shimmer className="h-10 rounded-none" />
          <div className="divide-y divide-black/10">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_0.55fr_0.32fr_0.32fr_0.18fr] lg:items-center"
              >
                <div className="flex items-center gap-3">
                  <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Shimmer className="h-3.5 w-36" />
                    <Shimmer className="h-3 w-24" />
                  </div>
                </div>
                <Shimmer className="h-5 w-full" />
                <Shimmer className="h-5 w-12" />
                <Shimmer className="h-5 w-12" />
                <Shimmer className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
