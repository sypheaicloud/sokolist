'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob'; // Ensure you run: npm install @vercel/blob

export async function createListing(formData: FormData) {
    const session = await auth();

    // 1. Basic Protection
    if (!session?.user?.id) {
        throw new Error("You must be logged in to post an ad.");
    }

    // Get the file from formData
    const imageFile = formData.get('image') as File;
    if (!imageFile || imageFile.size === 0) {
        throw new Error("Please select an image to upload.");
    }

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;

    try {
        // 2. Upload to Vercel Blob
        // This uses your BLOB_READ_WRITE_TOKEN automatically
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
        });

        // 3. THE "SMART" SYNC: Check if this ID exists in the DB
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

        // 4. Insert into Listings using the Vercel Blob URL
        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: blob.url, // ✅ This is the new Vercel Blob URL
            userId: finalUserId,
            isApproved: true,
            isActive: true,
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error) {
        console.error("CREATE_LISTING_ERROR:", error);
        throw new Error("Could not save listing. Please try again.");
    }

    redirect("/");
}