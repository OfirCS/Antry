import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <header className="h-[72px] flex items-center px-8">
        <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div className="w-7 h-7 bg-text-primary rounded-[8px] flex items-center justify-center">
            <Image src="/logo.png" alt="Antry" width={14} height={14} className="invert brightness-0 dark:invert-0" />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">Antry</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-8 pb-20">{children}</main>
    </div>
  );
}
