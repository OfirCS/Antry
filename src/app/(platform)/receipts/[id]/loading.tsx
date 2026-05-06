import { Nav } from "@/components/Nav";
import { Skeleton } from "@/components/design/Skeleton";

export default function ReceiptLoading() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
          <div className="relative mx-auto max-w-[1080px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
            <Skeleton className="h-3 w-32 bg-white/10 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-10 items-center">
              <Skeleton className="w-[88px] h-[88px] bg-white/10" rounded="rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-48 bg-white/10" />
                <Skeleton className="h-8 w-full max-w-[440px] bg-white/10" rounded="rounded-lg" />
                <Skeleton className="h-3 w-24 bg-white/10" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-16 w-32 bg-white/10" rounded="rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-24 sm:-mt-28 pb-24 relative z-10">
            {/* Main fingerprint card */}
            <div
              className="rounded-[28px] bg-white overflow-hidden"
              style={{
                border: "1px solid #EBEBEB",
                boxShadow:
                  "0 1px 0 rgba(0,0,0,0.03), 0 32px 64px -32px rgba(0,0,0,0.12)",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
                <div
                  className="p-8 flex flex-col items-center justify-center"
                  style={{ background: "#FAFAF7" }}
                >
                  {/* Hexagonal radar shape skeleton */}
                  <Skeleton
                    className="w-[300px] h-[300px]"
                    rounded="rounded-full"
                  />
                </div>
                <div className="p-8 lg:p-10 space-y-4">
                  <Skeleton className="h-3 w-32" />
                  <div className="space-y-2.5 pt-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-6 h-6" rounded="rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-[60px]" rounded="rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension grid skeleton */}
            <div className="mt-10 space-y-3">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-7 w-72" rounded="rounded-lg" />
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-[110px]" rounded="rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
