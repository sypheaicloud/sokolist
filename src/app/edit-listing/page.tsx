import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    // 1. Fetch the listing from your DB
    const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    const listing = result[0];

    // 2. Security Check
    if (!listing) notFound();
    if (listing.userId !== session?.user?.id) {
        redirect('/my-listings'); // Redirect if someone tries to edit a listing they don't own
    }

    // 3. Server Action to handle the update
    async function updateListing(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        const price = parseInt(formData.get('price') as string);
        const description = formData.get('description') as string;
        const location = formData.get('location') as string;

        await db.update(listings)
            .set({
                title,
                price,
                description,
                location,
                updatedAt: new Date()
            })
            .where(eq(listings.id, id));

        // Refresh the pages so the user sees the new data
        revalidatePath(`/listing/${id}`);
        revalidatePath('/my-listings');

        redirect('/my-listings');
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Edit Your Ad</h1>

                <form action={updateListing} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Item Title</label>
                        <input
                            name="title"
                            defaultValue={listing.title}
                            className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Price (KSh)</label>
                        <input
                            name="price"
                            type="number"
                            defaultValue={listing.price}
                            className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                        <input
                            name="location"
                            defaultValue={listing.location}
                            className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                        <textarea
                            name="description"
                            defaultValue={listing.description}
                            className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl h-40 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-bold transition-all">
                            Update Listing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}