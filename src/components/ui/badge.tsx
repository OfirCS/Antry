import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.04em] uppercase transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-[#C6F135]/12 text-[#111111] hover:bg-[#C6F135]/20",
        secondary:
          "bg-[#F5F5F5] text-[#525252] hover:bg-[#EBEBEB] hover:text-[#111111]",
        success:
          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        outline:
          "border border-[#EBEBEB] bg-transparent text-[#737373] hover:border-[#111111] hover:text-[#111111]",
        "outline-lime":
          "border border-[#C6F135]/40 bg-transparent text-[#111111] hover:border-[#C6F135] hover:bg-[#C6F135]/8",
        dot:
          "bg-[#F5F5F5] text-[#525252] hover:bg-[#EBEBEB] hover:text-[#111111] pl-2.5",
        "dot-success":
          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 pl-2.5",
        "dot-warning":
          "bg-amber-50 text-amber-700 hover:bg-amber-100 pl-2.5",
        "dot-error":
          "bg-red-50 text-red-700 hover:bg-red-100 pl-2.5",
        "dot-lime":
          "bg-[#C6F135]/12 text-[#111111] hover:bg-[#C6F135]/20 pl-2.5",
        pulse:
          "bg-[#C6F135]/12 text-[#111111] hover:bg-[#C6F135]/20",
        "pulse-error":
          "bg-red-50 text-red-700 hover:bg-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** Map dot-* variants to their dot color */
const dotColorMap: Record<string, string> = {
  dot: "#737373",
  "dot-success": "#059669",
  "dot-warning": "#D97706",
  "dot-error": "#DC2626",
  "dot-lime": "#C6F135",
};

/** Map pulse-* variants to their pulse color */
const pulseColorMap: Record<string, string> = {
  pulse: "#C6F135",
  "pulse-error": "#DC2626",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const variantStr = variant ?? "default";
  const isDot = typeof variantStr === "string" && variantStr.startsWith("dot");
  const isPulse = typeof variantStr === "string" && variantStr.startsWith("pulse");
  const dotColor = isDot ? dotColorMap[variantStr] ?? "#737373" : undefined;
  const pulseColor = isPulse ? pulseColorMap[variantStr] ?? "#C6F135" : undefined;

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {isDot && (
        <span
          className="inline-block w-[6px] h-[6px] rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {isPulse && (
        <span className="relative inline-flex h-2 w-2 shrink-0">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{
              backgroundColor: pulseColor,
              animation: "badge-pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
          <span
            className="relative inline-flex w-2 h-2 rounded-full"
            style={{ backgroundColor: pulseColor }}
          />
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
