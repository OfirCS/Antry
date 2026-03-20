import type { Metadata } from "next";
import { Sora, DM_Sans, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ScoutAgent } from "@/components/ScoutAgent";
import "./globals.css";

const sora = Sora({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${sora.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="noise-overlay" />
        <AuthProvider>
          {children}
          <ScoutAgent />
        </AuthProvider>
      </body>
    </html>
  );
}
