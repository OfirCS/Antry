import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-[60px] flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Image src="/logo.png" alt="Antry" width={20} height={20} className="dark:invert" />
          <span className="text-[13px] font-medium tracking-[0.14em] text-text-primary uppercase">antry</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-20">{children}</main>
    </div>
  );
}
