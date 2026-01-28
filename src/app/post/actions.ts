'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm'; // Added 'and' for secure filtering
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

export async function createListing(prevState: any, formData: FormData) {
    console.log("--- DIAGNOSTIC START ---");
    console.log("1. BLOB_TOKEN exists in env:", !!process.env.BLOB_READ_WRITE_TOKEN);

    const session = await auth();

    if (!session?.user?.id) {
        console.log("2. Session Error: No User ID");
        return { message: "You must be logged in to post an ad." };
    }

    const imageFile = formData.get('image') as File;
    console.log("3. File details:", {
        name: imageFile?.name,
        size: imageFile?.size,
        type: imageFile?.type
    });

    if (!imageFile || imageFile.size === 0) {
        return { message: "Please select an image to upload." };
    }

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;

    try {
        console.log("4. Attempting Vercel Blob put...");
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
            addRandomSuffix: true,
        });
        console.log("5. Blob upload success. URL:", blob.url);

        console.log("6. Syncing user with DB...");
        const userExists = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);
        let finalUserId = sessionUserId;

        if (userExists.length === 0 && userEmail) {
            const userByEmail = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
            if (userByEmail.length > 0) {
                finalUserId = userByEmail[0].id;
            } else {
                await db.insert(users).values({
                    id: sessionUserId,
                    email: userEmail,
                    name: session.user.name || "User",
                });
            }
        }

        console.log("7. Inserting listing into database...");
        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: blob.url,
            userId: finalUserId,
            isApproved: true,
            isActive: true,
        });

        console.log("8. DB Success. Revalidating paths...");
        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error: any) {
        console.error("--- CRITICAL ERROR ---");
        console.error("Error Message:", error.message);

        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return { message: `Error: ${error.message || "Could not save listing."}` };
    }

    console.log("9. Redirecting to home...");
    redirect("/");
}

// --- DASHBOARD ACTIONS ---

/**
 * Permanently deletes a listing. 
 * Only works if the logged-in user is the owner.
 */
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

/**
 * Marks a listing as inactive (Sold).
 * The listing remains in the DB but can be filtered out of the home page.
 */
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