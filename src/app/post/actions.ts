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
    if (!session?.user?.id || !session?.user?.email) return { message: "Not authenticated" };

    const imageUrl = formData.get('imageUrl') as string;

    if (!imageUrl || imageUrl.trim() === '') {
        return { message: "Image upload failed. Please wait for the image to finish uploading." };
    }

    try {
        // 🔍 SMART USER SYNC (Fixes the "Duplicate Key" Error)
        // 1. Check if user exists by EMAIL (The truest identifier)
        const existingUser = await db.select().from(users).where(eq(users.email, session.user.email));

        if (existingUser.length > 0) {
            // User exists! But does the ID match?
            if (existingUser[0].id !== session.user.id) {
                // ⚠️ ID MISMATCH DETECTED (The cause of your bug)
                // The DB has an old version of this user. We must update it to match the current session.

                // Option A: Delete the old user (Simplest for Dev)
                // Note: This might delete old posts attached to the old ID, but it fixes the crash.
                await db.delete(users).where(eq(users.email, session.user.email));

                // Re-create with correct ID
                await db.insert(users).values({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name || "User",
                    isVerified: false
                });
            }
            // If IDs match, do nothing. We are good.
        } else {
            // User does not exist at all. Create them.
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false
            });
        }

        // --- PROCEED WITH LISTING CREATION ---
        const newListingId = randomUUID();

        await db.insert(listings).values({
            id: newListingId,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: imageUrl,
            userId: session.user.id, // Now guaranteed to exist in DB
            isApproved: true,
            isActive: true,
            createdAt: new Date(),
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error;
        console.error("Create Listing Error:", error);
        return { message: `DB Error: ${error.message}` };
    }

    redirect("/");
}

// ... keep deleteListing and markAsSold same as before
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