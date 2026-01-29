import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import ListingForm from '@/components/ListingForm';

export default async function PostAdPage() {
    // 1. Get the session
    const session = await auth();

    // 2. Security Check
    if (!session?.user?.id) {
        redirect('/login');
    }

    // 3. The Server Action to Create the Listing
    async function createListing(formData: FormData) {
        'use server';

        const title = formData.get('title') as string;
        const price = parseInt(formData.get('price') as string);
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const location = formData.get('location') as string;

        // This receives the small URL string from our Client Component
        const imageUrl = formData.get('imageUrl') as string;

        // 4. INSERT INTO DATABASE with the correct User ID
        await db.insert(listings).values({
            title,
            price,
            description,
            category,
            location,
            imageUrl,
            userId: session.user.id, // <--- This fixes the "Ghost Ad" issue
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // 5. Refresh Data
        revalidatePath('/dashboard');
        revalidatePath('/');

        // 6. Redirect to Dashboard
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold mb-8 text-white">Post a New Ad</h1>
                <p className="text-slate-400 mb-8">Reach thousands of buyers across Kenya.</p>

                {/* Reuse the robust form we built for Editing */}
                <ListingForm action={createListing} />
            </div>
        </div>
    );
}