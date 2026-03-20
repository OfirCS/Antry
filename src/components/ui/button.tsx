import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white hover:bg-accent-bright shadow-[0_4px_16px_rgba(59,91,219,0.3)] hover:shadow-[0_6px_24px_rgba(59,91,219,0.4)]",
        accent:
          "bg-accent text-white hover:bg-accent-bright shadow-[0_4px_16px_rgba(59,91,219,0.3)] hover:shadow-[0_6px_24px_rgba(59,91,219,0.4)]",
        outline:
          "border border-border-primary bg-transparent text-text-primary hover:bg-accent-muted hover:border-accent/30",
        ghost:
          "text-text-secondary hover:bg-accent-muted hover:text-text-primary",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        default: "h-10 px-5 text-[14px]",
        lg: "h-12 px-8 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
