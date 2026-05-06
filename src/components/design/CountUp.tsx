"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type Props = {
  to: number;
  durationMs?: number;
  /** Decimal places. Defaults to integer with locale grouping. */
  decimals?: number;
  className?: string;
  startOnView?: boolean;
};

function formatNumber(n: number, decimals: number | undefined): string {
  if (decimals === undefined) return Math.round(n).toLocaleString();
  return n.toFixed(decimals);
}

export function CountUp({
  to,
  durationMs = 800,
  decimals,
  className,
  startOnView = true,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (startOnView && !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(eased * to);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, startOnView, to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(value, decimals)}
    </span>
  );
}
