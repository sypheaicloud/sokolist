'use client';

import { useState, useActionState, useRef } from 'react';
import { createListing } from './actions';
import { ArrowLeft, Camera, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';

// ✅ UPDATED DROPDOWN LIST
const CATEGORIES = [
  "Vehicles",
  "Electronics",
  "Real Estate",
  "Jobs",
  "Services",
  "Dating",
  "Auctions",
  "Free Parts",
  "AI Photoshoot",
  "Events",
  "Restaurants",
  "Tech Support - AI, DevOps, Infrastructure",
  "Printing Service"
];

export default function PostAdPage() {
  // ... (rest of the component remains exactly the same)
  // I will provide the full file content below to prevent any copy-paste errors

  const [state, dispatch, isPending] = useActionState(createListing, undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = inputFileRef.current?.files?.[0];

    if (file) {
      setIsUploading(true);
      try {
        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        formData.set('imageUrl', newBlob.url);
        formData.delete('image');
      } catch (error) {
        console.error("❌ Upload failed:", error);
        alert("Image upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    // @ts-expect-error - dispatch expects FormData
    dispatch(formData);
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-200">Title</label>
                <input id="title" name="title" type="text" placeholder="What are you selling?" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                {state?.errors?.title && <p className="text-xs text-red-500">{state.errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-slate-200">Price (KSh)</label>
                <input id="price" name="price" type="number" placeholder="85,000" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                {state?.errors?.price && <p className="text-xs text-red-500">{state.errors.price}</p>}
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
                {state?.errors?.category && <p className="text-xs text-red-500">{state.errors.category}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-slate-200">Location</label>
                <input id="location" name="location" type="text" placeholder="e.g. Westlands, Nairobi" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
                {state?.errors?.location && <p className="text-xs text-red-500">{state.errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-200">Description</label>
              <textarea id="description" name="description" rows={4} placeholder="Describe your item in detail..." required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" />
              {state?.errors?.description && <p className="text-xs text-red-500">{state.errors.description}</p>}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-2"><Camera className="h-4 w-4" /> Photos</label>
              <input ref={inputFileRef} id="image-upload" type="file" name="image" accept="image/*" onChange={handleImageChange} className="sr-only" />
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition-all hover:border-purple-500/50">
                {preview ? (
                  <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg shadow-2xl">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <button type="button" onClick={() => { setPreview(null); if (inputFileRef.current) inputFileRef.current.value = ''; }} className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg hover:bg-red-500 transition-colors"><XCircle className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-400 py-4">
                    <Camera className="h-12 w-12 opacity-20" />
                    <div className="text-sm font-semibold text-slate-300">Click to upload photos</div>
                    <div className="text-xs">Max 500MB (Fast Upload)</div>
                  </label>
                )}
              </div>
              {state?.errors?.imageUrl && <p className="text-xs text-red-500 mt-2">{state.errors.imageUrl}</p>}
            </div>

            {state?.message && !state?.errors && (
              <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400">{state.message}</div>
            )}

            <button type="submit" disabled={isPending || isUploading} className="flex w-full items-center justify-center rounded-xl bg-purple-600 px-6 py-4 text-sm font-bold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-600/20">
              {(isPending || isUploading) ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isUploading ? 'Uploading Image...' : 'Creating Listing...'}</>) : ('Post My Ad Now')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}