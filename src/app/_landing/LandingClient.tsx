"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Cpu, Clock } from "lucide-react";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import type { Receipt } from "@/lib/receipts/types";
import { CountUp } from "@/components/design/CountUp";

const ease = [0.16, 1, 0.3, 1] as const;
const proofGreen = "#B8FF3D";
const paper = "#F5F7EC";

/** The hero's right-side stage: a real Receipt artifact inside a proof path. */
export function LandingHeroAside({ receipt }: { receipt: Receipt }) {
  const tier = fingerprintTier(receipt.composite_score);
  const durationMinutes = Math.round(receipt.attempt_duration_seconds / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, ease, delay: 0.12 }}
      className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
    >
      <div
        aria-hidden
        className="absolute -inset-8 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 40% at 55% 44%, rgba(184,255,61,0.22) 0%, transparent 72%)",
          filter: "blur(24px)",
        }}
      />

      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 560 520"
        fill="none"
      >
        <path
          d="M42 88H492M86 438H520M70 88V438M492 88V410"
          stroke="rgba(245,247,236,0.1)"
          strokeWidth="1"
        />
        <motion.path
          d="M74 372C130 284 169 242 224 246C279 250 287 336 352 328C411 321 410 213 488 154"
          stroke={proofGreen}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="7 11"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.4, ease, delay: 0.45 }}
        />
        {[
          [74, 372],
          [224, 246],
          [352, 328],
          [488, 154],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={i === 3 ? 8 : 5}
            fill={i === 3 ? proofGreen : paper}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 + i * 0.12, duration: 0.35, ease }}
          />
        ))}
      </svg>

      <div className="relative grid min-h-[430px] items-center py-8 sm:min-h-[520px]">
        <motion.div
          className="absolute right-4 top-4 hidden rounded-[8px] border px-3 py-2 text-[11px] font-bold uppercase sm:block"
          style={{
            borderColor: "rgba(245,247,236,0.14)",
            background: "rgba(245,247,236,0.06)",
            color: "rgba(245,247,236,0.72)",
            letterSpacing: 0,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.7 }}
        >
          Lab trace armed
        </motion.div>

        <Link
          href={`/receipts/${receipt.id}`}
          className="group relative mx-auto block w-full max-w-[430px] overflow-hidden rounded-[10px] transition-transform duration-300 hover:-translate-y-1"
          style={{
            background: paper,
            border: "1px solid rgba(245,247,236,0.18)",
            boxShadow:
              "0 34px 90px -42px rgba(184,255,61,0.55), 0 22px 54px -28px rgba(0,0,0,0.7)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `linear-gradient(90deg, ${proofGreen}, ${receipt.company.sponsor_color})` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(7,8,6,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(7,8,6,0.08) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="text-[10px] font-bold uppercase"
                  style={{ color: "#5F6A42", letterSpacing: 0 }}
                >
                  {receipt.company.name} brief / 001
                </p>
                <h3 className="mt-2 max-w-[260px] text-[18px] font-bold leading-tight text-[#070806]">
                  {receipt.brief_title}
                </h3>
                <p className="mt-2 text-[12px] text-[#59604E]">
                  {receipt.builder.name} / @{receipt.builder.username}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className="inline-block rounded-[6px] px-2 py-1 text-[10px] font-bold uppercase"
                  style={{ background: tier.bg, color: tier.color, letterSpacing: 0 }}
                >
                  {tier.label}
                </span>
                <div
                  className="mt-2 font-display text-[42px] font-bold leading-none tabular-nums text-[#070806]"
                  style={{ letterSpacing: 0 }}
                >
                  <CountUp to={receipt.composite_score} durationMs={1100} />
                  <span className="ml-1 text-[13px] text-[#7B826E]">/100</span>
                </div>
              </div>
            </div>

            <div className="my-3 flex justify-center sm:my-1">
              <BuilderFingerprint
                fingerprint={receipt.fingerprint}
                size={300}
                primaryColor={proofGreen}
              />
            </div>

            <div
              className="grid grid-cols-3 rounded-[8px] bg-[#070806] text-center text-white"
              style={{ border: "1px solid rgba(7,8,6,0.1)" }}
            >
              <Stat
                icon={<Cpu className="h-3 w-3" />}
                label="Tokens"
                value={<CountUp to={receipt.tokens_spent} durationMs={1200} />}
              />
              <Stat
                icon={<Clock className="h-3 w-3" />}
                label="Duration"
                value={
                  <>
                    <CountUp to={durationMinutes} durationMs={1000} />
                    m
                  </>
                }
                border
              />
              <Stat
                icon={<Sparkles className="h-3 w-3" />}
                label="Cost"
                value={
                  <>
                    $
                    <CountUp
                      to={receipt.cost_usd_cents / 100}
                      durationMs={1000}
                      decimals={2}
                    />
                  </>
                }
              />
            </div>
          </div>
        </Link>

        <motion.p
          className="mx-auto mt-4 max-w-[410px] text-center text-[12px] leading-relaxed"
          style={{ color: "rgba(245,247,236,0.48)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease, delay: 1 }}
        >
          Signed proof path /{" "}
          <span className="font-mono">
            /api/v1/receipts/{receipt.id.slice(0, 12)}.../verify
          </span>
        </motion.p>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  border = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className="px-2.5 py-3.5"
      style={{
        borderLeft: border ? "1px solid rgba(245,247,236,0.12)" : undefined,
        borderRight: border ? "1px solid rgba(245,247,236,0.12)" : undefined,
      }}
    >
      <p className="inline-flex w-full items-center justify-center gap-1 text-[9px] font-bold uppercase text-white/[0.45]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[14px] font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

/** Stagger children into view as the user scrolls. */
export function StaggerInView({
  children,
  delayStep = 0.06,
  className,
}: {
  children: React.ReactNode;
  delayStep?: number;
  className?: string;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease, delay: i * delayStep }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/** Side-by-side Receipt comparison (the Bottom Quartile move). */
export function ReceiptCompare({
  high,
  low,
}: {
  high: Receipt;
  low: Receipt;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <ReceiptCompareCard receipt={high} variant="high" />
      <ReceiptCompareCard receipt={low} variant="low" />
    </div>
  );
}

function ReceiptCompareCard({
  receipt,
  variant,
}: {
  receipt: Receipt;
  variant: "high" | "low";
}) {
  const tier = fingerprintTier(receipt.composite_score);
  const isHigh = variant === "high";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease, delay: isHigh ? 0 : 0.08 }}
      className="rounded-lg bg-white overflow-hidden"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
    >
      <div className="h-1" style={{ background: receipt.company.sponsor_color }} />
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded"
            style={{ background: tier.bg, color: tier.color }}
          >
            {tier.label}
          </span>
          <span className="text-[12px] tabular-nums font-bold text-black">
            {receipt.composite_score}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-500">
            {receipt.tokens_spent.toLocaleString()} tokens
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-500">
            {Math.round(receipt.attempt_duration_seconds / 60)}m
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
          <div>
            <p className="text-[15px] font-bold tracking-[-0.01em] text-black">
              {receipt.builder.name}
            </p>
            <p className="text-[12px] text-gray-500">@{receipt.builder.username}</p>
            <p className="mt-3 text-[13px] leading-[1.6] text-gray-600">
              {receipt.highlights[0]}
            </p>
            <Link
              href={`/receipts/${receipt.id}`}
              className="mt-4 text-[13px] font-semibold text-black inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Open Receipt
            </Link>
          </div>
          <div className="shrink-0">
            <BuilderFingerprint
              fingerprint={receipt.fingerprint}
              size={140}
              showLabels={false}
              primaryColor={receipt.company.sponsor_color}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
