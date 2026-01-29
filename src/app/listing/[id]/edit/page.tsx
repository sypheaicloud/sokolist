import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import Image from 'next/image';
import { put } from '@vercel/blob';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    const listing = result[0];

    if (!listing) notFound();
    if (listing.userId !== session?.user?.id) redirect(`/listing/${id}`);

    async function updateAction(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        const price = parseInt(formData.get('price') as string);
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const location = formData.get('location') as string;
        const imageFile = formData.get('imageFile') as File;

        let imageUrl = listing.imageUrl;

        // Direct file upload to Vercel Blob
        if (imageFile && imageFile.size > 0) {
            const blob = await put(imageFile.name, imageFile, {
                access: 'public',
            });
            imageUrl = blob.url;
        }

        await db.update(listings)
            .set({
                title,
                price,
                description,
                category,
                location,
                imageUrl,
                updatedAt: new Date()
            })
            .where(eq(listings.id, id));

        revalidatePath(`/listing/${id}`);
        revalidatePath('/dashboard');
        redirect('/dashboard');
    }

    // Your specific updated category list
    const categories = [
        "Vehicles",
        "Electronics",
        "Laptops",
        "IT (Network, Cloud, Devops, AI)",
        "Real Estate",
        "Jobs",
        "Services",
        "Trade",
        "Dating",
        "Phones",
        "Construction"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="mx-auto max-w-2xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 mb-8 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8">Edit Your Ad</h1>

                <form action={updateAction} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">

                    {/* Title */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Title</label>
                        <input name="title" defaultValue={listing.title} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Price */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-medium">Price (KSh)</label>
                            <input name="price" type="number" defaultValue={listing.price} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                        </div>
                        {/* Updated Categories */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-medium">Category</label>
                            <select name="category" defaultValue={listing.category || ''} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Location (Town/City)</label>
                        <input name="location" defaultValue={listing.location || ''} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Description</label>
                        <textarea name="description" defaultValue={listing.description} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl h-40 focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>

                    {/* Image Section */}
                    <div className="space-y-4">
                        <label className="block text-sm text-slate-400 font-medium">Listing Image</label>

                        {listing.imageUrl && (
                            <div className="relative h-40 w-40 rounded-2xl overflow-hidden border border-white/10">
                                <Image src={listing.imageUrl} alt="Current" fill className="object-cover" unoptimized />
                            </div>
                        )}

                        <div className="relative group">
                            <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full border-2 border-dashed border-white/10 bg-slate-900/50 p-8 rounded-2xl flex flex-col items-center gap-2 group-hover:border-purple-500/50 transition-colors">
                                <Upload className="h-8 w-8 text-slate-500" />
                                <span className="text-sm text-slate-300 font-medium">Replace Image</span>
                                <span className="text-xs text-slate-500">Tap to browse your files</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}