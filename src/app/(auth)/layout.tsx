"use client";

import Link from "next/link";
import { AntryLogoFull } from "@/components/AntryLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6 sm:px-10">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Antry home">
            <AntryLogoFull size={30} tone="dark" />
          </Link>
          <Link
            href="/"
            className="text-[14px] font-semibold text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
          >
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1120px] grid-cols-1 items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.8fr_0.95fr]">
        <section className="hidden lg:block">
          <p className="mb-5 text-[12px] font-bold uppercase text-[#6B7280]">
            Builder proof
          </p>
          <h1 className="max-w-[430px] font-display text-[48px] font-bold leading-[1.02] tracking-[-0.05em] text-[#0A0A0A]">
            Sign in to manage work that can be reviewed.
          </h1>
          <p className="mt-6 max-w-[420px] text-[17px] leading-[1.6] text-[#4B5563]">
            Briefs, Lab work, projects, and Receipts stay connected in one
            clean workspace.
          </p>
          <div className="mt-10 grid max-w-[460px] grid-cols-3 border-y border-[#E5E7EB] py-5">
            {[
              ["Briefs", "tasks"],
              ["Lab", "work"],
              ["Receipts", "proof"],
            ].map(([title, label], index) => (
              <div
                key={title}
                className="px-4 first:pl-0"
                style={{ borderLeft: index ? "1px solid #E5E7EB" : undefined }}
              >
                <p className="text-[15px] font-bold text-[#0A0A0A]">{title}</p>
                <p className="mt-1 text-[12px] font-medium text-[#6B7280]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[460px] rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
