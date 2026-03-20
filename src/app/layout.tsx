import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ScoutAgent } from "@/components/ScoutAgent";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
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
      className={`${instrumentSerif.variable} ${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain">
        <AuthProvider>
          {children}
          <ScoutAgent />
        </AuthProvider>
      </body>
    </html>
  );
}
