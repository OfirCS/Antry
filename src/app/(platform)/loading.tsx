function SkeletonLine({ className = "" }: { className?: string }) {
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

export default function PlatformLoading() {
  return (
    <section className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <SkeletonLine className="h-3 w-32" />
        <SkeletonLine className="mt-4 h-12 w-full max-w-[520px]" />
        <SkeletonLine className="mt-4 h-4 w-full max-w-[680px]" />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <SkeletonLine className="h-24" />
          <SkeletonLine className="h-24" />
          <SkeletonLine className="h-24" />
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-black/10 bg-white">
          <SkeletonLine className="h-10 rounded-none" />
          <div className="divide-y divide-black/10">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_140px_120px]">
                <SkeletonLine className="h-5" />
                <SkeletonLine className="h-5" />
                <SkeletonLine className="h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
