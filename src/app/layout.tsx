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
  metadataBase: new URL("https://www.uzamarket.com"),
  title: "Kenya MarketPlace - :Buy, Sell, Trade & Connect in Kenya",
  description: "Looking to buy, sell, or trade in Kenya? UzaMarket is your free local classifieds platform for cars, electronics, services, dating, and more. Join now!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kenya MarketPlace - :Buy, Sell, Trade & Connect in Kenya",
    description: "Looking to buy, sell, or trade in Kenya? UzaMarket is your free local classifieds platform for cars, electronics, services, dating, and more. Join now!",
    url: "https://www.uzamarket.com",
    siteName: "UzaMarket",
    images: "/seo.jpg",
    locale: "en_KE",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Uzamarket-Kenyan MarketPlace",
              "url": "https://uzamarket.com",
              "description": "Looking to buy, sell, or trade in Kenya? UzaMarket is your free local classifieds platform for cars, electronics, services, dating, and more. Join now!",
              "applicationCategory": "Marketplace",
              "operatingSystem": "Web",
              "brand": {
                "@type": "Brand",
                "name": "Uzamarket"
              },
              "publisher": {
                "@type": "Organization",
                "name": "RASWILK COMPANY LTD",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://uzamarket.com/seo.png"
                }
              },
              "offers": {
                "@type": "Offer",
                "price": "5.00",
                "priceCurrency": "KES"
              }
            })
          }}
        />
      </head>
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