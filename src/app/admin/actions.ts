'use server';

import { db } from '@/lib/db';
import { users, listings } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

// --- FETCH DATA FOR DASHBOARD ---

export async function getAdminData() {
    await requireAdmin();

    const allListings = await db
        .select({
            id: listings.id,
            title: listings.title,
            price: listings.price,
            createdAt: listings.createdAt,
            isActive: listings.isActive,
            user: {
                email: users.email
            }
        })
        .from(listings)
        .leftJoin(users, eq(listings.userId, users.id))
        .orderBy(desc(listings.createdAt));

    const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

    return {
        listings: allListings.map(l => ({
            ...l,
            status: l.isActive ? 'ACTIVE' : 'HOLD'
        })),
        users: allUsers
    };
}

// --- USER ACTIONS ---

export async function deleteUser(formData: FormData) {
    await requireAdmin();
    const userId = formData.get('id') as string;
    if (!userId) return;

    // Delete user's listings first
    await db.delete(listings).where(eq(listings.userId, userId));
    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function toggleUserBan(formData: FormData) {
    await requireAdmin();
    const userId = formData.get('id') as string;
    const currentStatus = formData.get('isBanned') === 'true'; // string "true" -> boolean true

    if (!userId) return;

    await db.update(users)
        .set({ isBanned: !currentStatus }) // Toggle the status
        .where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function toggleUserAdmin(formData: FormData) {
    await requireAdmin();
    const userId = formData.get('id') as string;
    const currentStatus = formData.get('isAdmin') === 'true';

    if (!userId) return;

    await db.update(users)
        .set({ isAdmin: !currentStatus }) // Toggle Admin status
        .where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

// --- LISTING ACTIONS ---

export async function toggleListingStatus(formData: FormData) {
    await requireAdmin();
    const listingId = formData.get('id') as string;
    const currentStatus = formData.get('currentStatus') as string;

    if (!listingId) return;

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