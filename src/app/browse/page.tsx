import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import { Search, Filter, MapPin } from "lucide-react";
import { getListings } from "../actions"; // Imports from your main actions file

const CATEGORIES = [
    "Vehicles", "Electronics", "Laptops", "4K TVs", "Real Estate",
    "Jobs", "Services", "Dating", "Auctions", "Free Parts",
    "AI Photoshoot", "Events", "Restaurants", "Printing Service", "Shuttle/Car Rental"
];

export default async function BrowsePage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; category?: string; location?: string }>
}) {
    const params = await searchParams;
    const listings = await getListings(params);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4 font-sans selection:bg-purple-500/30">
            <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* SIDEBAR FILTERS */}
                <aside className="md:col-span-1 space-y-8">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-lg mb-4 text-purple-400">
                            <Filter className="h-5 w-5" /> Filters
                        </h3>

                        {/* Updated Search Form */}
                        {/* Adding action="/browse" and method="GET" ensures the 'q' and 'location' appear in the URL */}
                        <form action="/browse" method="GET" className="space-y-4 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    name="q"
                                    defaultValue={params.q}
                                    placeholder="Search..."
                                    className="w-full rounded-xl bg-slate-900 border border-white/10 py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    name="location"
                                    defaultValue={params.location}
                                    placeholder="Location"
                                    className="w-full rounded-xl bg-slate-900 border border-white/10 py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* If a category is already selected, we keep it in the search by adding a hidden input */}
                            {params.category && (
                                <input type="hidden" name="category" value={params.category} />
                            )}

                            <button type="submit" className="w-full rounded-xl bg-purple-600 py-2 text-sm font-bold text-white hover:bg-purple-500 transition-colors">
                                Apply Filters
                            </button>
                        </form>

                        <div className="h-px bg-white/10 my-4" />

                        {/* Categories List */}
                        <div className="space-y-1">
                            <div className="font-medium text-slate-300 mb-2">Categories</div>
                            <Link
                                href="/browse"
                                className={`block px-3 py-2 rounded-lg text-sm ${!params.category ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:bg-white/5'}`}
                            >
                                All Categories
                            </Link>
                            {CATEGORIES.map(cat => (
                                <Link
                                    key={cat}
                                    href={`/browse?category=${encodeURIComponent(cat)}`}
                                    className={`block px-3 py-2 rounded-lg text-sm ${params.category === cat ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:bg-white/5'}`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAIN LISTINGS GRID */}
                <main className="md:col-span-3">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">
                            {params.category ? params.category : (params.q ? `Results for "${params.q}"` : "All Listings")}
                        </h1>
                        <span className="text-slate-400 text-sm">{listings.length} results found</span>
                    </div>

                    {listings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/5">
                            <p className="text-slate-500 text-lg">No listings found matching your search.</p>
                            <Link href="/browse" className="mt-4 text-purple-400 hover:underline">Clear all filters</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((item) => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}