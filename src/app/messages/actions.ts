'use server';

import { db } from '@/lib/db';
import { conversations, messages, listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, desc, isNull, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- DASHBOARD ACTIONS ---

export async function deleteListing(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(listings).where(
        and(
            eq(listings.id, listingId),
            eq(listings.userId, session.user.id) // Corrected from sellerId
        )
    );

    revalidatePath('/dashboard');
}

export async function toggleSoldStatus(listingId: string, currentTitle: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const isSold = currentTitle.startsWith('[SOLD]');
    const newTitle = isSold ? currentTitle.replace('[SOLD] ', '') : `[SOLD] ${currentTitle}`;

    await db.update(listings)
        .set({ title: newTitle })
        .where(
            and(
                eq(listings.id, listingId),
                eq(listings.userId, session.user.id) // Corrected from sellerId
            )
        );

    revalidatePath('/dashboard');
}

// --- SUPPORT & MESSAGING ---

export async function startSupportChat() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    // Safe User Sync to prevent Duplicate Key error
    let finalUserId = sessionUserId;
    try {
        const existing = await db.select().from(users).where(eq(users.email, userEmail!)).limit(1);
        if (existing.length > 0) {
            finalUserId = existing[0].id;
        } else {
            await db.insert(users).values({ id: sessionUserId, email: userEmail!, name: userName || 'User' });
        }
    } catch (e) { console.error("Sync Error:", e); }

    const adminResults = await db.select().from(users).where(eq(users.email, 'djboziah@gmail.com')).limit(1);
    const admin = adminResults[0];

    if (!admin) redirect('/?error=support_unavailable');
    if (finalUserId === admin.id) redirect('/messages');

    // Check for existing support chat (listingId is null)
    const existingChat = await db.select().from(conversations).where(
        and(
            isNull(conversations.listingId),
            or(
                and(eq(conversations.buyerId, finalUserId), eq(conversations.sellerId, admin.id)),
                and(eq(conversations.buyerId, admin.id), eq(conversations.sellerId, finalUserId))
            )
        )
    ).limit(1);

    if (existingChat[0]) redirect(`/messages/${existingChat[0].id}`);

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId: null,
        buyerId: finalUserId,
        sellerId: admin.id,
    });

    await db.insert(messages).values([
        { id: uuidv4(), conversationId, senderId: admin.id, content: `Jambo ${userName || 'User'}! Support is here.` },
        { id: uuidv4(), conversationId, senderId: admin.id, content: `Josiah will respond within 24 hours.` }
    ]);

    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}