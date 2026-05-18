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
 * Route-level loading skeleton for /hackathons. Mirrors the real layout: a
 * featured banner, a sticky search + filter bar, and the stacked event list.
 */
export default function HackathonsLoading() {
  return (
    <main
      className="min-h-[100svh] bg-[#F7F8FA]"
      role="status"
      aria-label="Loading hackathons"
    >
      <span className="sr-only">Loading hackathons</span>
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <Shimmer className="h-44 w-full rounded-lg" />
      </div>

      <div className="border-b border-black/[0.06]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Shimmer className="h-10 w-full sm:max-w-[320px]" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }, (_, index) => (
              <Shimmer key={index} className="h-9 w-20" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8">
        <Shimmer className="mb-5 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Shimmer key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
