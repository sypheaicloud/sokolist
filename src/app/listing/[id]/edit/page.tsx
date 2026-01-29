import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ListingForm from '@/components/ListingForm'; // Reuse the form we fixed!
import { updateListing } from '@/app/post/actions';

// Next.js 15: params is a Promise
export default async function EditListingPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params; // Await the params
    const session = await auth();

    if (!session) redirect('/api/auth/signin');

    // 1. Fetch the listing data
    const listing = await db.query.listings.findFirst({
        where: eq(listings.id, params.id),
    });

    // 2. Security Checks
    if (!listing) return notFound();

    if (listing.userId !== session.user.id) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="text-red-400 bg-red-900/20 border border-red-900 p-6 rounded-xl">
                    You are not authorized to edit this post.
                </div>
            </div>
        );
    }

    // 3. Create the Update Action (Bind the ID)
    const updateActionWithId = updateListing.bind(null, listing.id);

    // 4. Render the Reuseable Form
    // Since we pass 'listing={listing}', the form will pre-fill all the fields!
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold mb-8 text-white">Edit Your Ad</h1>
                <ListingForm
                    listing={listing}
                    action={updateActionWithId}
                />
            </div>
        </div>
    );
}