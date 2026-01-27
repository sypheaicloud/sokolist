'use server';

import { db } from '@/lib/db';
import { users, listings } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

// --- FETCH DATA FOR DASHBOARD ---

export async function getAdminData() {
    await requireAdmin();

    // 1. Fetch Listings with User Info
    // We join with the users table to display the seller's email
    const allListings = await db
        .select({
            id: listings.id,
            title: listings.title,
            price: listings.price,
            createdAt: listings.createdAt,
            isActive: listings.isActive,
            // We explicitly map the user info structure for the UI
            user: {
                email: users.email
            }
        })
        .from(listings)
        .leftJoin(users, eq(listings.userId, users.id))
        .orderBy(desc(listings.createdAt));

    // 2. Fetch Users
    const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

    // 3. Transform for UI (Handle the count manually or separate query)
    // For MVP, we pass simple arrays. The UI will just show the array length if we don't do complex SQL counts.

    return {
        listings: allListings.map(l => ({
            ...l,
            // Map Drizzle's boolean isActive to the string status the UI expects ('ACTIVE' or 'HOLD')
            status: l.isActive ? 'ACTIVE' : 'HOLD'
        })),
        users: allUsers
    };
}

// --- ACTIONS (Connected to Forms) ---

export async function banUser(formData: FormData) {
    await requireAdmin();
    const userId = formData.get('id') as string;

    if (!userId) return;

    // This handles both Ban and Unban logic depending on current state if you wanted,
    // but here we forcefully BAN as per the function name.
    await db.update(users)
        .set({ isBanned: true, bannedAt: new Date() })
        .where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteUser(formData: FormData) {
    await requireAdmin();
    const userId = formData.get('id') as string;

    if (!userId) return;

    // Delete user's listings first to maintain referential integrity
    await db.delete(listings).where(eq(listings.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function toggleListingStatus(formData: FormData) {
    await requireAdmin();
    const listingId = formData.get('id') as string;
    const currentStatus = formData.get('currentStatus') as string; // 'ACTIVE' or 'HOLD'

    if (!listingId) return;

    // If currently ACTIVE, we deactivate. If HOLD, we activate.
    const newIsActive = currentStatus !== 'ACTIVE';

    await db.update(listings)
        .set({ isActive: newIsActive })
        .where(eq(listings.id, listingId));

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteListing(formData: FormData) {
    await requireAdmin();
    const listingId = formData.get('id') as string;

    if (!listingId) return;

    await db.delete(listings).where(eq(listings.id, listingId));

    revalidatePath('/admin');
    return { success: true };
}