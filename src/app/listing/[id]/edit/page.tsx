import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    // 1. Fetch the data
    const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    const listing = result[0];

    // 2. Security: If not found or not the owner, kick them out
    if (!listing) notFound();
    if (listing.userId !== session?.user?.id) redirect(`/listing/${id}`);

    // 3. The Save Action
    async function updateAction(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        const price = parseInt(formData.get('price') as string);
        const description = formData.get('description') as string;

        await db.update(listings)
            .set({ title, price, description })
            .where(eq(listings.id, id));

        revalidatePath(`/listing/${id}`);
        redirect(`/listing/${id}`);
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="mx-auto max-w-2xl">
                <Link href={`/listing/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 mb-8">
                    <ArrowLeft className="h-4 w-4" /> Cancel and go back
                </Link>

                <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>

                <form action={updateAction} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Title</label>
                        <input name="title" defaultValue={listing.title} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Price (KSh)</label>
                        <input name="price" type="number" defaultValue={listing.price} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Description</label>
                        <textarea name="description" defaultValue={listing.description} className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl h-40" />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 transition-colors">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}