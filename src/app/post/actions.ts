'use server';

import { db } from '@/lib/db';
// ✅ UPDATED IMPORTS: Removed 'accounts', added 'messages' and 'conversations'
import { listings, users, conversations, messages } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq, or, and } from 'drizzle-orm';
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
        // 🔍 SMART USER SYNC v5 (Schema-Accurate Cleanup)
        const existingUser = await db.select().from(users).where(eq(users.email, session.user.email));

        if (existingUser.length > 0) {
            if (existingUser[0].id !== session.user.id) {
                console.log("⚠️ ID Mismatch. Performing Deep Clean...");
                const oldUserId = existingUser[0].id;

                // --- STEP 1: DELETE CONVERSATIONS ---
                // We must delete conversations FIRST because they point to both Users and Listings.
                // If we don't delete these, we can't delete the Listings OR the User.
                try {
                    await db.delete(conversations).where(
                        or(
                            eq(conversations.buyerId, oldUserId),
                            eq(conversations.sellerId, oldUserId)
                        )
                    );
                } catch (err) {
                    console.log("Error cleaning conversations:", err);
                }

                // --- STEP 2: DELETE MESSAGES (Just in case) ---
                // (Usually cascading from conversation, but good to be safe if 'senderId' locks user)
                try {
                    await db.delete(messages).where(eq(messages.senderId, oldUserId));
                } catch (err) {
                    console.log("Error cleaning messages:", err);
                }

                // --- STEP 3: DELETE LISTINGS ---
                // Now safe to delete because no conversations point to them anymore.
                await db.delete(listings).where(eq(listings.userId, oldUserId));

                // --- STEP 4: DELETE USER ---
                // Finally, delete the root user record.
                await db.delete(users).where(eq(users.id, oldUserId));

                // --- STEP 5: RE-CREATE USER ---
                // Create the new, correct user record matching the session.
                await db.insert(users).values({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name || "User",
                    isVerified: false,
                    createdAt: new Date(),
                });
            }
        } else {
            // User doesn't exist, create fresh
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false,
                createdAt: new Date(),
            });
        }

        // --- CREATE THE LISTING ---
        const newListingId = randomUUID();

        await db.insert(listings).values({
            id: newListingId,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
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
        return { message: `DB Error: ${error.message}` };
    }

    redirect("/");
}

// ... Keep your other functions (deleteListing, markAsSold) exactly as they were
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