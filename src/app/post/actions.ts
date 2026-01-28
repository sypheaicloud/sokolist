'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createListing(formData: FormData, imageUrl: string) {
    const session = await auth();

    // 1. Session Protection
    if (!session?.user?.id) {
        throw new Error("You must be logged in to post an ad.");
    }

    const sessionUserId = session.user.id;

    try {
        // 2. Foreign Key Check: Ensure user exists in the DB
        const userExists = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);

        if (userExists.length === 0) {
            // This handles the "Ghost User" error by preventing the insert
            throw new Error("User record missing in database. Please log out and back in.");
        }

        // 3. Insert into Listings
        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: imageUrl,
            userId: sessionUserId, // Matches schema.ts 'user_id'
            isApproved: true,
            isActive: true,
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error) {
        console.error("CREATE_LISTING_ERROR:", error);
        throw error;
    }

    redirect("/");
}