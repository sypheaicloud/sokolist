'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Fetch only the logged-in user's listings
export async function getUserListings() {
    const session = await auth();
    if (!session?.user) return [];

    const userListings = await db
        .select()
        .from(listings)
        .where(eq(listings.userId, session.user.id))
        .orderBy(desc(listings.createdAt));

    return userListings;
}

// Delete a listing (Secured: checks ownership)
export async function deleteMyListing(formData: FormData) {
    const session = await auth();
    if (!session?.user) return;

    const listingId = formData.get('id') as string;

    // Verify ownership before deleting
    const [listing] = await db
        .select()
        .from(listings)
        .where(and(eq(listings.id, listingId), eq(listings.userId, session.user.id)));

    if (listing) {
        await db.delete(listings).where(eq(listings.id, listingId));
        revalidatePath('/profile');
        revalidatePath('/'); // Refresh home page too
    }
}