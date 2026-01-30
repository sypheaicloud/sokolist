import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { startChat } from '@/app/actions/startChat'; // ✅ Corrected Import
import Image from 'next/image';
import { MapPin, ArrowLeft, ShieldCheck, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function ListingDetailPage(props: { params: Promise<{ id: string }> }) {
    // ✅ Next.js 15: Await params
    const params = await props.params;
    const session = await auth();

    const result = await db.select({
        listing: listings,
        seller: users,
    })
        .from(listings)
        .leftJoin(users, eq(listings.userId, users.id))
        .where(eq(listings.id, params.id))
        .limit(1);

    const data = result[0];
    if (!data) notFound();

    const { listing, seller } = data;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to marketplace
                </Link>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden aspect-square relative shadow-2xl">
                        {listing.imageUrl ? (
                            <Image
                                src={listing.imageUrl}
                                alt={listing.title}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                                No image available
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
                                    {listing.category}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(listing.createdAt || new Date()))} ago
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{listing.title}</h1>
                            <p className="text-2xl font-bold text-emerald-400">KSh {listing.price.toLocaleString()}</p>
                        </div>

                        <div className="flex flex-col gap-3 text-sm text-slate-400 border-y border-white/5 py-6">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-purple-500" />
                                {listing.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30 text-[10px] overflow-hidden">
                                    {/* Show User Image if available, otherwise Initials */}
                                    {seller?.image ? (
                                        <Image src={seller.image} alt="Seller" width={24} height={24} className="object-cover" />
                                    ) : (
                                        <span>{seller?.name?.[0] || 'U'}</span>
                                    )}
                                </div>
                                <span className="font-medium text-slate-200">Seller: {seller?.name || 'Anonymous'}</span>
                                {seller?.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-400 fill-emerald-400/10" />}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <h2 className="font-semibold text-slate-100 mb-4">Item Description</h2>
                            <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm">{listing.description}</p>
                        </div>

                        {/* Messaging Logic */}
                        {session?.user?.id !== listing.userId ? (
                            // ✅ Uses the startChat Action we created
                            <form action={startChat.bind(null, listing.id, listing.userId || '')}>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 active:scale-95"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Message Seller
                                </button>
                            </form>
                        ) : (
                            // ✅ Fixed Edit Link to point to Dashboard
                            <Link
                                href={`/dashboard/edit/${listing.id}`}
                                className="block w-full text-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold text-sm hover:bg-emerald-500/10 transition-colors"
                            >
                                You own this ad — Edit Listing
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}