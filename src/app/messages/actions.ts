'use server';

import { db } from '@/lib/db';
import { conversations, messages, listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, desc, isNull, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- DATA FETCHING ACTIONS (REQUIRED BY YOUR UI) ---

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
            .where(
                and(
                    or(eq(conversations.buyerId, session.user.id), eq(conversations.sellerId, session.user.id)),
                    ne(users.id, session.user.id)
                )
            )
            .orderBy(desc(conversations.updatedAt));

        return JSON.parse(JSON.stringify(results));
    } catch (e) {
        console.error("Inbox fetch failed:", e);
        return [];
    }
}

export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const results = await db.select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(messages.createdAt);

        return JSON.parse(JSON.stringify(results));
    } catch (e) {
        console.error("Messages fetch failed:", e);
        return [];
    }
}

// --- SUPPORT & CONVERSATION LOGIC ---

export async function startConversation() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    // Admin email check (Matches your djboziah email)
    const adminResults = await db.select().from(users).where(eq(users.email, 'djboziah@gmail.com')).limit(1);
    const admin = adminResults[0];

    if (!admin) redirect('/?error=support_unavailable');
    if (sessionUserId === admin.id) redirect('/messages');

    // Existing support chat check
    const existingChat = await db.select().from(conversations).where(
        and(
            isNull(conversations.listingId),
            or(
                and(eq(conversations.buyerId, sessionUserId), eq(conversations.sellerId, admin.id)),
                and(eq(conversations.buyerId, admin.id), eq(conversations.sellerId, sessionUserId))
            )
        )
    ).limit(1);

    if (existingChat[0]) redirect(`/messages/${existingChat[0].id}`);

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId: null,
        buyerId: sessionUserId,
        sellerId: admin.id,
    });

    await db.insert(messages).values([
        { id: uuidv4(), conversationId, senderId: admin.id, content: `Jambo ${userName || 'User'}! Support is here.` }
    ]);

    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}

// --- DASHBOARD ACTIONS ---

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
}

export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.insert(messages).values({
        id: uuidv4(),
        conversationId,
        senderId: session.user.id,
        content,
    });

    await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    revalidatePath(`/messages/${conversationId}`);
}