'use server';

import { db } from "@/lib/db";
import { messages, conversations, listings, users } from "@/lib/schema";
import { eq, asc, desc, or, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

// 1. Fetch messages for a specific chat (Chat Room)
export async function getMessages(conversationId: string) {
    return await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
}

// 2. Get details about a single conversation (Header Info)
export async function getConversationById(conversationId: string) {
    const result = await db.select({
        id: conversations.id,
        listingTitle: listings.title,
        listingImage: listings.imageUrl,
        buyerId: conversations.buyerId,
        sellerId: conversations.sellerId,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(eq(conversations.id, conversationId))
        .limit(1);

    return result[0];
}

// 3. 👇 NEW: Fetch ALL conversations for the Sidebar/Inbox
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    // Find all chats where I am the Buyer OR the Seller
    const chats = await db.select({
        id: conversations.id,
        updatedAt: conversations.updatedAt,
        listingTitle: listings.title,
        listingImage: listings.imageUrl,
        buyerId: conversations.buyerId,
        sellerId: conversations.sellerId,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(
            or(
                eq(conversations.buyerId, userId),
                eq(conversations.sellerId, userId)
            )
        )
        .orderBy(desc(conversations.updatedAt)); // Newest first

    // Helper: Fetch the "Other User's" name for each chat
    // (We do this in a loop because SQL joins with the same table twice can be tricky)
    const chatsWithNames = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;

        const otherUser = await db.select({
            name: users.name,
            image: users.image
        })
            .from(users)
            .where(eq(users.id, otherUserId))
            .limit(1);

        return {
            ...chat,
            otherUserName: otherUser[0]?.name || "User",
            otherUserImage: otherUser[0]?.image
        };
    }));

    return chatsWithNames;
}