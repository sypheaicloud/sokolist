'use server';

import { db } from '@/lib/db'; // Adjust this import based on where your 'db' instance is
import { conversations, messages } from '@/lib/schema';
import { eq, and, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function sendMessage({
    senderId,
    receiverId,
    content,
    listingId,
}: {
    senderId: string;
    receiverId: string;
    content: string;
    listingId?: string;
}) {
    // 1. Check if a conversation already exists between these two people
    // If it's for a listing, we check for that specifically. 
    // If it's for support (no listingId), we check for a chat between them.
    let existingConversation = await db.query.conversations.findFirst({
        where: and(
            or(
                and(eq(conversations.buyerId, senderId), eq(conversations.sellerId, receiverId)),
                and(eq(conversations.buyerId, receiverId), eq(conversations.sellerId, senderId))
            ),
            listingId ? eq(conversations.listingId, listingId) : undefined
        ),
    });

    let conversationId = existingConversation?.id;

    // 2. If no conversation exists, create one
    if (!conversationId) {
        const newId = uuidv4();
        await db.insert(conversations).values({
            id: newId,
            buyerId: senderId,
            sellerId: receiverId,
            listingId: listingId || null,
        });
        conversationId = newId;
    }

    // 3. Insert the actual message
    await db.insert(messages).values({
        id: uuidv4(),
        conversationId: conversationId,
        senderId: senderId,
        content: content,
    });

    // 4. Update the conversation's "updatedAt" so it jumps to the top of the inbox
    await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    return { success: true, conversationId };
}