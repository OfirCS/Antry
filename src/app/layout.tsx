import type { Metadata } from "next";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ScoutAgent } from "@/components/ScoutAgent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antry — Build. Hire. Hack. Invest.",
  description:
    "The AI coder platform where builders ship, companies hire, hackers compete, and investors discover the next big idea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <div className="grain-overlay" />
        <AuthProvider>
          {children}
          <ScoutAgent />
        </AuthProvider>
      </body>
    </html>
  );
}
