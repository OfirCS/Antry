import { Nav } from "@/components/Nav";
import Image from "next/image";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="pt-[72px] min-h-screen">{children}</div>
      <footer className="border-t border-black/5 dark:border-white/5 px-8 py-6 bg-background-primary">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between text-[13px] text-text-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-text-primary rounded-[8px] flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Antry"
                width={14}
                height={14}
                className="invert brightness-0 dark:invert-0"
              />
            </div>
            <span className="font-semibold text-text-primary">Antry</span>
          </div>
          <span>&copy; 2026</span>
        </div>
      </footer>
    </>
  );
}
