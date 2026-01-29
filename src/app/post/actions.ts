'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Not authenticated" };

    // 🔍 THE FIX: Look for the URL string, NOT the File object
    // Your form sends <input name="imageUrl" ... />
    const imageUrl = formData.get('imageUrl') as string;

    // Check if the URL string exists
    if (!imageUrl || imageUrl.trim() === '') {
        return { message: "Image upload failed. Please wait for the image to finish uploading." };
    }

    try {
        const newListingId = randomUUID();

        // 1. Ensure User Exists in DB
        const userExists = await db.select().from(users).where(eq(users.id, session.user.id));
        if (userExists.length === 0) {
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false
            });
        }

        // 2. Insert Listing
        await db.insert(listings).values({
            id: newListingId,
            // We use formData.get() for text fields
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,

            // ✅ We save the URL we got from the client
            imageUrl: imageUrl,

            userId: session.user.id,
            isApproved: true,
            isActive: true,
            createdAt: new Date(),
        });

        // 3. Clear Cache
        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error: any) {
        // Allow the redirect to happen
        if (error.message === 'NEXT_REDIRECT') throw error;

        console.error("Create Listing Error:", error);
        return { message: "Server Error: Could not save listing." };
    }

    // 4. Success! Go to home page
    redirect("/");
}

// Keep your delete/sold functions below...
export async function deleteListing(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await db.delete(listings).where(and(eq(listings.id, listingId), eq(listings.userId, session.user.id)));
    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function markAsSold(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await db.update(listings).set({ isActive: false }).where(and(eq(listings.id, listingId), eq(listings.userId, session.user.id)));
    revalidatePath('/dashboard');
    revalidatePath('/');
}