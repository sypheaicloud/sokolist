import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Search, MapPin, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getListings } from './actions';
import SubscribeForm from '@/components/SubscribeForm';

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; location?: string; error?: string }> }) {
  const session = await auth();
  const params = await searchParams;
  const isUnavailable = params.error === "support_unavailable";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 flex flex-col">

      {/* ⚠️ SUPPORT UNAVAILABLE ALERT */}
      {isUnavailable && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
          <div className="bg-amber-500/10 border border-amber-500/50 text-amber-400 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-2xl">
            <AlertCircle size={20} className="shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold">Support System Offline</span>
              <span className="text-xs opacity-80">Our team is currently setting up. Please try again in a few minutes.</span>
            </div>
            <Link href="/" className="ml-4 text-xs font-bold hover:underline">Dismiss</Link>
          </div>
        </div>
      )}

      {/* 🔒 COMBINED HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100]">

        {/* 1. TOP CREDIT BAR */}
        <div className="bg-gradient-to-r from-purple-900 to-slate-900 border-b border-white/10 shadow-lg relative z-[101]">
          <div className="w-full px-8 md:px-20 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">

            <div className="flex items-center text-[10px] md:text-xs font-medium text-purple-200 uppercase tracking-widest">
              <Sparkles className="h-3 w-3 mr-2 text-purple-400" />
              Web App design by <span className="text-white font-bold mx-1">Syphe IT</span>
              <span className="hidden sm:inline mx-2 text-purple-500">|</span>
              <span className="hidden sm:inline text-purple-300 lowercase tracking-normal">sypheit@gmail.com</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[10px] text-purple-300 font-medium uppercase tracking-widest">Get Updates:</span>
              <SubscribeForm />
            </div>

          </div>
        </div>

        {/* 2. NAVIGATION BAR */}
        <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl h-16 relative z-[100]">
          <div className="w-full flex h-full items-center justify-between px-8 md:px-20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-500 to-emerald-400" />
              <span className="text-xl font-bold tracking-tight">SokoKenya</span>
            </div>
            <div className="hidden items-center gap-6 md:flex">
              <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link href="/browse" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Browse</Link>
              <Link href="/messages" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Messages</Link>
              {(session?.user as any)?.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white transition-colors">
                  <div className="h-8 w-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                    <span>{session.user.name?.[0] || 'U'}</span>
                  </div>
                  <span className="hidden sm:inline">{session.user.name?.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
              )}
              <Link href="/post" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors">
                Post Ad
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      {/* UPDATED: pt-24 (moved up) and min-h-[35vh] (shorter, so categories show) */}
      <section className="relative flex min-h-[35vh] items-center justify-center overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628526521369-2b4e72d24484?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 w-full px-8 md:px-20 text-center">
          {/* UPDATED: Reduced font size (text-3xl ... md:text-5xl lg:text-6xl) */}
          <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Kenya&apos;s Premier Marketplace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            Buy, sell, trade, and connect with verified locals. From Nairobi to Mombasa, find everything you need in one secure place.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <form action="/" method="GET" className="group relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-md">
              <Search className="ml-3 text-slate-500" size={20} />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="What are you looking for?"
                className="flex-1 bg-transparent px-2 py-3 text-white placeholder:text-slate-500 focus:outline-none"
              />
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2 px-3 text-slate-400">
                <MapPin size={18} className="text-slate-500" />
                <input
                  type="text"
                  name="location"
                  defaultValue={params.location}
                  placeholder="Kenya"
                  className="w-24 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <button type="submit" className="rounded-xl bg-purple-600 p-3 text-white hover:bg-purple-500 transition-colors">
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories & Listings */}
      <section className="w-full px-8 md:px-20 py-12 flex-1">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mb-16">
          <CategoryCard emoji="🚗" label="Vehicles" color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
          <CategoryCard emoji="📱" label="Electronics" color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
          <CategoryCard emoji="💻" label="Laptops" color="bg-zinc-500/10 text-zinc-400 border-zinc-500/20" />
          <CategoryCard emoji="🌐" label="IT Operations(End User, Network, Cloud, Devops, AI)" color="bg-cyan-500/10 text-cyan-400 border-cyan-500/20" />
          <CategoryCard emoji="🏠" label="Real Estate" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
          <CategoryCard emoji="💼" label="Jobs" color="bg-amber-500/10 text-amber-400 border-amber-500/20" />
          <CategoryCard emoji="🔧" label="Services" color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
          <CategoryCard emoji="🤝" label="Trade" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
          <CategoryCard emoji="❤️" label="Dating" color="bg-pink-500/10 text-pink-400 border-pink-500/20" />
          <CategoryCard emoji="📞" label="Phones" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
          <CategoryCard emoji="🏗️" label="Construction" color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20" />
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {params.category ? `${params.category} Listings` : (params.q ? `Results for "${params.q}"` : "Just In")}
          </h2>
          {(params.q || params.category || params.location) && (
            <Link href="/" className="text-sm text-purple-400 hover:underline">Clear all</Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<div className="col-span-full text-center text-slate-500 py-12">Loading listings...</div>}>
            <ListingGrid searchParams={params} />
          </Suspense>
        </div>
      </section>

      {/* Safety Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 py-12 mt-20 relative z-10">
        <div className="w-full px-8 md:px-20">
          <div className="mb-8 text-center text-white">
            <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
              <ShieldCheck className="text-emerald-400" /> Safety First
            </h3>
            <p className="text-slate-400 text-sm">Follow these simple rules to stay safe while trading on SokoKenya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <SafetyTip emoji="⚠️" title="Do Not Prepay" desc="Never pay for items in advance, including delivery fees." />
            <SafetyTip emoji="🔎" title="Inspect Products" desc="Always check the item thoroughly before handing over money." />
            <SafetyTip emoji="📍" title="Meet in Public" desc="Meet in safe, busy public locations like malls." />
          </div>
          <div className="mt-12 text-center border-t border-white/5 pt-8 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SokoKenya. Website by Syphe IT.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SafetyTip({ emoji, title, desc }: { emoji: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5">
      <div className="text-xl mb-3">{emoji}</div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  );
}

function CategoryCard({ emoji, label, color }: { emoji: string, label: string, color: string }) {
  return (
    <Link href={`/?category=${encodeURIComponent(label)}`} className={`group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 transition-all hover:scale-105 hover:bg-white/5 ${color} border-white/5`}>
      <span className="text-3xl">{emoji}</span>
      <span className="font-medium text-slate-200 text-center text-sm">{label}</span>
    </Link>
  );
}

async function ListingGrid({ searchParams }: { searchParams: { q?: string; category?: string; location?: string } }) {
  const items = await getListings(searchParams);
  if (items.length === 0) return <div className="col-span-full py-20 text-center">No listings found.</div>;

  return (
    <>
      {items.map((item) => (
        <Link key={item.id} href={`/listing/${item.id}`} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:-translate-y-1">
          <div className="h-48 w-full relative overflow-hidden">
            {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />}
          </div>
          <div className="p-4">
            <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">{item.category}</span>
            <h3 className="mb-1 text-base font-bold text-slate-100 truncate">{item.title}</h3>
            <p className="font-bold text-emerald-400">KSh {item.price.toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </>
  );
}