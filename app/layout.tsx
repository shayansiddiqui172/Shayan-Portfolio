import type { Metadata } from "next";
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
  description: "Personal portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shareTechMono.variable} ${vt323.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
