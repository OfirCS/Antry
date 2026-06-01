import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_MARK_SRC = "/antry-logo-mark.png";
const LOGO_MARK_SIZE = 1254;

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
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label="Antry"
    >
      <Image
        src={LOGO_MARK_SRC}
        alt=""
        width={LOGO_MARK_SIZE}
        height={LOGO_MARK_SIZE}
        sizes={`${size}px`}
        className={cn(
          "block h-full w-full object-contain transition-[filter,transform] duration-200",
          tone === "light" && "invert"
        )}
        aria-hidden="true"
      />
    </span>
  );
}

export function AntryLogoFull({
  size = 32,
  className,
  tone = "dark",
}: AntryLogoFullProps) {
  const wordColor = tone === "light" ? "#F5F7EC" : "#111111";

  return (
    <span className={cn("inline-flex items-center gap-2.5 shrink-0", className)}>
      <AntryLogo size={size} tone={tone} />
      <span
        className="font-display font-bold uppercase"
        style={{
          fontSize: size * 0.52,
          lineHeight: 1,
          color: wordColor,
          letterSpacing: 0,
        }}
      >
        Antry
      </span>
    </span>
  );
}
