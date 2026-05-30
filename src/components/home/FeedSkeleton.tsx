/**
 * Loading skeleton for the feed list. Renders inside the same rounded
 * card frame as FeedCard so the swap is shape-preserving (low CLS).
 *
 * Pure CSS — no framer-motion. Uses Tailwind's animate-pulse.
 */

export function FeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
      aria-hidden
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="relative px-4 py-4 sm:py-5 sm:px-6"
          style={{ borderTop: i === 0 ? "none" : "1px solid #EBEBEB" }}
        >
          <span
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: "#EBEBEB" }}
          />
          <div className="flex gap-3 sm:gap-4 animate-pulse">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0"
              style={{ background: "#F5F5F5" }}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-24 rounded" style={{ background: "#F5F5F5" }} />
                <div className="h-3 w-16 rounded" style={{ background: "#F5F5F5" }} />
                <div className="ml-auto h-3 w-12 rounded" style={{ background: "#F5F5F5" }} />
              </div>
              <div className="h-4 w-4/5 rounded" style={{ background: "#F0F0F0" }} />
              <div className="h-3 w-3/5 rounded" style={{ background: "#F5F5F5" }} />
              <div className="flex items-center gap-3 pt-1">
                <div className="h-3 w-8 rounded" style={{ background: "#F5F5F5" }} />
                <div className="h-3 w-8 rounded" style={{ background: "#F5F5F5" }} />
                <div className="h-3 w-10 rounded" style={{ background: "#F5F5F5" }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
