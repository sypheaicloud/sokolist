'use server';

import { db } from '@/lib/db';
// 👇 ADD 'accounts' TO YOUR IMPORTS
import { listings, users, accounts } from '@/lib/schema';
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
        // 🔍 SMART USER SYNC v3 (The Complete Cleanup)
        const existingUser = await db.select().from(users).where(eq(users.email, session.user.email));

        if (existingUser.length > 0) {
            if (existingUser[0].id !== session.user.id) {
                console.log("⚠️ ID Mismatch. Performing Deep Clean...");
                const oldUserId = existingUser[0].id;

                // 1. Delete LISTINGS (Content)
                await db.delete(listings).where(eq(listings.userId, oldUserId));

                // 2. Delete ACCOUNTS (Auth Connections - The likely cause of your crash!)
                // Use a try/catch here just in case 'accounts' table name varies
                try {
                    await db.delete(accounts).where(eq(accounts.userId, oldUserId));
                } catch (err) {
                    console.log("No accounts table linked or different name, skipping...");
                }

                // 3. Delete USER (The root record)
                await db.delete(users).where(eq(users.id, oldUserId));

                // 4. Create NEW USER (Fresh start)
                await db.insert(users).values({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name || "User",
                    isVerified: false
                });
            }
        } else {
            // User doesn't exist, create fresh
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false
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

// ... keep deleteListing and markAsSold same as before ...
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