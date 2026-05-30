"use client";

/**
 * Live status + countdown line for /h/[slug].
 *
 * Renders one of:
 *   - "Live · ends in 12h 34m"     (record has ends_at in the future)
 *   - "Live · started 4h ago"      (no ends_at, or ends_at within fuzz of now)
 *   - "Starts in 2h 10m"           (starts_at in the future)
 *   - "Closed · ended 3d ago"      (ends_at in the past)
 *
 * Updates every minute via setInterval. We intentionally avoid second-level
 * precision — hosts share /h/[slug] URLs over hours, not seconds, and a
 * sub-minute ticker would re-render constantly without adding signal.
 */

import { useEffect, useState } from "react";

type Props = {
  startsAt: string | null;
  endsAt: string | null;
  accent: string;
};

export function LiveStatus({ startsAt, endsAt, accent }: Props) {
  // Refresh trigger. We don't use the value, we just need a re-render every
  // ~60s so derived strings recompute against `now`.
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const status = computeStatus(startsAt, endsAt);

  const isLive = status.state === "live";
  const isUpcoming = status.state === "upcoming";

  const dotColor = isLive ? accent : isUpcoming ? "#A3A3A3" : "#A3A3A3";
  const label = isLive
    ? "Live"
    : isUpcoming
      ? "Scheduled"
      : "Closed";

  return (
    <p
      className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em]"
      style={{ color: isLive ? accent : "#525252" }}
      aria-live="polite"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isLive ? "animate-pulse" : ""}`}
        style={{ background: dotColor }}
      />
      <span>{label}</span>
      <span className="text-gray-400 font-semibold normal-case tracking-normal text-[12px]">
        · {status.detail}
      </span>
    </p>
  );
}

type Status =
  | { state: "live"; detail: string }
  | { state: "upcoming"; detail: string }
  | { state: "closed"; detail: string };

function computeStatus(
  startsAt: string | null,
  endsAt: string | null
): Status {
  const now = Date.now();
  const start = startsAt ? Date.parse(startsAt) : null;
  const end = endsAt ? Date.parse(endsAt) : null;

  // Upcoming — starts is set, in the future
  if (start && !Number.isNaN(start) && start > now) {
    return { state: "upcoming", detail: `starts in ${formatGap(start - now)}` };
  }

  // Closed — ends is set, in the past
  if (end && !Number.isNaN(end) && end <= now) {
    return { state: "closed", detail: `ended ${formatAgo(now - end)} ago` };
  }

  // Live — and we have an ends_at to count down to
  if (end && !Number.isNaN(end) && end > now) {
    return { state: "live", detail: `ends in ${formatGap(end - now)}` };
  }

  // Live — open ended (no end), show "started Xh ago" from start (or now)
  const effectiveStart =
    start && !Number.isNaN(start) ? start : now;
  const ago = Math.max(0, now - effectiveStart);
  return { state: "live", detail: `started ${formatAgo(ago)} ago` };
}

// e.g. "12h 34m", "47m", "3d 4h" — picks the two biggest non-zero units.
function formatGap(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function formatAgo(ms: number): string {
  // For the "started X ago" / "ended X ago" copy we keep it terse — one unit.
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
