'use client';

import { useActionState } from 'react';
import { createListing } from './actions';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
    "Vehicles",
    "Electronics",
    "Real Estate",
    "Jobs",
    "Services",
    "Dating",
    "Free Stuff"
];

export default function PostAdPage() {
    const [state, dispatch, isPending] = useActionState(createListing, undefined);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to marketplace
                </Link>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Post an Ad</h1>
                        <p className="mt-2 text-sm text-slate-400">Reach thousands of buyers across Kenya.</p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium text-slate-200">Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="What are you selling?"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                />
                                {state?.errors?.title && <p className="text-xs text-red-500">{state.errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="price" className="text-sm font-medium text-slate-200">Price (KSh)</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="85,000"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                />
                                {state?.errors?.price && <p className="text-xs text-red-500">{state.errors.price}</p>}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium text-slate-200">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm appearance-none"
                                >
                                    <option value="" disabled selected className="bg-slate-900 text-slate-500">Select a category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                                    ))}
                                </select>
                                {state?.errors?.category && <p className="text-xs text-red-500">{state.errors.category}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="location" className="text-sm font-medium text-slate-200">Location</label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    placeholder="e.g. Westlands, Nairobi"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                />
                                {state?.errors?.location && <p className="text-xs text-red-500">{state.errors.location}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-slate-200">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Describe your item in detail..."
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                            />
                            {state?.errors?.description && <p className="text-xs text-red-500">{state.errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="imageUrl" className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Image URL
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">For now, please provide a direct image link (e.g. from Unsplash or Pinterest).</p>
                            {state?.errors?.imageUrl && <p className="text-xs text-red-500">{state.errors.imageUrl}</p>}
                        </div>

                        {state?.message && !state?.errors && (
                            <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400">
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full items-center justify-center rounded-xl bg-purple-600 px-6 py-4 text-sm font-bold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-600/20"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post My Ad Now'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
