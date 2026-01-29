import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import Image from 'next/image';

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
        const imageUrl = formData.get('imageUrl') as string; // Ensure your upload logic provides this

        await db.update(listings)
            .set({
                title,
                price,
                description,
                category,
                location,
                imageUrl: imageUrl || listing.imageUrl, // Keep old image if new one isn't provided
                updatedAt: new Date()
            })
            .where(eq(listings.id, id));

        revalidatePath(`/listing/${id}`);
        revalidatePath('/dashboard');
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="mx-auto max-w-2xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 mb-8 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8">Edit Your Ad</h1>

                <form action={updateAction} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                    {/* Title */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Title</label>
                        <input name="title" defaultValue={listing.title} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-medium">Price (KSh)</label>
                            <input name="price" type="number" defaultValue={listing.price} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                        </div>
                        {/* Category */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-medium">Category</label>
                            <select name="category" defaultValue={listing.category || ''} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none">
                                <option value="Vehicles">Vehicles</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Property">Property</option>
                                <option value="Services">Services</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Location</label>
                        <input name="location" defaultValue={listing.location || ''} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Description</label>
                        <textarea name="description" defaultValue={listing.description} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl h-40 focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>

                    {/* Image Preview & Re-upload */}
                    <div className="space-y-4">
                        <label className="block text-sm text-slate-400 font-medium">Listing Image</label>
                        <div className="flex items-center gap-6">
                            {listing.imageUrl && (
                                <div className="h-24 w-24 relative rounded-xl overflow-hidden border border-white/10">
                                    <Image src={listing.imageUrl} alt="Current" fill className="object-cover" unoptimized />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-2">Change Image (Paste new URL or use your upload component)</p>
                                <input
                                    name="imageUrl"
                                    placeholder="New image URL..."
                                    className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 mt-4">
                        Update Listing
                    </button>
                </form>
            </div>
        </div>
    );
}