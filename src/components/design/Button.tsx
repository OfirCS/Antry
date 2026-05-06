import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "lime" | "ink" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-[40px] px-4 text-[13px]",
  md: "h-[48px] px-5 text-[14px]",
  lg: "h-[56px] px-7 text-[15px]",
};

/**
 * Single-button source of truth. Pass either `href` to render a Link, or
 * `onClick`/`type` to render a button. Keeps the lime/ink/outline/ghost
 * variants from drifting across pages.
 */
type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type Props = ButtonAsLink | ButtonAsButton;

function variantClasses(variant: Variant): {
  className: string;
  style: React.CSSProperties;
  dataCta?: string;
} {
  switch (variant) {
    case "lime":
      return {
        dataCta: "lime",
        className: "transition-all hover:-translate-y-0.5",
        style: {
          background: "#C6F135",
          color: "#0A0A0A",
          boxShadow: "0 8px 24px rgba(198,241,53,0.32)",
        },
      };
    case "ink":
      return {
        className: "transition-all hover:-translate-y-0.5",
        style: {
          background: "#0A0A0A",
          color: "#FFFFFF",
          boxShadow: "0 6px 18px rgba(10,10,10,0.18)",
        },
      };
    case "outline":
      return {
        className: "transition-colors",
        style: {
          background: "transparent",
          color: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(255,255,255,0.16)",
        },
      };
    case "ghost":
      return {
        className: "transition-colors hover:bg-gray-100 text-black",
        style: { background: "transparent" },
      };
  }
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold whitespace-nowrap disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed";

export function Button(props: Props) {
  const { variant = "ink", size = "md", className, children, fullWidth } = props;
  const v = variantClasses(variant);
  const merged = cn(BASE, SIZE_CLASS[size], fullWidth && "w-full", v.className, className);

  if ("href" in props && props.href !== undefined) {
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, fullWidth: _fw, ...rest } = props as ButtonAsLink & {
      variant?: Variant;
      size?: Size;
      className?: string;
      children?: React.ReactNode;
      fullWidth?: boolean;
    };
    void _v;
    void _s;
    void _c;
    void _ch;
    void _fw;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={merged}
          style={v.style}
          data-cta={v.dataCta}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={merged}
        style={v.style}
        data-cta={v.dataCta}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const { variant: _v2, size: _s2, className: _c2, children: _ch2, fullWidth: _fw2, ...buttonRest } =
    props as ButtonAsButton & {
      variant?: Variant;
      size?: Size;
      className?: string;
      children?: React.ReactNode;
      fullWidth?: boolean;
    };
  void _v2;
  void _s2;
  void _c2;
  void _ch2;
  void _fw2;
  return (
    <button
      className={merged}
      style={v.style}
      data-cta={v.dataCta}
      {...buttonRest}
    >
      {children}
    </button>
  );
}
