'use server';

import { db } from "@/lib/db";
import { messages, conversations, listings } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

// 1. Fetch messages for a specific chat
export async function getMessages(conversationId: string) {
    return await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt)); // Oldest first (like WhatsApp)
}

// 2. Get details about the conversation (Title, etc.)
export async function getConversationById(conversationId: string) {
    const result = await db.select({
        id: conversations.id,
        listingTitle: listings.title,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(eq(conversations.id, conversationId))
        .limit(1);

    return result[0];
}