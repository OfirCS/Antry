import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.04em] uppercase transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-[#20F5A0]/12 text-[#111111] hover:bg-[#20F5A0]/20",
        secondary:
          "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#111111]",
        success:
          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        outline:
          "border border-[#E5E7EB] bg-transparent text-[#6B7280] hover:border-[#111111] hover:text-[#111111]",
        "outline-lime":
          "border border-[#20F5A0]/40 bg-transparent text-[#111111] hover:border-[#20F5A0] hover:bg-[#20F5A0]/8",
        dot:
          "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#111111] pl-2.5",
        "dot-success":
          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 pl-2.5",
        "dot-warning":
          "bg-amber-50 text-amber-700 hover:bg-amber-100 pl-2.5",
        "dot-error":
          "bg-red-50 text-red-700 hover:bg-red-100 pl-2.5",
        "dot-lime":
          "bg-[#20F5A0]/12 text-[#111111] hover:bg-[#20F5A0]/20 pl-2.5",
        pulse:
          "bg-[#20F5A0]/12 text-[#111111] hover:bg-[#20F5A0]/20",
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
  dot: "#6B7280",
  "dot-success": "#059669",
  "dot-warning": "#D97706",
  "dot-error": "#DC2626",
  "dot-lime": "#20F5A0",
};

/** Map pulse-* variants to their pulse color */
const pulseColorMap: Record<string, string> = {
  pulse: "#20F5A0",
  "pulse-error": "#DC2626",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const variantStr = variant ?? "default";
  const isDot = typeof variantStr === "string" && variantStr.startsWith("dot");
  const isPulse = typeof variantStr === "string" && variantStr.startsWith("pulse");
  const dotColor = isDot ? dotColorMap[variantStr] ?? "#6B7280" : undefined;
  const pulseColor = isPulse ? pulseColorMap[variantStr] ?? "#20F5A0" : undefined;

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
