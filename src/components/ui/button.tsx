"use client";

/**
 * CANONICAL Button — the single source of truth for buttons across Antry.
 *
 * `src/components/design/Button.tsx` is a thin backwards-compatible adapter
 * that re-exports this component; do not add a third button.
 *
 * Renders a <button> by default. To render a link:
 *   - pass `href` for an internal/external anchor (next/link is used for
 *     internal routes, a plain <a target="_blank"> for external), or
 *   - pass `asChild` and provide your own anchor child (shadcn Slot pattern).
 */

import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white rounded-md shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm",
        lime:
          "bg-[#20F5A0] text-black rounded-md font-semibold hover:bg-[#67E8F9] hover:shadow-[0_8px_24px_rgba(32,245,160,0.3)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-none",
        outline:
          "border border-border-strong bg-transparent text-black rounded-md hover:bg-gray-100 hover:border-black hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:shadow-none",
        "outline-light":
          "border border-white/25 bg-transparent text-white rounded-md hover:border-white/60 hover:bg-white/5 hover:shadow-[0_2px_8px_rgba(255,255,255,0.06)]",
        ghost:
          "text-text-secondary hover:bg-gray-100 hover:text-black rounded-md",
        link: "text-black underline-offset-4 hover:underline",
        secondary:
          "bg-gray-100 text-black rounded-md hover:bg-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        default: "h-11 px-6 text-[14px]",
        lg: "h-[52px] px-8 text-[15px]",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-lg text-[13px]",
        "icon-lg": "h-12 w-12 rounded-md text-[16px]",
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
  loading?: boolean;
  /** Render the button as a link. Internal routes use next/link. */
  href?: string;
  /** When `href` is set, open in a new tab via a plain <a> element. */
  external?: boolean;
  /** Stretch the button to fill its container's width. */
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      onClick,
      href,
      external,
      fullWidth,
      type,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const classes = cn(
      buttonVariants({ variant, size }),
      fullWidth && "w-full",
      className
    );

    // Declared before any conditional return so the hook order stays stable
    // across renders (rules-of-hooks) — used only by the <button> branch.
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Ripple effect
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        const diameter = Math.max(rect.width, rect.height) * 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${diameter}px;
          height: ${diameter}px;
          left: ${x - diameter / 2}px;
          top: ${y - diameter / 2}px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.12;
          transform: scale(0);
          animation: button-ripple 500ms ease-out forwards;
          pointer-events: none;
        `;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);

        if (onClick) onClick(e);
      },
      [onClick]
    );

    // Link rendering — the unique capability merged in from the former
    // design/Button.tsx. `href` takes precedence over a plain <button>.
    if (href !== undefined && !asChild) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={classes}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className={classes}
          {...(props as Omit<
            React.ComponentProps<typeof Link>,
            "href" | "className"
          >)}
        >
          {children}
        </Link>
      );
    }

    const isDisabled = disabled || loading;

    if (asChild) {
      return <Comp className={classes} ref={ref} {...props} />;
    }

    return (
      <button
        className={classes}
        ref={ref}
        type={type ?? "button"}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-0.5 mr-1.5 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
