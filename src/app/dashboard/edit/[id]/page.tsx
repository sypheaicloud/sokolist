import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ListingForm from '@/components/ListingForm';
import { updateListing } from '@/app/post/actions';
import Link from 'next/link'; // 👈 I missed this earlier!

// ✅ NEXT.JS 15 FIX: Type 'params' as a Promise
export default async function EditListingPage(props: { params: Promise<{ id: string }> }) {

    // ✅ NEXT.JS 15 FIX: Await params
    const params = await props.params;
    const session = await auth();

    if (!session) redirect('/login');

    // 1. Fetch listing safely using db.select
    const result = await db.select().from(listings).where(eq(listings.id, params.id));
    const listing = result[0];

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

    // 3. Bind the ID so the update action knows WHICH listing to save
    const updateActionWithId = updateListing.bind(null, listing.id);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="mx-auto max-w-2xl">
                <Link href="/dashboard" className="text-slate-400 hover:text-white mb-8 inline-flex items-center gap-2 text-sm transition-colors">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mb-8 text-white">Edit Your Ad</h1>

                {/* 4. Render the Form with existing data */}
                <ListingForm
                    listing={listing}
                    action={updateActionWithId}
                />
            </div>
        </div>
    );
}