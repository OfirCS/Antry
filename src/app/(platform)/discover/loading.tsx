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
 * Route-level loading skeleton for /discover. Mirrors the real feed layout:
 * a header, a composer/search row, the filter tab strip, and a two-column
 * feed + sidebar grid.
 */
export default function DiscoverLoading() {
  return (
    <main
      className="min-h-[100svh] bg-[#FBFAF7]"
      role="status"
      aria-label="Loading the community feed"
    >
      <span className="sr-only">Loading the community feed</span>
      <section className="mx-auto max-w-[1160px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-6 border-b border-black/10 pb-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
          <div className="min-w-0">
            <Shimmer className="h-3 w-32" />
            <Shimmer className="mt-3 h-12 w-full max-w-[620px]" />
            <Shimmer className="mt-4 h-4 w-full max-w-[520px]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Shimmer className="h-14" />
            <Shimmer className="h-14" />
            <Shimmer className="h-14" />
          </div>
        </div>

        {/* Composer + search row */}
        <div className="grid gap-3 border-b border-black/10 py-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Shimmer className="h-14" />
          <Shimmer className="h-10" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-black/10 py-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Shimmer key={index} className="h-9 w-20" />
          ))}
        </div>

        {/* Feed + sidebar */}
        <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0 space-y-5">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 border-b border-black/10 pb-5"
              >
                <Shimmer className="h-10 w-10 rounded-full" />
                <div className="min-w-0 space-y-2.5">
                  <Shimmer className="h-3.5 w-40" />
                  <Shimmer className="h-4 w-full max-w-[440px]" />
                  <Shimmer className="h-4 w-full max-w-[320px]" />
                  <Shimmer className="mt-1 h-28 w-full" />
                </div>
              </div>
            ))}
          </div>
          <aside className="hidden space-y-3 lg:block">
            <Shimmer className="h-40 w-full" />
            <Shimmer className="h-52 w-full" />
          </aside>
        </div>
      </section>
    </main>
  );
}
