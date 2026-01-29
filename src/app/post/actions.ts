'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema'; // Ensure this path matches your project
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto'; // ✅ THE FIX: Built-in ID generator

// --- 1. CREATE LISTING ---
export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Not authenticated" };

    // 1. Validate Image
    const imageFile = formData.get('image') as File;
    if (!imageFile || imageFile.size === 0) {
        return { message: "Please select an image to upload." };
    }

    try {
        // 2. Upload Image
        const blob = await put(imageFile.name, imageFile, { access: 'public', addRandomSuffix: true });

        // 3. Generate ID Manually (Fixes the "null id" error)
        const newListingId = randomUUID();

        // 4. Ensure User Exists in DB
        const userExists = await db.select().from(users).where(eq(users.id, session.user.id));
        if (userExists.length === 0) {
            await db.insert(users).values({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name || "User",
                isVerified: false
            });
        }

        // 5. Insert Listing
        await db.insert(listings).values({
            id: newListingId, // <--- The critical fix
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: blob.url,
            userId: session.user.id,
            isApproved: true,
            isActive: true,
            createdAt: new Date(),
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error: any) {
        // Allow redirect to happen
        if (error.message === 'NEXT_REDIRECT') throw error;
        console.error("Create Listing Error:", error);
        return { message: "Server Error: Could not create listing." };
    }

    redirect("/");
}

// --- 2. DELETE LISTING ---
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

// --- 3. MARK AS SOLD ---
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