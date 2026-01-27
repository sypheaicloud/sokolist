'use server';

import { db } from '@/lib/db';
import { conversations, messages, listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, desc, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 1. GET ALL CONVERSATIONS (Inbox)
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const currentUserId = session.user.id;

    // This query grabs the conversation, the listing info, and the OTHER user's info
    const userConversations = await db.select({
        id: conversations.id,
        listingTitle: listings.title,
        listingImage: listings.imageUrl,
        buyerName: users.name, // We'll logic-check this in the UI to see who is "other"
        sellerId: conversations.sellerId,
        buyerId: conversations.buyerId,
        updatedAt: conversations.updatedAt,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        // We join users twice if we want specific names, but for now we join once to get basics
        .leftJoin(users, or(eq(users.id, conversations.sellerId), eq(users.id, conversations.buyerId)))
        .where(or(eq(conversations.buyerId, currentUserId), eq(conversations.sellerId, currentUserId)))
        .orderBy(desc(conversations.updatedAt));

    return userConversations;
}

// 2. GET MESSAGES FOR A CHAT
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);
}

// 3. SEND A MESSAGE
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Insert the message
    await db.insert(messages).values({
        id: uuidv4(),
        conversationId,
        senderId: session.user.id,
        content,
    });

    // Update the conversation's updatedAt timestamp so it stays at the top of the inbox
    await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    revalidatePath(`/messages/${conversationId}`);
}

// 4. START MARKETPLACE CHAT (Buyer to Seller)
export async function startConversation(listingId: string, sellerId: string) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const buyerId = session.user.id;
    if (buyerId === sellerId) return;

    // Check if conversation already exists for this specific listing
    const existing = await db.query.conversations.findFirst({
        where: and(
            eq(conversations.listingId, listingId),
            or(
                and(eq(conversations.buyerId, buyerId), eq(conversations.sellerId, sellerId)),
                and(eq(conversations.buyerId, sellerId), eq(conversations.sellerId, buyerId))
            )
        ),
    });

    if (existing) {
        redirect(`/messages/${existing.id}`);
    }

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId,
        buyerId: buyerId,
        sellerId: sellerId,
    });

    redirect(`/messages/${conversationId}`);
}

// 5. START SUPPORT CHAT (User to Josiah)
export async function startSupportChat() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const userId = session.user.id;

    // Find Josiah by email
    const admin = await db.query.users.findFirst({
        where: eq(users.email, 'djboziah@gmail.com'),
    });

    if (!admin) {
        throw new Error("Admin (Josiah) not found. Please ensure djboziah@gmail.com has logged in.");
    }

    // Check for existing support chat (where listingId is null)
    const existing = await db.query.conversations.findFirst({
        where: and(
            isNull(conversations.listingId),
            or(
                and(eq(conversations.buyerId, userId), eq(conversations.sellerId, admin.id)),
                and(eq(conversations.buyerId, admin.id), eq(conversations.sellerId, userId))
            )
        ),
    });

    if (existing) {
        redirect(`/messages/${existing.id}`);
    }

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId: null, // Support chat has no listing
        buyerId: userId,
        sellerId: admin.id,
    });

    redirect(`/messages/${conversationId}`);
}