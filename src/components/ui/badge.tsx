import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors rounded-md",
  {
    variants: {
      variant: {
        default: "bg-accent-muted text-accent border border-accent/10",
        secondary: "bg-background-secondary text-text-secondary border border-border-primary",
        success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        outline: "border border-border-primary text-text-tertiary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
