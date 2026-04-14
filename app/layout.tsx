import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono, VT323, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shayan Siddiqui",
  description:
    "Software engineering student at Wilfrid Laurier University. Building across the full stack — from HTTP servers in Go to production web apps.",
  keywords: ["software engineer", "full-stack developer", "portfolio", "Next.js", "Go", "React", "TypeScript"],
  authors: [{ name: "Shayan Siddiqui" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Shayan Siddiqui",
    description:
      "Software engineering student at Wilfrid Laurier University. Building across the full stack — from HTTP servers in Go to production web apps.",
    siteName: "Shayan Siddiqui",
  },
  twitter: {
    card: "summary",
    title: "Shayan Siddiqui",
    description:
      "Software engineering student at Wilfrid Laurier University. Building across the full stack — from HTTP servers in Go to production web apps.",
    creator: "@shayansiddiqui172",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shareTechMono.variable} ${vt323.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
