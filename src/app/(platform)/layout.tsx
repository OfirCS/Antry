import { Nav } from "@/components/Nav";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="pt-[60px] min-h-screen">{children}</div>
      <footer className="border-t border-border-tertiary px-6 py-6">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between text-[11px] text-text-tertiary">
          <span>antry — the colony</span>
          <span>7 North Park Rd, Vaughan, ON L4J 0C9</span>
        </div>
      </footer>
    </>
  );
}
