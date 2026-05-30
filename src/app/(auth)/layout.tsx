import Link from "next/link";
import { AntryLogoFull } from "@/components/AntryLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7] text-[#0A0A0A]">
      {/* Top bar */}
      <header className="shrink-0">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center px-6 sm:px-10">
          <Link
            href="/"
            aria-label="Antry — back to home"
            className="inline-flex items-center transition-opacity duration-150 hover:opacity-70"
          >
            <AntryLogoFull size={24} />
          </Link>
        </div>
      </header>

      {/* Centered card */}
      <main className="flex flex-1 items-start justify-center px-6 pb-12 pt-6 sm:pt-12">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-8 shadow-[0_1px_2px_rgba(10,10,10,0.03),0_8px_24px_rgba(10,10,10,0.04)] sm:p-10">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 pb-8 pt-4">
        <p className="text-center text-[12px] text-[#A3A3A3]">
          Antry &middot; Receipts for the AI era.
        </p>
      </footer>
    </div>
  );
}
