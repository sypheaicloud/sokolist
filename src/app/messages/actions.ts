'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

// --- POST AD ACTION ---
export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Unauthorized" };

    const imageFile = formData.get('image') as File;
    if (!imageFile || imageFile.size === 0) return { message: "Image required" };

    try {
        // 1. Upload to Vercel Blob
        const blob = await put(imageFile.name, imageFile, { access: 'public' });

        // 2. Database Insert
        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: blob.url,
            userId: session.user.id,
        });

        revalidatePath("/");
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("CREATE_LISTING_ERROR:", error);
        return { message: "Database Error: Could not save listing." };
    }

    // REDIRECT MUST BE OUTSIDE THE TRY/CATCH
    redirect("/");
}

// --- SUPPORT CHAT ACTION (Renamed to match your UI import) ---
export async function startConversation() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const adminResults = await db.select().from(users).where(eq(users.email, 'djboziah@gmail.com')).limit(1);
    const admin = adminResults[0];

    if (!admin) redirect('/?error=support_unavailable');

    // ... (Your existing support chat logic here)

    revalidatePath('/messages');
    redirect(`/messages/some-id`); // Adjust as per your logic
}