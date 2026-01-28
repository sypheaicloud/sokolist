// src/app/dashboard/page.tsx
import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { deleteListing, markAsSold } from '@/app/post/actions';
import { Trash2, CheckCircle, PackageSearch } from 'lucide-react';
import Image from 'next/image';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const userListings = await db.select()
        .from(listings)
        .where(eq(listings.userId, session.user.id))
        .orderBy(desc(listings.id));

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Listings</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage your active and sold advertisements.</p>
                </div>

                {userListings.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <PackageSearch className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                        <p className="text-slate-400 font-medium">You haven't posted any ads yet.</p>
                        <p className="text-slate-600 text-sm">Your active ads will appear here once you post them.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {userListings.map((ad) => (
                            <div key={ad.id} className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-opacity ${!ad.isActive ? 'opacity-60' : ''}`}>
                                <div className="h-20 w-20 relative rounded-xl overflow-hidden shrink-0 border border-white/10">
                                    <Image src={ad.imageUrl || ''} alt="" fill className="object-cover" unoptimized />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-bold truncate">{ad.title}</h3>
                                        {!ad.isActive && (
                                            <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wider">
                                                Sold
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-purple-400 font-bold">KSh {ad.price.toLocaleString()}</p>
                                </div>

                                <div className="flex gap-2">
                                    {/* Mark as Sold Form (Only show if still active) */}
                                    {ad.isActive && (
                                        <form action={markAsSold.bind(null, ad.id)}>
                                            <button className="p-3 text-emerald-400 bg-emerald-400/5 hover:bg-emerald-400/10 border border-emerald-400/10 rounded-xl transition-all" title="Mark as Sold">
                                                <CheckCircle size={20} />
                                            </button>
                                        </form>
                                    )}

                                    {/* Delete Form */}
                                    <form action={deleteListing.bind(null, ad.id)}>
                                        <button className="p-3 text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 rounded-xl transition-all" title="Delete Listing">
                                            <Trash2 size={20} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}