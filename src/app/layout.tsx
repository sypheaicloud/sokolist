import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import UnreadBadge from "@/components/UnreadBadge"; // 👈 Import the Badge
import { Suspense } from "react"; // 👈 Needed for async components

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketPlace-Kenya | Kenya's Premier Marketplace",
  description: "Buy, sell, trade, and connect with verified locals across Kenya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        {/* Global Navigation Bar */}
        <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/20 bg-white p-1 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <Image
                  src="/logo.png"
                  alt="MarketPlace-Kenya Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                MarketPlace-Kenya
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              {/* 👇 UPDATED: Messages Link with Badge */}
              <Link href="/messages" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 relative">
                <div className="relative flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                  <Suspense fallback={null}>
                    <UnreadBadge />
                  </Suspense>
                </div>
              </Link>
            </nav>
          </div>
        </header>

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}