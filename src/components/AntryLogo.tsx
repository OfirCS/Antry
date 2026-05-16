import { cn } from "@/lib/utils";

interface AntryLogoProps {
  size?: number;
  className?: string;
  tone?: "dark" | "light";
}

interface AntryLogoFullProps {
  size?: number;
  className?: string;
  tone?: "dark" | "light";
}

export function AntryLogo({ size = 32, className, tone = "dark" }: AntryLogoProps) {
  const markColor = tone === "light" ? "#F8FBF0" : "#0A0A0A";
  const cutColor = tone === "light" ? "#0A0A0A" : "#FFFFFF";

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label="Antry"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full transition-transform duration-200"
        role="img"
        aria-hidden="true"
      >
        <path d="M32 7 44 15.2 40.5 29.5 32 36 23.5 29.5 20 15.2 32 7Z" fill={markColor} />
        <path d="M32 37.5 43 46.4 39.5 58 32 63 24.5 58 21 46.4 32 37.5Z" fill={markColor} />
        <path d="M24.5 31.5 15.5 39 10 33.3 16.4 24.3 24.5 31.5Z" fill={markColor} />
        <path d="M39.5 31.5 48.5 39 54 33.3 47.6 24.3 39.5 31.5Z" fill={markColor} />
        <path d="M21.8 17.8 13.5 10.8 8.5 13.4" stroke={markColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42.2 17.8 50.5 10.8 55.5 13.4" stroke={markColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23.8 48.2 15.6 56.2" stroke={markColor} strokeWidth="5" strokeLinecap="round" />
        <path d="M40.2 48.2 48.4 56.2" stroke={markColor} strokeWidth="5" strokeLinecap="round" />
        <path d="M32 40V59" stroke={cutColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M25.8 31.5 32 36.2 38.2 31.5" stroke={cutColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
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
      ? "0 0 12px rgba(32,245,160,0.28)"
      : "0 0 10px rgba(32,245,160,0.38)";

  return (
    <span className={cn("inline-flex items-center gap-2.5 shrink-0", className)}>
      <AntryLogo size={size} tone={tone} />
      <span className="inline-flex items-end gap-1">
        <span
          className="font-display font-semibold tracking-[-0.06em]"
          style={{
            fontSize: size * 0.6,
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
            background: "linear-gradient(180deg, #B8FFF0 0%, #20F5A0 100%)",
            boxShadow: accentShadow,
          }}
        />
      </span>
    </span>
  );
}
