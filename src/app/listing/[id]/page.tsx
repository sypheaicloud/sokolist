import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { startConversation } from '../../messages/actions';
import Image from 'next/image';
import { MapPin, User, MessageCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 15 requires awaiting params
    const { id } = await params;
    const session = await auth();

    // Fetch listing and seller data
    const result = await db.select({
        listing: listings,
        seller: users,
    })
        .from(listings)
        .leftJoin(users, eq(listings.userId, users.id))
        .where(eq(listings.id, id))
        .limit(1);

    const data = result[0];
    if (!data) notFound();

    const { listing, seller } = data;

    // Server Action Wrapper for the Form
    async function handleMessageAction() {
        'use server';
        if (listing.userId) {
            await startConversation(listing.id, listing.userId);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to marketplace
                </Link>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden aspect-square relative">
                        {listing.imageUrl ? (
                            <Image
                                src={listing.imageUrl}
                                alt={listing.title}
                                fill
                                className="w-full h-full object-cover"
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
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold mb-3">
                                {listing.category}
                            </span>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{listing.title}</h1>
                            <p className="text-2xl font-bold text-emerald-400">KSh {listing.price.toLocaleString()}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {listing.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                <span>Posted by {seller?.name || 'Anonymous'}</span>
                                {seller?.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-400 fill-emerald-400/10" />}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                            <h2 className="font-semibold mb-4">Description</h2>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                        </div>

                        {/* Messaging Logic */}
                        {session?.user?.id !== listing.userId ? (
                            <form action={handleMessageAction}>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Message Seller
                                </button>
                            </form>
                        ) : (
                            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-center text-sm">
                                This is your listing
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}