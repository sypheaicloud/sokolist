import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
// ✅ SAFE IMPORTS ONLY: Removed all category icons to prevent crash
import { Search, MapPin, ArrowRight, User, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { getListings } from './actions';

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; location?: string }> }) {
    const session = await auth();
    const params = await searchParams;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-500 to-emerald-400" />
                        <span className="text-xl font-bold tracking-tight">SokoKenya</span>
                    </div>
                    <div className="hidden items-center gap-6 md:flex">
                        <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</Link>
                        <Link href="/browse" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Browse</Link>
                        <Link href="/messages" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Messages</Link>
                        {(session?.user as { isAdmin?: boolean })?.isAdmin && (
                            <Link href="/admin" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4" />
                                Admin
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {session?.user ? (
                            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white transition-colors">
                                <div className="h-8 w-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                                    <User className="h-4 w-4" />
                                </div>
                                <span>{session.user.name?.split(' ')[0]}</span>
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

            {/* Hero Section */}
            <section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden pt-24 pb-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[128px]" />
                    <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628526521369-2b4e72d24484?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                </div>

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                        Kenya&apos;s Premier Marketplace
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
                        Buy, sell, trade, and connect with verified locals. From Nairobi to Mombasa, find everything you need in one secure place.
                    </p>

                    <div className="mx-auto mt-8 max-w-2xl">
                        <form action="/" method="GET" className="group relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-md">
                            <Search className="ml-3 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={params.q}
                                placeholder="What are you looking for?"
                                className="flex-1 bg-transparent px-2 py-3 text-white placeholder:text-slate-500 focus:outline-none"
                            />
                            <div className="h-8 w-[1px] bg-white/10" />
                            <div className="flex items-center gap-2 px-3 text-slate-400">
                                <MapPin className="h-4 w-4" />
                                <input
                                    type="text"
                                    name="location"
                                    defaultValue={params.location}
                                    placeholder="Kenya"
                                    className="w-24 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                                />
                            </div>
                            <button type="submit" className="rounded-xl bg-purple-600 p-3 text-white hover:bg-purple-500 transition-colors">
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>
                        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                            <span>Popular:</span>
                            <Link href="/?q=Toyota" className="hover:text-purple-400 transition-colors">Toyota Vitz</Link>
                            <span>•</span>
                            <Link href="/?q=iPhone" className="hover:text-purple-400 transition-colors">iPhone 14</Link>
                            <span>•</span>
                            <Link href="/?category=Real Estate" className="hover:text-purple-400 transition-colors">Apartments in Kilimani</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-semibold tracking-tight text-white mb-8">Browse Categories</h2>

                {/* SAFE GRID: Uses Emojis to eliminate crash risk */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 mb-16">
                    <CategoryCard emoji="🚗" label="Vehicles" color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
                    <CategoryCard emoji="📱" label="Electronics" color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
                    <CategoryCard emoji="🏠" label="Real Estate" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                    <CategoryCard emoji="💼" label="Jobs" color="bg-amber-500/10 text-amber-400 border-amber-500/20" />
                    <CategoryCard emoji="🔧" label="Services" color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
                    <CategoryCard emoji="❤️" label="Dating" color="bg-pink-500/10 text-pink-400 border-pink-500/20" />
                    <CategoryCard emoji="⚖️" label="Auctions" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
                    <CategoryCard emoji="🎁" label="Free Parts" color="bg-teal-500/10 text-teal-400 border-teal-500/20" />

                    <CategoryCard emoji="📸" label="AI Photoshoot" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
                    <CategoryCard emoji="📅" label="Events" color="bg-cyan-500/10 text-cyan-400 border-cyan-500/20" />
                    <CategoryCard emoji="🍽️" label="Restaurants" color="bg-red-500/10 text-red-400 border-red-500/20" />
                    <CategoryCard emoji="💻" label="Tech Support - AI, DevOps" color="bg-slate-500/10 text-slate-400 border-slate-500/20" />
                    <CategoryCard emoji="🖨️" label="Printing Service" color="bg-sky-500/10 text-sky-400 border-sky-500/20" />
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
        </div>
    );
}

async function ListingGrid({ searchParams }: { searchParams: { q?: string; category?: string; location?: string } }) {
    const items = await getListings(searchParams);

    if (items.length === 0) {
        return (
            <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                <p className="text-slate-500">No listings found matching your search.</p>
            </div>
        );
    }

    return (
        <>
            {items.map((item) => (
                <Link key={item.id} href={`/listing/${item.id}`} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="h-48 w-full relative overflow-hidden bg-slate-800">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium bg-gradient-to-br from-slate-800 to-slate-900">
                                {item.category}
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                                {item.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                {item.userVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/10" />}
                                <span>{item.location}</span>
                            </div>
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-slate-100 group-hover:text-purple-400 transition-colors truncate">{item.title}</h3>
                        <p className="font-bold text-emerald-400">KSh {item.price.toLocaleString()}</p>
                    </div>
                </Link>
            ))}
        </>
    );
}

// ✅ SAFE CARD: Accepts Emoji String instead of Component to avoid crashes
function CategoryCard({ emoji, label, color }: { emoji: string, label: string, color: string }) {
    const isLongLabel = label.length > 20;
    return (
        <Link href={`/?category=${encodeURIComponent(label)}`} className={`group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 transition-all hover:scale-105 hover:bg-white/5 ${color} border border-white/5`}>
            <span className="text-3xl">{emoji}</span>
            <span className={`font-medium text-slate-200 group-hover:text-white text-center ${isLongLabel ? 'text-xs' : 'text-base'}`}>
                {label}
            </span>
        </Link>
    );
}