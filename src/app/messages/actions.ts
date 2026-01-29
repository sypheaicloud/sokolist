'use server';

import { db } from '@/lib/db';
import { messages, conversations, listings } from '@/lib/schema';
import { eq, asc, desc, or, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// 1. Fetch a single conversation for the Chat Header
export async function getConversationById(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const result = await db.select({
        id: conversations.id,
        listingTitle: listings.title,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(eq(conversations.id, conversationId))
        .limit(1);

    return result[0] || null;
}

// 2. Start or Resume a Conversation (Listing-based)
export async function startConversation(listingId: string, sellerId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Must be logged in to contact seller");
    const buyerId = session.user.id;

    if (buyerId === sellerId) return redirect('/browse');

    const existing = await db.select()
        .from(conversations)
        .where(
            and(
                eq(conversations.listingId, listingId),
                eq(conversations.buyerId, buyerId),
                eq(conversations.sellerId, sellerId)
            )
        )
        .limit(1);

    let conversationId;

    if (existing.length > 0) {
        conversationId = existing[0].id;
    } else {
        const newChat = await db.insert(conversations).values({
            listingId,
            buyerId,
            sellerId,
            updatedAt: new Date(),
        }).returning({ id: conversations.id });

        conversationId = newChat[0].id;
    }

    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}

// 3. NEW: Start Chat with Support
// This fixes the "startSupportChat" import error
export async function startSupportChat() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // Replace with your actual Admin/Support UUID from your database
    const ADMIN_ID = "YOUR_ADMIN_USER_ID_HERE";

    // Look for existing support chat (where listingId is typically null)
    const existing = await db.select()
        .from(conversations)
        .where(
            and(
                eq(conversations.buyerId, userId),
                eq(conversations.sellerId, ADMIN_ID)
            )
        )
        .limit(1);

    let conversationId;

    if (existing.length > 0) {
        conversationId = existing[0].id;
    } else {
        const newChat = await db.insert(conversations).values({
            listingId: null, // Support chats aren't tied to an item
            buyerId: userId,
            sellerId: ADMIN_ID,
            updatedAt: new Date(),
        }).returning({ id: conversations.id });

        conversationId = newChat[0].id;
    }

    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}

// 4. Fetching all conversations for the Sidebar
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    return await db.select({
        id: conversations.id,
        listingId: conversations.listingId,
        listingTitle: listings.title,
        listingImage: listings.imageUrl,
        updatedAt: conversations.updatedAt,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)))
        .orderBy(desc(conversations.updatedAt));
}

// 5. Fetching messages for the [id] page
export async function getMessages(conversationId: string) {
    return await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
}

// 6. Saving the message
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.insert(messages).values({
        conversationId,
        senderId: session.user.id,
        content,
    });

    await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    revalidatePath(`/messages/${conversationId}`);
}