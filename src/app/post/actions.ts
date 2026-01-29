'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

// --- 1. CREATE LISTING ---
export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Not authenticated" };

    // 👇 CHANGED: We now look for the URL string, NOT the file object
    const imageUrl = formData.get('imageUrl') as string;

    // Validate the URL, not the file
    if (!imageUrl || imageUrl.trim() === '') {
        return { message: "Image upload failed. Please try again." };
    }

    try {
        const newListingId = randomUUID();

        // Ensure User Exists
        const userExists = await db.select().from(users).where(eq(users.id, session.user.id));
        if (userExists.length === 0) {
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false
            });
        }

        // Insert Listing
        await db.insert(listings).values({
            id: newListingId,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,

            // 👇 SAVE THE URL DIRECTLY
            imageUrl: imageUrl,

            userId: session.user.id,
            isApproved: true,
            isActive: true,
            createdAt: new Date(),
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error;
        console.error("Create Listing Error:", error);
        return { message: "Server Error: Could not save listing." };
    }

    redirect("/");
}

// --- 2. DELETE LISTING ---
export async function deleteListing(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(listings).where(
        and(
            eq(listings.id, listingId),
            eq(listings.userId, session.user.id)
        )
    );

    revalidatePath('/dashboard');
    revalidatePath('/');
}

// --- 3. MARK AS SOLD ---
export async function markAsSold(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.update(listings)
        .set({ isActive: false })
        .where(
            and(
                eq(listings.id, listingId),
                eq(listings.userId, session.user.id)
            )
        );

    revalidatePath('/dashboard');
    revalidatePath('/');
}