import { Nav } from "@/components/Nav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AntryLogoFull } from "@/components/AntryLogo";
import Link from "next/link";

/**
 * Platform layout — slim nav at the top, content fills, minimal footer.
 *
 * Footer was a 12-column information dump with five link groups and
 * social icons. Killed in the social-feed pivot: a feed product doesn't
 * need a marketing footer on every page. Two lines: brand + a couple
 * of essentials. Anything else is a distraction.
 */
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FAFAF7" }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-[#0A0A0A] focus:text-white focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" className="flex-1 pt-16 pb-20 sm:pb-0">
        {children}
      </main>

      <footer
        className="border-t hidden sm:block"
        style={{ background: "#FFFFFF", borderColor: "#EBEBEB" }}
      >
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-6 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center hover:opacity-70 transition-opacity"
          >
            <AntryLogoFull size={20} />
          </Link>
          <nav className="flex items-center gap-4 text-[12px] text-gray-500">
            <Link href="/agents" className="hover:text-black transition-colors">
              MCP
            </Link>
            <Link
              href="/receipts/methodology"
              className="hover:text-black transition-colors"
            >
              Methodology
            </Link>
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}
