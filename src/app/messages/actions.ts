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

        return JSON.parse(JSON.stringify(results));
    } catch (e) {
        console.error("Inbox fetch failed:", e);
        return [];
    }
}

// 2. GET MESSAGES FOR A CHAT
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const results = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

    return JSON.parse(JSON.stringify(results));
}

// 3. SEND A MESSAGE
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

// 4. START MARKETPLACE CHAT (Buyer to Seller)
export async function startConversation(listingId: string, sellerId: string) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    if (userId === sellerId) redirect('/messages');

    // Sync User
    try {
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (existingUser.length === 0 && userEmail) {
            await db.insert(users).values({ id: userId, email: userEmail, name: userName || 'User' });
        }
    } catch (err) { console.error(err); }

    const existingResults = await db.select()
        .from(conversations)
        .where(
            and(
                eq(conversations.listingId, listingId),
                or(
                    and(eq(conversations.buyerId, userId), eq(conversations.sellerId, sellerId)),
                    and(eq(conversations.buyerId, sellerId), eq(conversations.sellerId, userId))
                )
            )
        )
        .limit(1);

    if (existingResults[0]) redirect(`/messages/${existingResults[0].id}`);

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId,
        buyerId: userId,
        sellerId: sellerId,
    });

    redirect(`/messages/${conversationId}`);
}

// 5. START SUPPORT CHAT (User to Josiah)
export async function startSupportChat() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    // --- STEP A: SYNC USER ---
    try {
        const existingUserRecord = await db.select()
            .from(users)
            .where(or(eq(users.id, userId), eq(users.email, userEmail!)))
            .limit(1);

        if (existingUserRecord.length === 0 && userEmail) {
            await db.insert(users).values({
                id: userId,
                email: userEmail,
                name: userName || 'User',
            });
        } else if (existingUserRecord.length > 0 && existingUserRecord[0].id !== userId) {
            await db.update(users)
                .set({ id: userId, name: userName || existingUserRecord[0].name })
                .where(eq(users.email, userEmail!));
        }
    } catch (err) {
        console.error("User sync error:", err);
    }

    // --- STEP B: FIND ADMIN ---
    const adminResults = await db.select()
        .from(users)
        .where(eq(users.email, 'djboziah@gmail.com'))
        .limit(1);

    const admin = adminResults[0];
    if (!admin) redirect('/?error=support_unavailable');
    if (userId === admin.id) redirect('/messages');

    // --- STEP C: CHECK EXISTING ---
    const existingResults = await db.select()
        .from(conversations)
        .where(
            and(
                isNull(conversations.listingId),
                or(
                    and(eq(conversations.buyerId, userId), eq(conversations.sellerId, admin.id)),
                    and(eq(conversations.buyerId, admin.id), eq(conversations.sellerId, userId))
                )
            )
        )
        .limit(1);

    if (existingResults[0]) redirect(`/messages/${existingResults[0].id}`);

    // --- STEP D: CREATE CHAT + INITIAL MESSAGE ---
    const conversationId = uuidv4();

    // Create Conversation
    await db.insert(conversations).values({
        id: conversationId,
        listingId: null,
        buyerId: userId,
        sellerId: admin.id,
    });

    // Create First Welcome Message from Admin
    await db.insert(messages).values({
        id: uuidv4(),
        conversationId: conversationId,
        senderId: admin.id,
        content: `Jambo ${userName || 'there'}! Welcome to SokoKenya Support. How can I help you today?`,
    });

    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}