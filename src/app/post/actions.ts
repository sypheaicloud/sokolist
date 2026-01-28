'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

// IMPORTANT: prevState MUST be the first argument
export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();

    // 1. Session Protection
    if (!session?.user?.id) {
        return { message: "You must be logged in to post an ad." };
    }

    // 2. Image Validation & Upload
    const imageFile = formData.get('image') as File;
    if (!imageFile || imageFile.size === 0) {
        return { message: "Please select an image to upload." };
    }

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;

    try {
        // Upload to Vercel Blob using your existing token
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
        });

        // 3. User Sync Logic
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

        // 4. Save the Listing to DB
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

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error) {
        console.error("CREATE_LISTING_ERROR:", error);
        return { message: "Could not save listing. Check your database connection." };
    }

    // Redirect after successful creation
    redirect("/");
}