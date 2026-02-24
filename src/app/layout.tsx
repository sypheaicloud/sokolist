import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/react";
import { MessageSquare } from "lucide-react";
import UnreadBadge from "@/components/UnreadBadge"; // 👈 Import the Badge
import { Suspense } from "react"; // 👈 Needed for async components
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getSiteStats } from "./actions";
import MobileNav from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kenyan Digital Marketplace | Kenya's Premier Marketplace",
  description: "Buy, sell, trade, and connect with verified locals across Kenya.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon_io/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon_io/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stats = await getSiteStats();
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 mb-20 md:mb-0`}
      >

        <AnalyticsTracker />
        <main>
          {children}
        </main>
        <MobileNav />
        <Analytics />
      </body>
    </html>
  );
}