'use server';

import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markAsSold(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 1. Update the listing to inactive
    // We use `and` to ensure only the OWNER can mark it as sold
    const result = await db.update(listings)
        .set({ isActive: false })
        .where(
            and(
                eq(listings.id, listingId),
                eq(listings.userId, session.user.id)
            )
        );

    // 2. Refresh the page so the badge appears instantly
    revalidatePath(`/listing/${listingId}`);
    revalidatePath("/"); // Also refresh homepage so it disappears from search
}