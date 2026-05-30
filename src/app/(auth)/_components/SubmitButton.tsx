"use client";

import { type ReactNode } from "react";

type SubmitButtonProps = {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
};

function Spinner() {
  return (
    <svg
      className="-ml-0.5 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function SubmitButton({ pending, pendingLabel, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0A0A0A] px-4 text-[14px] font-semibold text-white " +
        "transition-[transform,background-color,opacity] duration-150 ease-out " +
        "hover:-translate-y-[1px] hover:bg-black active:translate-y-0 " +
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
      }
    >
      {pending ? (
        <>
          <Spinner />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
