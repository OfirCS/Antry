"use client";

import type { Variants, Transition } from "framer-motion";

/**
 * Single source of truth for motion across Antry. Page-level reveals,
 * scroll-staggered groups, button micro-interactions all reference these.
 *
 * Honour `prefers-reduced-motion` automatically: <MotionConfig reducedMotion="user">
 * is applied at the platform layout root, so framer-motion will collapse all
 * non-zero values to instant. No per-component branching needed.
 */

export const EASE_OUT_QUART: Transition["ease"] = [0.25, 1, 0.5, 1];
export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];
export const SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 280,
  damping: 30,
  mass: 0.8,
};

/** Subtle fade + 8px rise. Default for most content reveals. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  },
};

/** Bigger 16px rise, slower. Used for hero / section-lead reveals. */
export const fadeUpHero: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_QUART },
  },
};

/** Scale-pop for icons, glyphs, big number reveals. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_GENTLE,
  },
};

/** Use as parent of staggered children. Each child uses fadeUp/popIn. */
export const stagger = (delayChildren = 0, gap = 0.06): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: gap,
      delayChildren,
    },
  },
});

/**
 * Shared press-down for big lime CTAs. Apply via whileTap={pressDown}.
 * Pairs with whileHover={liftUp} for the canonical Antry button feel.
 */
export const liftUp = { y: -2, transition: { duration: 0.15 } };
export const pressDown = { scale: 0.97, transition: { duration: 0.08 } };

/** Default in-view trigger config. once=true so reveals don't replay. */
export const inViewOnce = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.3 } as const,
};
