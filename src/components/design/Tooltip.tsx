"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

export function Tooltip({ children, content, side = "top", className }: Props) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const offsetClass =
    side === "top"
      ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
      : "top-full mt-2 left-1/2 -translate-x-1/2";

  const initialY = side === "top" ? 6 : -6;

  return (
    <span
      className={`relative inline-flex ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: initialY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: initialY }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-none absolute z-50 ${offsetClass} w-[260px] rounded-[10px] px-3 py-2.5 text-[12px] leading-[1.5]`}
            style={{
              background: "#0A0A0A",
              color: "rgba(255,255,255,0.92)",
              boxShadow: "0 12px 28px -10px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
