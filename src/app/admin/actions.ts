'use server';

import { db } from '@/lib/db';
import { users, listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

export async function banUser(userId: string) {
    await requireAdmin();

    await db.update(users)
        .set({ isBanned: true, bannedAt: new Date() })
        .where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function unbanUser(userId: string) {
    await requireAdmin();

    await db.update(users)
        .set({ isBanned: false, bannedAt: null })
        .where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteUser(userId: string) {
    await requireAdmin();

    // Delete user's listings first
    await db.delete(listings).where(eq(listings.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function verifyUser(userId: string) {
    await requireAdmin();

    await db.update(users)
        .set({ isVerified: true })
        .where(eq(users.id, userId));

    revalidatePath('/admin');
    return { success: true };
}

export async function deactivateListing(listingId: string) {
    await requireAdmin();

    await db.update(listings)
        .set({ isActive: false })
        .where(eq(listings.id, listingId));

    revalidatePath('/admin');
    return { success: true };
}

export async function activateListing(listingId: string) {
    await requireAdmin();

    await db.update(listings)
        .set({ isActive: true })
        .where(eq(listings.id, listingId));

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteListing(listingId: string) {
    await requireAdmin();

    await db.delete(listings).where(eq(listings.id, listingId));

    revalidatePath('/admin');
    return { success: true };
}
