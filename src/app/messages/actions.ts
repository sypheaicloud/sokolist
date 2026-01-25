'use server';

import { db } from '@/lib/db';
import { conversations, messages, listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userConversations = await db.select({
        id: conversations.id,
        listingTitle: listings.title,
        listingImage: listings.imageUrl,
        otherUserName: users.name,
        lastMessageAt: conversations.createdAt, // Ideally should be last message timestamp
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .leftJoin(users, eq(conversations.buyerId, users.id)) // Simplified for now, should check who is "other"
        .where(or(eq(conversations.buyerId, session.user.id), eq(conversations.sellerId, session.user.id)))
        .orderBy(desc(conversations.createdAt));

    return userConversations;
}

export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const chatMessages = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

    return chatMessages;
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

    revalidatePath(`/messages/${conversationId}`);
}

export async function startConversation(listingId: string, sellerId: string) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    // Check if conversation already exists
    const existing = await db.select().from(conversations).where(
        and(
            eq(conversations.listingId, listingId),
            eq(conversations.buyerId, session.user.id)
        )
    ).limit(1);

    if (existing[0]) {
        redirect(`/messages/${existing[0].id}`);
    }

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId,
        buyerId: session.user.id,
        sellerId,
    });

    redirect(`/messages/${conversationId}`);
}
