"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Renders a floating label inside the input */
  floatingLabel?: string;
  /** React node rendered before the input (inside the wrapper) */
  prefix?: React.ReactNode;
  /** React node rendered after the input (inside the wrapper) */
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, floatingLabel, prefix, suffix, id, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || React.useId();

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        props.onFocus?.(e);
      },
      [props.onFocus]
    );

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        setHasValue(e.target.value.length > 0);
        props.onBlur?.(e);
      },
      [props.onBlur]
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(e.target.value.length > 0);
        props.onChange?.(e);
      },
      [props.onChange]
    );

    // Floating label variant
    if (floatingLabel) {
      const isLifted = focused || hasValue || !!props.value || !!props.defaultValue || !!props.placeholder;

      return (
        <div className={cn("relative w-full", prefix || suffix ? "flex items-center" : "")}>
          {prefix && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors duration-200 z-10 pointer-events-none peer-focus:text-[#111111]">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "peer flex h-14 w-full rounded-xl border bg-white px-4 pt-5 pb-1.5 text-[14px] font-medium text-[#111111] placeholder:text-transparent outline-none",
              "transition-[border-color,box-shadow] duration-250 ease-out",
              "border-[#EBEBEB]",
              "focus:border-[#111111] focus:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              prefix ? "pl-10" : "",
              suffix ? "pr-10" : "",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={floatingLabel}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute pointer-events-none transition-all duration-200 ease-out origin-left",
              prefix ? "left-10" : "left-4",
              isLifted
                ? "top-2 text-[11px] font-semibold tracking-wide text-[#737373]"
                : "top-1/2 -translate-y-1/2 text-[14px] text-[#A3A3A3]"
            )}
          >
            {floatingLabel}
          </label>
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors duration-200 pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    // Standard input with optional prefix/suffix
    if (prefix || suffix) {
      return (
        <div className="relative w-full flex items-center">
          {prefix && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors duration-200 pointer-events-none z-10">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border bg-white py-3 text-[14px] font-medium text-[#111111] placeholder:text-[#A3A3A3] outline-none",
              "transition-[border-color,box-shadow] duration-250 ease-out",
              "border-[#EBEBEB]",
              "focus:border-[#111111] focus:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              prefix ? "pl-10" : "px-4",
              suffix ? "pr-10" : "px-4",
              prefix && suffix ? "pl-10 pr-10" : "",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors duration-200 pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    // Default plain input
    return (
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-medium text-[#111111] placeholder:text-[#A3A3A3] outline-none",
          "transition-[border-color,box-shadow] duration-250 ease-out",
          "border-[#EBEBEB]",
          "focus:border-[#111111] focus:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
