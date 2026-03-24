import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ScoutAgent } from "@/components/ScoutAgent";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antry — Where Builders Prove Their Work",
  description:
    "The platform for technical talent. Replace resumes with live demos and verified shipping history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
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
