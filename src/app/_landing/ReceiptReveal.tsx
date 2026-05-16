"use client";

import { motion } from "framer-motion";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import {
  DIMENSION_LABELS,
  DIMENSION_BLURB,
  type Fingerprint,
  type FingerprintDimension,
} from "@/lib/receipts/types";
import { ALL_DIMENSIONS } from "@/lib/receipts/fingerprint";
import { fadeUp, stagger, inViewOnce } from "@/lib/motion";

/**
 * Scroll-tied progressive reveal of the Receipt artifact.
 * Wealthsimple-style: one big idea, big radar, dimensions reveal in
 * sequence as you read down. No autoplay timer — purely IntersectionObserver
 * via Framer Motion's whileInView.
 */
export function ReceiptReveal({ fingerprint }: { fingerprint: Fingerprint }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
      <motion.div
        {...inViewOnce}
        variants={fadeUp}
        className="relative flex justify-center"
      >
        {/* Soft halo */}
        <div
          className="absolute inset-0 -z-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(45% 45% at 50% 50%, rgba(32,245,160,0.18) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div className="relative">
          <BuilderFingerprint
            fingerprint={fingerprint}
            size={360}
            primaryColor="#20F5A0"
          />
        </div>
      </motion.div>

      <motion.ol
        {...inViewOnce}
        variants={stagger(0.1, 0.08)}
        className="space-y-3"
      >
        {ALL_DIMENSIONS.map((d, i) => (
          <DimensionRow
            key={d}
            index={i + 1}
            dim={d}
            value={fingerprint[d]}
          />
        ))}
      </motion.ol>
    </div>
  );
}

function DimensionRow({
  index,
  dim,
  value,
}: {
  index: number;
  dim: FingerprintDimension;
  value: number;
}) {
  return (
    <motion.li
      variants={fadeUp}
      className="grid grid-cols-[28px_1fr_60px] gap-3 items-baseline py-2"
    >
      <span className="text-[12px] font-mono text-gray-400 tabular-nums">
        0{index}
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-bold tracking-[-0.01em] text-black">
          {DIMENSION_LABELS[dim]}
        </p>
        <p className="mt-0.5 text-[13px] leading-[1.5] text-gray-500">
          {DIMENSION_BLURB[dim]}
        </p>
      </div>
      <span
        className="text-[20px] font-bold tabular-nums tracking-tight text-right"
        style={{ color: "#0A0A0A", fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
    </motion.li>
  );
}
