"use client";

import { motion } from "framer-motion";
import {
  ALL_DIMENSIONS,
} from "@/lib/receipts/fingerprint";
import {
  DIMENSION_SHORT,
  DIMENSION_LABELS,
  type Fingerprint,
} from "@/lib/receipts/types";

type Props = {
  fingerprint: Fingerprint;
  ideal?: Fingerprint;
  size?: number;
  showLabels?: boolean;
  primaryColor?: string;
  idealColor?: string;
  variant?: "light" | "dark";
};

const ease = [0.16, 1, 0.3, 1] as const;

export function BuilderFingerprint({
  fingerprint,
  ideal,
  size = 320,
  showLabels = true,
  primaryColor = "#C6F135",
  idealColor = "#0A0A0A",
  variant = "light",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.72;
  const dims = ALL_DIMENSIONS;
  const angleStep = (Math.PI * 2) / dims.length;
  const startAngle = -Math.PI / 2;

  const isDark = variant === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(10,10,10,0.06)";
  const gridStrong = isDark ? "rgba(255,255,255,0.16)" : "rgba(10,10,10,0.12)";
  const labelColor = isDark ? "rgba(255,255,255,0.55)" : "#525252";
  const valueColor = isDark ? "#FFFFFF" : "#0A0A0A";

  const polygonPoints = (fp: Fingerprint, scale = 1) =>
    dims
      .map((d, i) => {
        const angle = startAngle + i * angleStep;
        const r = (radius * (fp[d] / 100)) * scale;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");

  const labelPos = (i: number) => {
    const angle = startAngle + i * angleStep;
    const r = radius + 22;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  const valuePos = (i: number) => {
    const angle = startAngle + i * angleStep;
    const r = radius + 6;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Concentric grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${size} ${size + (showLabels ? 0 : 0)}`}
      width={size}
      height={size}
      className="overflow-visible"
      role="img"
      aria-label="Builder Fingerprint radar chart"
    >
      <defs>
        <radialGradient id="fp-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity={0.45} />
          <stop offset="100%" stopColor={primaryColor} stopOpacity={0.18} />
        </radialGradient>
      </defs>

      {/* Concentric rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={dims
            .map((_, i) => {
              const angle = startAngle + i * angleStep;
              const rd = radius * r;
              return `${cx + rd * Math.cos(angle)},${cy + rd * Math.sin(angle)}`;
            })
            .join(" ")}
          fill="none"
          stroke={r === 1 ? gridStrong : gridColor}
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {dims.map((_, i) => {
        const angle = startAngle + i * angleStep;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(angle)}
            y2={cy + radius * Math.sin(angle)}
            stroke={gridColor}
            strokeWidth={1}
          />
        );
      })}

      {/* Ideal polygon (if provided) — dashed outline */}
      {ideal && (
        <motion.polygon
          points={polygonPoints(ideal)}
          fill="none"
          stroke={idealColor}
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Builder polygon */}
      <motion.polygon
        points={polygonPoints(fingerprint)}
        fill="url(#fp-fill)"
        stroke={primaryColor}
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Vertex dots */}
      {dims.map((d, i) => {
        const angle = startAngle + i * angleStep;
        const r = (radius * fingerprint[d]) / 100;
        return (
          <motion.circle
            key={d}
            cx={cx + r * Math.cos(angle)}
            cy={cy + r * Math.sin(angle)}
            r={3.5}
            fill={primaryColor}
            stroke={isDark ? "#0A0A0A" : "#FFFFFF"}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05, duration: 0.3, ease }}
          />
        );
      })}

      {/* Labels + values */}
      {showLabels &&
        dims.map((d, i) => {
          const lp = labelPos(i);
          const vp = valuePos(i);
          const valueOnLeft = lp.x < cx - 6;
          const valueOnRight = lp.x > cx + 6;
          const textAnchor = valueOnLeft ? "end" : valueOnRight ? "start" : "middle";
          return (
            <g key={d}>
              <motion.text
                x={lp.x}
                y={lp.y - 6}
                textAnchor={textAnchor}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fill: labelColor,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.04, duration: 0.3 }}
              >
                {DIMENSION_SHORT[d]}
              </motion.text>
              <motion.text
                x={lp.x}
                y={lp.y + 9}
                textAnchor={textAnchor}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  fill: valueColor,
                  letterSpacing: "-0.01em",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.04, duration: 0.3 }}
              >
                {fingerprint[d]}
              </motion.text>
              <title>{DIMENSION_LABELS[d]}</title>
              {/* Suppress unused-var lint for vp */}
              <text x={vp.x} y={vp.y} style={{ display: "none" }} />
            </g>
          );
        })}
    </svg>
  );
}

// Compact version for cards (no labels, just the shape).
export function FingerprintGlyph({
  fingerprint,
  size = 120,
  primaryColor = "#C6F135",
}: {
  fingerprint: Fingerprint;
  size?: number;
  primaryColor?: string;
}) {
  return (
    <BuilderFingerprint
      fingerprint={fingerprint}
      size={size}
      showLabels={false}
      primaryColor={primaryColor}
    />
  );
}
