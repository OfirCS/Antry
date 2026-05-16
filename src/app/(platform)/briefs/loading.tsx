import { Skeleton } from "@/components/design/Skeleton";

export default function BriefsLoading() {
  return (
    <section className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="border-b border-gray-200 pb-6">
          <Skeleton className="mb-3 h-6 w-40 rounded-md" />
          <Skeleton className="h-10 w-full max-w-[360px] rounded-md" />
          <Skeleton className="mt-3 h-4 w-full max-w-[620px] rounded-md" />
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="mt-2 h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <Skeleton className="mb-3 h-4 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="mb-2 h-9 w-full rounded-md last:mb-0" />
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, column) => (
                <div key={column} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 2 }).map((_, item) => (
                      <Skeleton key={item} className="h-28 w-full rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <Skeleton className="h-5 w-36 rounded-md" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
