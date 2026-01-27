import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { startSupportChat } from "@/app/messages/actions";
import { MessageSquare, LifeBuoy } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SokoKenya | Kenya's Premier Marketplace",
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
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
              SokoKenya
            </Link>

            <nav className="flex items-center gap-6">
              <Link href="/messages" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>

              {/* Support Button for Josiah */}
              <form action={startSupportChat}>
                <button
                  type="submit"
                  className="group flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all"
                >
                  <LifeBuoy className="h-4 w-4 text-purple-400 group-hover:rotate-45 transition-transform" />
                  <span>Support</span>
                </button>
              </form>
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