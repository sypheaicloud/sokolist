'use server';

import { db } from '@/lib/db';
import { conversations, messages, listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, desc, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const results = await db.select({
            id: conversations.id,
            listingId: conversations.listingId,
            listingTitle: listings.title,
            listingImage: listings.imageUrl,
            buyerName: users.name,
            updatedAt: conversations.updatedAt,
        })
            .from(conversations)
            .leftJoin(listings, eq(conversations.listingId, listings.id))
            .leftJoin(users, or(eq(users.id, conversations.sellerId), eq(users.id, conversations.buyerId)))
            .where(or(eq(conversations.buyerId, session.user.id), eq(conversations.sellerId, session.user.id)))
            .orderBy(desc(conversations.updatedAt));

        // FIX: Manually serialize the results to prevent "Digest" errors
        return JSON.parse(JSON.stringify(results));
    } catch (e) {
        console.error("Inbox fetch failed:", e);
        return [];
    }
}

export async function startSupportChat() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    // Find Josiah
    const admin = await db.query.users.findFirst({
        where: eq(users.email, 'djboziah@gmail.com'),
    });

    if (!admin) redirect('/?error=no_admin_found');
    if (session.user.id === admin.id) redirect('/messages');

    // Check for existing
    const existing = await db.query.conversations.findFirst({
        where: and(
            isNull(conversations.listingId),
            or(
                and(eq(conversations.buyerId, session.user.id), eq(conversations.sellerId, admin.id)),
                and(eq(conversations.buyerId, admin.id), eq(conversations.sellerId, session.user.id))
            )
        ),
    });

    const conversationId = existing ? existing.id : uuidv4();

    if (!existing) {
        await db.insert(conversations).values({
            id: conversationId,
            listingId: null,
            buyerId: session.user.id,
            sellerId: admin.id,
        });
    }

    // Always revalidate before redirect
    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}