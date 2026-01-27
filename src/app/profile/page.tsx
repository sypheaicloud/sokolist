import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserListings, deleteMyListing } from "./actions";
import { LogOut, MapPin, Calendar, Edit2, Trash2, PlusCircle, ExternalLink } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch the user's listings
    const myListings = await getUserListings();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4 font-sans">
            <div className="container mx-auto max-w-5xl">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 p-8 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-purple-500 to-emerald-400 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                            {session.user.name?.[0] || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{session.user.name}</h1>
                            <p className="text-slate-400">{session.user.email}</p>
                            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                Verified Member
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/post" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-600/20">
                            <PlusCircle className="h-5 w-5" /> Post New Ad
                        </Link>
                        <form action={async () => {
                            'use server';
                            // Add your signout logic here if needed, or link to signout route
                            redirect('/api/auth/signout');
                        }}>
                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-all">
                                <LogOut className="h-5 w-5" /> Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* MY LISTINGS SECTION */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        My Listings <span className="text-sm font-normal text-slate-500 ml-2">({myListings.length} active)</span>
                    </h2>

                    {myListings.length === 0 ? (
                        <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/5">
                            <p className="text-slate-400 mb-4">You haven&apos;t posted any ads yet.</p>
                            <Link href="/post" className="text-purple-400 hover:text-purple-300 underline font-medium">Start selling today!</Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {myListings.map((item) => (
                                <div key={item.id} className="group flex flex-col md:flex-row gap-6 p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition-all">

                                    {/* Image Thumbnail */}
                                    <div className="relative h-48 md:h-32 w-full md:w-48 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-800 text-xs">No Image</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <Link href={`/listing/${item.id}`} className="text-lg font-bold text-slate-100 hover:text-purple-400 transition-colors flex items-center gap-2">
                                                    {item.title}
                                                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                                                </Link>
                                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                                    KSh {item.price.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{item.category}</span>
                                            </div>
                                        </div>

                                        {/* ACTION BUTTONS: Edit & Delete */}
                                        <div className="flex gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">

                                            {/* ✏️ EDIT BUTTON */}
                                            <Link
                                                href={`/listing/${item.id}/edit`}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-sm font-medium transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" /> Edit
                                            </Link>

                                            {/* 🗑️ DELETE BUTTON */}
                                            <form action={deleteMyListing} className="flex-1 md:flex-none">
                                                <input type="hidden" name="id" value={item.id} />
                                                <button
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-sm font-medium border border-red-500/20 transition-colors"
                                                    onclick="return confirm('Are you sure you want to delete this listing permanently?');"
                                                >
                                                    <Trash2 className="h-4 w-4" /> Delete
                                                </button>
                                            </form>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}