"use client";

/**
 * DEPRECATED PATH — kept only so existing `@/components/design/Button`
 * imports keep working. The canonical Button now lives at
 * `@/components/ui/button`. Prefer importing from there directly.
 *
 * This file is a thin adapter: it maps the legacy design-system API
 * (variant: lime | ink | outline | ghost — size: sm | md | lg) onto the
 * canonical component's API, then renders it.
 */

import * as React from "react";
import { Button as UiButton, type ButtonProps as UiButtonProps } from "@/components/ui/button";

type LegacyVariant = "lime" | "ink" | "outline" | "ghost";
type LegacySize = "sm" | "md" | "lg";

/** Legacy variant name → canonical variant name. */
const VARIANT_MAP: Record<LegacyVariant, NonNullable<UiButtonProps["variant"]>> = {
  lime: "lime",
  ink: "default",
  outline: "outline-light",
  ghost: "ghost",
};

/** Legacy size name → canonical size name. */
const SIZE_MAP: Record<LegacySize, NonNullable<UiButtonProps["size"]>> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export type ButtonProps = Omit<UiButtonProps, "variant" | "size"> & {
  variant?: LegacyVariant;
  size?: LegacySize;
};

/**
 * Legacy Button adapter. Renders the canonical `@/components/ui/button`.
 */
export function Button({ variant = "ink", size = "md", ...rest }: ButtonProps) {
  return (
    <UiButton
      variant={VARIANT_MAP[variant]}
      size={SIZE_MAP[size]}
      {...rest}
    />
  );
}

export default Button;
