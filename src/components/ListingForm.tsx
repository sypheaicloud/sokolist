'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';

// Use this inside your Edit/Post form
export function ListingForm({ listing, action }: { listing?: any, action: any }) {
    const [imageUrl, setImageUrl] = useState(listing?.imageUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Direct upload to Vercel Blob bypasses the "Payload Too Large" error
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });

            setImageUrl(newBlob.url); // Set the URL so the form can save it
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form action={action} className="space-y-6">
            {/* Hidden input to send the URL to your Server Action */}
            <input type="hidden" name="imageUrl" value={imageUrl} />

            {/* Image Preview Area */}
            <div className="space-y-4">
                {imageUrl && (
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10">
                        <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                )}

                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full border-2 border-dashed border-white/10 bg-slate-900/50 p-8 rounded-2xl flex flex-col items-center gap-2">
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                        <span>{isUploading ? 'Uploading...' : 'Change Image'}</span>
                    </div>
                </div>
            </div>

            {/* ... rest of your title, price, category fields */}
            <button type="submit" disabled={isUploading} className="w-full bg-purple-600 p-4 rounded-2xl font-bold">
                {isUploading ? 'Waiting for upload...' : 'Save Changes'}
            </button>
        </form>
    );
}