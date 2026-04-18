import type { Metadata } from "next";
import { Geist_Mono, Manrope, Philosopher } from "next/font/google";

import "./globals.css";
import "./legalai-theme.css";
import "lenis/dist/lenis.css";
import { LenisProvider } from "@/components/providers/lenis-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// Helvetica configuration (using system font)
const helvetica = {
  variable: "--font-helvetica",
  style: {
    fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
  },
};

export const metadata: Metadata = {
  title: "LegalAI | Advisory Workflow Platform",
  description:
    "AI-powered legal and compliance workflow platform for matter intake, assisted drafting, review, and export-ready delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} ${philosopher.variable} h-full antialiased`}
      style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
    >
      <body className="min-h-full bg-background text-foreground">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
