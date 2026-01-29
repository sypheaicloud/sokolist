'use server';

import { db } from '@/lib/db';
// ✅ Imports matching your schema
import { listings, users, conversations, messages } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq, or, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

// --- 1. CREATE LISTING (With Smart User Sync) ---
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

                try {
                    await db.delete(messages).where(eq(messages.senderId, oldUserId));
                } catch (err) {
                    console.log("Error cleaning messages:", err);
                }

                await db.delete(listings).where(eq(listings.userId, oldUserId));
                await db.delete(users).where(eq(users.id, oldUserId));

                await db.insert(users).values({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name || "User",
                    isVerified: false,
                    createdAt: new Date(),
                });
            }
        } else {
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false,
                createdAt: new Date(),
            });
        }

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

// --- 2. UPDATE LISTING (The Logic You Were Missing) ---
export async function updateListing(
    listingId: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Not authenticated" };

    // Get the Image URL (Either the new one uploaded, or the old one from hidden input)
    const imageUrl = formData.get('imageUrl') as string;

    if (!imageUrl || imageUrl.trim() === '') {
        return { message: "Image is missing." };
    }

    try {
        await db.update(listings)
            .set({
                // Update ALL fields, not just the image
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                price: Number(formData.get("price")),
                category: formData.get("category") as string,
                location: formData.get("location") as string,
                imageUrl: imageUrl,
            })
            .where(
                and(
                    eq(listings.id, listingId),
                    eq(listings.userId, session.user.id) // Ensure they own it
                )
            );

        revalidatePath("/");
        revalidatePath("/dashboard");
        revalidatePath(`/listings/${listingId}`);

    } catch (error: any) {
        console.error("Update Listing Error:", error);
        return { message: `Update Failed: ${error.message}` };
    }

    redirect("/dashboard");
}

// --- 3. DELETE & SOLD UTILITIES ---
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