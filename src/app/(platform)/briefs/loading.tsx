import { Nav } from "@/components/Nav";
import { Skeleton } from "@/components/design/Skeleton";

export default function BriefsLoading() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
          <div className="relative mx-auto max-w-[1080px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
            <Skeleton className="h-3 w-40 bg-white/10 mb-6" />
            <Skeleton className="h-12 sm:h-16 max-w-[680px] bg-white/10 mb-4" rounded="rounded-lg" />
            <Skeleton className="h-12 sm:h-16 max-w-[520px] bg-white/10 mb-7" rounded="rounded-lg" />
            <Skeleton className="h-5 max-w-[480px] bg-white/8" />
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <BriefCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function BriefCardSkeleton() {
  return (
    <div
      className="rounded-[20px] bg-white overflow-hidden"
      style={{ border: "1px solid #EBEBEB", boxShadow: "0 1px 0 rgba(0,0,0,0.03)" }}
    >
      <Skeleton className="h-1.5 w-full" rounded="rounded-none" />
      <div className="p-6 grid grid-cols-[1fr_auto] gap-4 items-start">
        <div className="space-y-3 w-full">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-full max-w-[280px]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
        <Skeleton className="w-[88px] h-[88px]" rounded="rounded-2xl" />
      </div>
    </div>
  );
}
