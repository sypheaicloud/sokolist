import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import ListingForm from '@/components/ListingForm'; // We'll move your form here

export default async function EditListingPage({ params }: { params: any }) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) redirect('/login');

    // 1. Fetch the existing listing
    const data = await db.select()
        .from(listings)
        .where(
            and(
                eq(listings.id, id),
                eq(listings.sellerId, session.user.id) // Only the owner can edit
            )
        )
        .limit(1);

    const listing = data[0];

    // 2. If it doesn't exist or isn't yours, 404
    if (!listing) return notFound();

    return (
        <div className="pt-32 pb-12 px-4 bg-slate-950 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-8">Edit Your Ad</h1>
                {/* 3. Pass the data to the form component */}
                <ListingForm initialData={listing} isEditing={true} />
            </div>
        </div>
    );
}