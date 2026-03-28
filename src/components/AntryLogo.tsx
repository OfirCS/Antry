import { useId } from "react";
import { cn } from "@/lib/utils";

interface AntryLogoProps {
  size?: number;
  className?: string;
}

interface AntryLogoFullProps {
  size?: number;
  className?: string;
  tone?: "dark" | "light";
}

export function AntryLogo({ size = 32, className }: AntryLogoProps) {
  const id = useId().replace(/:/g, "");
  const bgId = `${id}-bg`;
  const glowId = `${id}-glow`;
  const bodyId = `${id}-body`;
  const limbId = `${id}-limb`;
  const shadowId = `${id}-shadow`;

  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={bgId} x1="9" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#090B08" />
            <stop offset="52%" stopColor="#141811" />
            <stop offset="100%" stopColor="#1B2117" />
          </linearGradient>
          <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(49 15) rotate(125) scale(24 24)">
            <stop offset="0%" stopColor="#EFFF95" stopOpacity="0.95" />
            <stop offset="48%" stopColor="#D9FB5D" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#C6F135" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={bodyId} x1="22" y1="15" x2="43" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F4FFA2" />
            <stop offset="46%" stopColor="#DBFA67" />
            <stop offset="100%" stopColor="#B8E71E" />
          </linearGradient>
          <linearGradient id={limbId} x1="17" y1="9" x2="47" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F2FFA7" />
            <stop offset="100%" stopColor="#C6F135" />
          </linearGradient>
          <filter
            id={shadowId}
            x="7"
            y="3"
            width="50"
            height="58"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow dx="0" dy="7" stdDeviation="4" floodColor="#000000" floodOpacity="0.28" />
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#C6F135" floodOpacity="0.12" />
          </filter>
        </defs>

        <rect width="64" height="64" rx="18" fill={`url(#${bgId})`} />
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="17"
          stroke="rgba(255,255,255,0.08)"
        />
        <path
          d="M15 9C20.8 4.7 31.1 4.6 45.8 11"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="49" cy="15" r="16" fill={`url(#${glowId})`} />

        <g filter={`url(#${shadowId})`}>
          <g
            stroke={`url(#${limbId})`}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M30 16.4C27.7 13.5 26 10.9 24.6 7.9" />
            <path d="M34 16.4C36.3 13.5 38 10.9 39.4 7.9" />
            <path d="M27.1 27.7C22.9 25.3 19.7 23.8 16.6 22.7" />
            <path d="M25.8 31.9C21.7 31.4 18.5 31.8 15.2 32.7" />
            <path d="M26.7 36C22.8 38.7 19.6 40.5 16.6 42.6" />
            <path d="M36.9 27.7C41.1 25.3 44.3 23.8 47.4 22.7" />
            <path d="M38.2 31.9C42.3 31.4 45.5 31.8 48.8 32.7" />
            <path d="M37.3 36C41.2 38.7 44.4 40.5 47.4 42.6" />
          </g>

          <g fill={`url(#${bodyId})`}>
            <ellipse cx="32" cy="20" rx="5.6" ry="5.1" />
            <ellipse cx="32" cy="31.2" rx="7.8" ry="8" />
            <path d="M32 36.2C38.3 36.2 42.8 40.9 42.8 47.3C42.8 53 38.4 56.8 32 56.8C25.6 56.8 21.2 53 21.2 47.3C21.2 40.9 25.7 36.2 32 36.2Z" />
          </g>

          <g fill="#FFFFFF" opacity="0.18">
            <ellipse cx="30.6" cy="18.6" rx="2.2" ry="1.7" />
            <ellipse cx="30.3" cy="28.8" rx="2.9" ry="2.2" />
            <ellipse cx="29.4" cy="43.8" rx="4.1" ry="3.1" />
          </g>

          <circle cx="24.2" cy="7.3" r="1.6" fill="#EDFF9E" />
          <circle cx="39.8" cy="7.3" r="1.6" fill="#EDFF9E" />
        </g>
      </svg>
    </span>
  );
}

export function AntryLogoFull({
  size = 32,
  className,
  tone = "dark",
}: AntryLogoFullProps) {
  const wordColor = tone === "light" ? "#F8FBF0" : "#111111";
  const accentShadow =
    tone === "light"
      ? "0 0 12px rgba(198,241,53,0.28)"
      : "0 0 10px rgba(198,241,53,0.38)";

  return (
    <span className={cn("inline-flex items-center gap-3 shrink-0", className)}>
      <AntryLogo size={size} />
      <span className="inline-flex items-end gap-1.5">
        <span
          className="font-display font-semibold tracking-[-0.06em]"
          style={{
            fontSize: size * 0.58,
            lineHeight: 0.92,
            color: wordColor,
          }}
        >
          Antry
        </span>
        <span
          aria-hidden="true"
          className="mb-[0.14em] block shrink-0 rounded-full"
          style={{
            width: Math.max(4, size * 0.16),
            height: Math.max(4, size * 0.16),
            background: "linear-gradient(180deg, #EEFFA7 0%, #C6F135 100%)",
            boxShadow: accentShadow,
          }}
        />
      </span>
    </span>
  );
}
