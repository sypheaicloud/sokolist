import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

// ✅ CORRECT IMPORT: No curly braces means we are importing the Default Export
import ListingForm from '@/components/ListingForm';

export default async function PostAdPage() {
    // 1. Initial Page Load Security Check
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    // 2. The Server Action to Create the Listing
    async function createListing(formData: FormData) {
        'use server';

        // Double-check session inside the action for maximum security
        const currentSession = await auth();
        if (!currentSession?.user?.id) {
            redirect('/login');
        }

        const title = formData.get('title') as string;
        // ParseInt ensures the price is a number, fallback to 0 if empty
        const price = parseInt(formData.get('price') as string) || 0;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const location = formData.get('location') as string;

        // This receives the small URL string from our Client Component
        const imageUrl = formData.get('imageUrl') as string;

        // 3. INSERT INTO DATABASE
        await db.insert(listings).values({
            title,
            price,
            description,
            category,
            location,
            imageUrl,
            userId: currentSession.user.id, // <--- Guarantees the ad belongs to "Bonface"
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // 4. Refresh Data
        revalidatePath('/dashboard');
        revalidatePath('/');

        // 5. Redirect to Dashboard
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