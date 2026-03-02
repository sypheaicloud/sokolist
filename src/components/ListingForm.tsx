'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import { Upload, Loader2, X, ImagePlus } from 'lucide-react';

// ✅ List of all 47 Counties + Major Cities
const KENYAN_LOCATIONS = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
    "Kiambu", "Kitale", "Malindi", "Garissa", "Kakamega", "Mbale",
    "Kapenguria", "Bungoma", "Busia", "Nyeri", "Meru", "Kilifi",
    "Wajir", "Kericho", "Vihiga", "Homa Bay", "Kisii", "Nyamira",
    "Migori", "Embu", "Machakos", "Makueni", "Kitui", "Kajiado",
    "Narok", "Bomet", "Kericho", "Nandi", "Uasin Gishu",
    "Trans Nzoia", "West Pokot", "Turkana", "Samburu", "Isiolo",
    "Marsabit", "Mandera", "Tana River", "Lamu", "Taita Taveta",
    "Kwale", "Nyandarua", "Laikipia", "Kirinyaga", "Murang'a"
].sort();

const MAX_PHOTOS = 8;

const initialState = {
    message: '',
};

// Helper: parse imageUrl which may be a JSON array or a plain string
function parseImageUrls(imageUrl?: string | null): string[] {
    if (!imageUrl) return [];
    try {
        const parsed = JSON.parse(imageUrl);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
        // plain string
    }
    return imageUrl ? [imageUrl] : [];
}

export default function ListingForm({ listing, action }: { listing?: any, action: any }) {
    const [state, formAction] = useFormState(action, initialState);

    // Support both single URL (string) and multi-URL (JSON array string)
    const [imageUrls, setImageUrls] = useState<string[]>(
        parseImageUrls(listing?.imageUrl)
    );
    const [uploadingCount, setUploadingCount] = useState(0);

    const isUploading = uploadingCount > 0;

    const categories = [
        "Vehicles", "Electronics", "Laptops",
        "IT & Tech", "Real Estate",
        "Jobs", "Services", "Trade", "Dating",
        "Phones", "Construction", "Furniture", "Photography", "Transportation"
    ];

    const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const slotsLeft = MAX_PHOTOS - imageUrls.length;
        const filesToUpload = files.slice(0, slotsLeft);

        if (filesToUpload.length === 0) {
            alert(`You can only upload up to ${MAX_PHOTOS} photos.`);
            return;
        }

        setUploadingCount(prev => prev + filesToUpload.length);

        const uploadPromises = filesToUpload.map(async (file) => {
            try {
                const newBlob = await upload(file.name, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                });
                return newBlob.url;
            } catch (error) {
                console.error('Upload failed for', file.name, error);
                return null;
            } finally {
                setUploadingCount(prev => prev - 1);
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUrls = results.filter(Boolean) as string[];

        setImageUrls(prev => [...prev, ...successfulUrls]);

        // Reset the input so the same file can be re-selected if needed
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    // The value stored: JSON array if multiple, plain string if single (for backwards compatibility)
    const imageUrlValue = imageUrls.length === 0
        ? ''
        : imageUrls.length === 1
            ? imageUrls[0]
            : JSON.stringify(imageUrls);

    const canAddMore = imageUrls.length < MAX_PHOTOS;

    return (
        <form action={formAction} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">

            {/* Display Server Errors if any */}
            {state?.message && (
                <div className="p-4 mb-4 text-sm text-red-200 bg-red-900/20 border border-red-500/50 rounded-xl">
                    {state.message}
                </div>
            )}

            {/* Hidden Input for URL(s) */}
            <input type="hidden" name="imageUrl" value={imageUrlValue} />

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

            {/* Location Input with Search & Suggestions */}
            <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">Location</label>
                <div className="relative">
                    <input
                        name="location"
                        defaultValue={listing?.location}
                        list="kenya-locations"
                        placeholder="Type city (e.g. Nairobi) or custom area..."
                        className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-600"
                        required
                    />
                    <datalist id="kenya-locations">
                        {KENYAN_LOCATIONS.map((loc) => (
                            <option key={loc} value={loc} />
                        ))}
                    </datalist>
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">Description</label>
                <textarea name="description" defaultValue={listing?.description} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl h-32 outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>

            {/* ─── Multi-Photo Upload ─── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm text-slate-400 font-medium">
                        Photos
                        <span className="ml-2 text-xs text-slate-500">({imageUrls.length}/{MAX_PHOTOS})</span>
                    </label>
                    {imageUrls.length > 0 && (
                        <span className="text-xs text-slate-500">First photo will be the cover image</span>
                    )}
                </div>

                {/* Photo Grid */}
                {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {imageUrls.map((url, index) => (
                            <div key={url} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10">
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                        Cover
                                    </div>
                                )}
                                <Image
                                    src={url}
                                    alt={`Photo ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    unoptimized
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                                        title="Remove photo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Uploading placeholder tiles */}
                        {Array.from({ length: uploadingCount }).map((_, i) => (
                            <div key={`uploading-${i}`} className="aspect-square rounded-2xl border border-purple-500/30 bg-slate-900/80 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Add More Photos Button */}
                {canAddMore && (
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={isUploading}
                        />
                        <div className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 p-8 transition-colors
                            ${isUploading
                                ? 'border-purple-500/30 bg-slate-900/30'
                                : 'border-white/10 bg-slate-900/50 group-hover:border-purple-500/50'
                            }`}>
                            {isUploading
                                ? <Loader2 className="animate-spin text-purple-500 h-8 w-8" />
                                : imageUrls.length === 0
                                    ? <Upload className="text-slate-500 h-8 w-8" />
                                    : <ImagePlus className="text-slate-500 h-8 w-8" />
                            }
                            <span className="text-sm text-slate-300 font-medium">
                                {isUploading
                                    ? `Uploading ${uploadingCount} photo${uploadingCount > 1 ? 's' : ''}...`
                                    : imageUrls.length === 0
                                        ? 'Click or drag to upload photos'
                                        : `Add more photos (${MAX_PHOTOS - imageUrls.length} slots left)`
                                }
                            </span>
                            <span className="text-xs text-slate-600">
                                You can select multiple files at once • Max {MAX_PHOTOS} photos
                            </span>
                        </div>
                    </div>
                )}

                {!canAddMore && (
                    <p className="text-xs text-center text-slate-500">
                        Maximum of {MAX_PHOTOS} photos reached. Remove a photo to add a different one.
                    </p>
                )}
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 disabled:opacity-50">
                {isUploading ? 'Please wait for uploads to finish...' : (listing ? 'Save Changes' : 'Post Listing')}
            </button>
        </form>
    );
}