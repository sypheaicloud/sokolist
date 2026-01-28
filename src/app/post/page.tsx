'use client';

import { useState, useActionState, useRef } from 'react';
import { createListing } from './actions';
import { ArrowLeft, Camera, Loader2, Trash2, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const CATEGORIES = [
    "Vehicles", "Electronics", "Laptops", "4K TVs", "Real Estate",
    "Jobs", "Services", "Dating", "Auctions", "Free Parts",
    "AI Photoshoot", "Events", "Restaurants",
    "Tech Support - AI, DevOps, Infrastructure",
    "Printing Service", "Shuttle/Car Rental"
];

export default function PostAdPage() {
    // Note: createListing now handles the file upload on the server
    const [state, dispatch, isPending] = useActionState(createListing, undefined);
    const [preview, setPreview] = useState<string | null>(null);
    const inputFileRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        inputFileRef.current?.click();
    };

    const removeImage = () => {
        setPreview(null);
        if (inputFileRef.current) {
            inputFileRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to marketplace
                </Link>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Post an Ad</h1>
                        <p className="mt-2 text-sm text-slate-400">Reach thousands of buyers across Kenya.</p>
                    </div>

                    {/* ✨ encType is vital for sending the file to the Server Action */}
                    <form action={dispatch} className="space-y-6" encType="multipart/form-data">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium text-slate-200">Title</label>
                                <input id="title" name="title" type="text" placeholder="What are you selling?" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="price" className="text-sm font-medium text-slate-200">Price (KSh)</label>
                                <input id="price" name="price" type="number" placeholder="85,000" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium text-slate-200">Category</label>
                                <select id="category" name="category" required defaultValue="" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm appearance-none">
                                    <option value="" disabled className="bg-slate-900 text-slate-500">Select a category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="location" className="text-sm font-medium text-slate-200">Location</label>
                                <input id="location" name="location" type="text" placeholder="e.g. Westlands, Nairobi" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-slate-200">Description</label>
                            <textarea id="description" name="description" rows={4} placeholder="Describe your item in detail..." required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                <Camera className="h-4 w-4" /> Photos
                            </label>

                            {/* Standard file input used by the Server Action */}
                            <input
                                ref={inputFileRef}
                                id="image-upload"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                                required
                            />

                            {preview ? (
                                <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-white/10 shadow-2xl group">
                                    <Image src={preview} alt="Preview" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button type="button" onClick={triggerFileInput} className="flex flex-col items-center gap-1 text-white hover:text-purple-400 transition-colors">
                                            <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10">
                                                <RefreshCw className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-medium">Change</span>
                                        </button>
                                        <button type="button" onClick={removeImage} className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors">
                                            <div className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/20">
                                                <Trash2 className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-medium">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={triggerFileInput} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition-all hover:border-purple-500/50 hover:bg-white/10 cursor-pointer group">
                                    <div className="rounded-full bg-purple-500/20 p-4 mb-3 group-hover:scale-110 transition-transform">
                                        <Camera className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="text-sm font-semibold text-slate-300">Click to upload photo</div>
                                    <div className="text-xs text-slate-500 mt-1">Maximum file size is 4MB</div>
                                </div>
                            )}
                        </div>

                        {state?.message && (
                            <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400">
                                {state.message}
                            </div>
                        )}

                        <button type="submit" disabled={isPending} className="flex w-full items-center justify-center rounded-xl bg-purple-600 px-6 py-4 text-sm font-bold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-600/20">
                            {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing Ad...</>) : ('Post My Ad Now')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}