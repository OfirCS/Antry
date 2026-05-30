"use client";

import { type InputHTMLAttributes, type ReactNode } from "react";

type FieldProps = {
  label: ReactNode;
  name: string;
  error?: boolean;
  trailing?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * Light-editorial form field.
 * - Hairline #EBEBEB border, ink #0A0A0A focus ring (CSS only — no JS focus handlers).
 * - DM Sans body via :where(body); Sora left to the page titles.
 */
export function Field({ label, name, error, trailing, className, ...inputProps }: FieldProps) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[#0A0A0A]">{label}</span>
        {trailing}
      </div>
      <input
        name={name}
        id={name}
        aria-invalid={error || undefined}
        className={
          "block h-11 w-full rounded-lg border bg-white px-3.5 text-[14px] text-[#0A0A0A] placeholder:text-[#A3A3A3] " +
          "transition-[border-color,box-shadow] duration-150 ease-out " +
          "focus-visible:outline-none " +
          (error
            ? "border-[#E5484D] focus:border-[#E5484D] focus:shadow-[0_0_0_3px_rgba(229,72,77,0.12)]"
            : "border-[#EBEBEB] focus:border-[#0A0A0A] focus:shadow-[0_0_0_3px_rgba(10,10,10,0.06)]") +
          (className ? ` ${className}` : "")
        }
        {...inputProps}
      />
    </label>
  );
}
