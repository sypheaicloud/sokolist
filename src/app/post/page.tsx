import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import ListingForm from '@/components/ListingForm';

export default async function PostAdPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    async function createListing(formData: FormData) {
        'use server';

        const currentSession = await auth();
        if (!currentSession?.user?.id) redirect('/login');

        const title = formData.get('title') as string;
        const price = parseInt(formData.get('price') as string) || 0;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const location = formData.get('location') as string;
        const imageUrl = formData.get('imageUrl') as string;

        // Save with Bonface's User ID
        await db.insert(listings).values({
            title, price, description, category, location, imageUrl,
            userId: currentSession.user.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath('/dashboard');
        revalidatePath('/');
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold mb-8 text-white">Post a New Ad</h1>
                <p className="text-slate-400 mb-8">Reach thousands of buyers across Kenya.</p>
                <ListingForm action={createListing} />
            </div>
        </div>
    );
}