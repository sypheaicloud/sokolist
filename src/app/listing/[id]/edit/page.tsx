'use client';

import { useState, use } from 'react';
import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { upload } from '@vercel/blob/client'; // Import client-side upload

export default function EditListingPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const id = params.id;

    // We handle the data fetching and session in a parent or via a client-side fetch if needed, 
    // but for this specific update, let's focus on the form logic:

    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    // In a real app, you'd fetch the initial 'listing' data here or pass it as a prop.

    async function handleFormSubmit(formData: FormData) {
        // We handle the upload manually here to avoid the Payload Too Large error
        const imageFile = formData.get('imageFile') as File;
        let finalImageUrl = ""; // This would be the existing URL by default

        if (imageFile && imageFile.size > 0) {
            setIsUploading(true);
            try {
                // Upload DIRECTLY from the browser to Vercel Blob
                const newBlob = await upload(imageFile.name, imageFile, {
                    access: 'public',
                    handleUploadUrl: '/api/upload', // You need this API route created
                });
                finalImageUrl = newBlob.url;
            } catch (error) {
                console.error("Upload failed", error);
                alert("Image too large or upload failed.");
                setIsUploading(false);
                return;
            }
        }

        // Now we send the URL (a small string) to the server instead of the heavy File
        // Call your server action here with finalImageUrl
    }

    const categories = [
        "Vehicles", "Electronics", "Laptops",
        "IT (Network, Cloud, Devops, AI)", "Real Estate",
        "Jobs", "Services", "Trade", "Dating",
        "Phones", "Construction"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="mx-auto max-w-2xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 mb-8 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8">Edit Your Ad</h1>

                <form action={handleFormSubmit} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    {/* ... (Title, Price, Category inputs remain the same) ... */}

                    {/* Image Section */}
                    <div className="space-y-4">
                        <label className="block text-sm text-slate-400 font-medium">Listing Image</label>

                        {(previewUrl) && (
                            <div className="relative h-40 w-40 rounded-2xl overflow-hidden border border-white/10">
                                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                            </div>
                        )}

                        <div className="relative group">
                            <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setPreviewUrl(URL.createObjectURL(file));
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full border-2 border-dashed border-white/10 bg-slate-900/50 p-8 rounded-2xl flex flex-col items-center gap-2 group-hover:border-purple-500/50 transition-colors">
                                {isUploading ? <Loader2 className="animate-spin text-purple-500" /> : <Upload className="text-slate-500" />}
                                <span className="text-sm text-slate-300 font-medium">
                                    {isUploading ? "Uploading to Cloud..." : "Replace Image"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-purple-600/20"
                    >
                        {isUploading ? "Processing..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}