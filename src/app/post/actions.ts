'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { message: "You must be logged in to post an ad." };
    }

    const imageFile = formData.get('image') as File;
    if (!imageFile || imageFile.size === 0) {
        return { message: "Please select an image to upload." };
    }

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;
    let blobUrl = "";

    try {
        // 1. Upload Image
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
        });
        blobUrl = blob.url;

        // 2. User Sync
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

        // 3. Insert Listing (Using Math.round to ensure price is a clean number)
        const rawPrice = formData.get("price");
        const cleanPrice = Math.round(Number(rawPrice) || 0);

        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: cleanPrice,
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: blobUrl,
            userId: finalUserId,
            isApproved: true,
            isActive: true,
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error) {
        // Check Vercel Logs or Terminal for the actual error
        console.error("FULL_DATABASE_ERROR:", error);
        return { message: "Database Error. Check if all fields are filled correctly." };
    }

    // Redirect MUST be outside the try/catch block
    redirect("/");
}