"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Cpu, Clock } from "lucide-react";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import type { Receipt } from "@/lib/receipts/types";
import { CountUp } from "@/components/design/CountUp";

const ease = [0.16, 1, 0.3, 1] as const;

/** The hero's right-side aside: a real Receipt card, not a mockup. */
export function LandingHeroAside({ receipt }: { receipt: Receipt }) {
  const tier = fingerprintTier(receipt.composite_score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="relative"
    >
      {/* Soft white card glow underneath */}
      <div
        className="absolute -inset-6 rounded-[28px] pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 60% 40%, rgba(198,241,53,0.16) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <Link
        href={`/receipts/${receipt.id}`}
        className="relative block rounded-[24px] bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 32px 64px -24px rgba(0,0,0,0.45), 0 12px 24px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Sponsor strip */}
        <div className="h-1.5" style={{ background: receipt.company.sponsor_color }} />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: receipt.company.sponsor_color }}
            >
              {receipt.company.name} Brief · 001
            </p>
            <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black leading-[1.35]">
              {receipt.brief_title}
            </h3>
            <p className="mt-1.5 text-[12px] text-gray-500">
              by{" "}
              <span className="font-semibold text-gray-700">
                {receipt.builder.name}
              </span>{" "}
              · @{receipt.builder.username}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded inline-block mb-1"
              style={{ background: tier.bg, color: tier.color }}
            >
              {tier.label}
            </span>
            <div
              className="font-display font-bold tabular-nums leading-none"
              style={{
                color: "#0A0A0A",
                fontSize: "clamp(2rem, 3.6vw, 2.8rem)",
              }}
            >
              <CountUp to={receipt.composite_score} durationMs={1100} />
              <span className="text-[14px] text-gray-400 ml-1">/100</span>
            </div>
          </div>
        </div>

        {/* Fingerprint */}
        <div className="px-6 pb-2 flex justify-center">
          <BuilderFingerprint
            fingerprint={receipt.fingerprint}
            size={300}
            primaryColor={receipt.company.sponsor_color}
          />
        </div>

        {/* Stat bar */}
        <div
          className="grid grid-cols-3 text-center"
          style={{ borderTop: "1px solid #EBEBEB" }}
        >
          <Stat
            icon={<Cpu className="w-3 h-3" />}
            label="Tokens"
            value={
              <CountUp to={receipt.tokens_spent} durationMs={1200} />
            }
          />
          <Stat
            icon={<Clock className="w-3 h-3" />}
            label="Duration"
            value={
              <>
                <CountUp
                  to={Math.round(receipt.attempt_duration_seconds / 60)}
                  durationMs={1000}
                />
                m
              </>
            }
            border
          />
          <Stat
            icon={<Sparkles className="w-3 h-3" />}
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
      </Link>

      {/* Caption underneath — anchors the metaphor */}
      <p
        className="mt-5 text-center text-[12px]"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        A real Receipt. Verifiable at{" "}
        <span className="font-mono">
          /api/v1/receipts/{receipt.id.slice(0, 12)}…/verify
        </span>
      </p>
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
      className="px-3 py-3.5"
      style={{
        borderLeft: border ? "1px solid #EBEBEB" : undefined,
        borderRight: border ? "1px solid #EBEBEB" : undefined,
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 inline-flex items-center gap-1 justify-center w-full">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[14px] font-bold tabular-nums text-black">{value}</p>
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
      className="rounded-[20px] bg-white overflow-hidden"
      style={{
        border: "1px solid #EBEBEB",
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
          <span className="text-gray-300">·</span>
          <span className="text-[12px] text-gray-500">
            {receipt.tokens_spent.toLocaleString()} tokens
          </span>
          <span className="text-gray-300">·</span>
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
              Open Receipt →
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
