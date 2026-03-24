import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-[#0a0b0d] hover:bg-accent-bright btn-glow shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        accent:
          "bg-accent text-[#0a0b0d] hover:bg-accent-bright btn-glow shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        outline:
          "border border-border-primary bg-transparent text-text-primary hover:bg-background-secondary hover:border-border-secondary",
        ghost:
          "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
        link: "text-accent underline-offset-4 hover:underline",
        secondary: "bg-surface text-text-primary border border-border-primary hover:bg-background-secondary shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-[12px]",
        default: "h-10 px-5 text-[14px]",
        lg: "h-12 px-8 text-[15px] font-semibold tracking-tight",
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
