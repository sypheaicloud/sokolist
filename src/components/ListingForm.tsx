'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';

// DEFAULT EXPORT (Fixes import error)
export default function ListingForm({ listing, action }: { listing?: any, action: any }) {
    const [imageUrl, setImageUrl] = useState(listing?.imageUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    const categories = [
        "Vehicles", "Electronics", "Laptops",
        "IT (Network, Cloud, Devops, AI)", "Real Estate",
        "Jobs", "Services", "Trade", "Dating",
        "Phones", "Construction"
    ];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Client-side upload (Fixes "File Too Large")
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });
            setImageUrl(newBlob.url);
        } catch (error) {
            console.error(error);
            alert("Upload failed. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form action={action} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
            {/* Hidden Input for URL */}
            <input type="hidden" name="imageUrl" value={imageUrl} />

            <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">Title</label>
                <input name="title" defaultValue={listing?.title} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-2 font-medium">Price (KSh)</label>
                    <input name="price" type="number" defaultValue={listing?.price} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" required />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-2 font-medium">Category</label>
                    <select name="category" defaultValue={listing?.category || ''} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500">
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">Location</label>
                <input name="location" defaultValue={listing?.location} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>

            <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">Description</label>
                <textarea name="description" defaultValue={listing?.description} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl h-32 outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>

            <div className="space-y-4">
                <label className="block text-sm text-slate-400 font-medium">Listing Image</label>
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
                    <div className="w-full border-2 border-dashed border-white/10 bg-slate-900/50 p-8 rounded-2xl flex flex-col items-center gap-2 group-hover:border-purple-500/50 transition-colors">
                        {isUploading ? <Loader2 className="animate-spin text-purple-500" /> : <Upload className="text-slate-500" />}
                        <span className="text-sm text-slate-300 font-medium">{isUploading ? 'Uploading to Blob...' : 'Change Image'}</span>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 disabled:opacity-50">
                {isUploading ? 'Finalizing Upload...' : 'Save Changes'}
            </button>
        </form>
    );
}