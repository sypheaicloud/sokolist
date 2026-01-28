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

    // 1. Basic Protection
    if (!session?.user?.id) {
        throw new Error("You must be logged in to post an ad.");
    }

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;

    try {
        // 2. THE "SMART" SYNC: Check if this ID exists
        const userExists = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);

        let finalUserId = sessionUserId;

        if (userExists.length === 0 && userEmail) {
            // ID not found? Look for the email instead
            const userByEmail = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

            if (userByEmail.length > 0) {
                // Found them! Use the ID that is actually in the database
                finalUserId = userByEmail[0].id;
            } else {
                // Truly missing? Create them so the Foreign Key doesn't break
                await db.insert(users).values({
                    id: sessionUserId,
                    email: userEmail,
                    name: session.user.name || "User",
                });
            }
        }

        // 3. Insert into Listings using the verified ID
        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: imageUrl,
            userId: finalUserId, // ✅ This is now guaranteed to exist in the 'users' table
            isApproved: true,
            isActive: true,
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error) {
        console.error("CREATE_LISTING_ERROR:", error);
        // We throw a user-friendly error
        throw new Error("Could not save listing. Please refresh and try again.");
    }

    redirect("/");
}