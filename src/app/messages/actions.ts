'use server';

import { db } from '@/lib/db';
import { conversations, messages, listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, desc, isNull, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- DASHBOARD ACTIONS ---

/**
 * Fetch listings owned by the current logged-in user
 */
export async function getMyListings() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const results = await db.select()
        .from(listings)
        .where(eq(listings.sellerId, session.user.id))
        .orderBy(desc(listings.createdAt));

    return JSON.parse(JSON.stringify(results));
}

/**
 * Delete a listing (Safety: Checks ownership)
 */
export async function deleteListing(listingId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(listings).where(
        and(
            eq(listings.id, listingId),
            eq(listings.sellerId, session.user.id)
        )
    );

    revalidatePath('/dashboard');
    revalidatePath('/');
}

/**
 * Toggle Sold Status
 * Note: If your schema doesn't have a 'status' column, 
 * this prefixes the title with [SOLD] as a temporary measure.
 */
export async function toggleSoldStatus(listingId: string, currentTitle: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const isSold = currentTitle.startsWith('[SOLD]');
    const newTitle = isSold
        ? currentTitle.replace('[SOLD] ', '')
        : `[SOLD] ${currentTitle}`;

    await db.update(listings)
        .set({ title: newTitle })
        .where(
            and(
                eq(listings.id, listingId),
                eq(listings.sellerId, session.user.id)
            )
        );

    revalidatePath('/dashboard');
    revalidatePath('/');
}

// --- EXISTING MESSAGING ACTIONS ---

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
                    ne(users.id, session.user.id) // Show the partner's name, not yours
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

    const results = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

    return JSON.parse(JSON.stringify(results));
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

export async function startConversation(listingId: string, sellerId: string) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    if (sessionUserId === sellerId) redirect('/messages');

    let finalBuyerId = sessionUserId;
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, userEmail!)).limit(1);
        if (existingUser.length > 0) {
            finalBuyerId = existingUser[0].id;
        } else {
            await db.insert(users).values({ id: sessionUserId, email: userEmail!, name: userName || 'User' });
        }
    } catch (err) { console.error(err); }

    const existingResults = await db.select()
        .from(conversations)
        .where(
            and(
                eq(conversations.listingId, listingId),
                or(
                    and(eq(conversations.buyerId, finalBuyerId), eq(conversations.sellerId, sellerId)),
                    and(eq(conversations.buyerId, sellerId), eq(conversations.sellerId, finalBuyerId))
                )
            )
        )
        .limit(1);

    if (existingResults[0]) redirect(`/messages/${existingResults[0].id}`);

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId,
        buyerId: finalBuyerId,
        sellerId: sellerId,
    });

    redirect(`/messages/${conversationId}`);
}

export async function startSupportChat() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    let finalUserId = sessionUserId;
    try {
        const existingUserByEmail = await db.select()
            .from(users)
            .where(eq(users.email, userEmail!))
            .limit(1);

        if (existingUserByEmail.length > 0) {
            finalUserId = existingUserByEmail[0].id;
            if (userName && existingUserByEmail[0].name !== userName) {
                await db.update(users).set({ name: userName }).where(eq(users.id, finalUserId));
            }
        } else {
            await db.insert(users).values({
                id: sessionUserId,
                email: userEmail!,
                name: userName || 'User',
            });
        }
    } catch (err) {
        console.error("User resolve error:", err);
    }

    const adminResults = await db.select()
        .from(users)
        .where(eq(users.email, 'djboziah@gmail.com'))
        .limit(1);

    const admin = adminResults[0];
    if (!admin) redirect('/?error=support_unavailable');

    if (finalUserId === admin.id) {
        redirect('/messages');
    }

    const existingResults = await db.select()
        .from(conversations)
        .where(
            and(
                isNull(conversations.listingId),
                or(
                    and(eq(conversations.buyerId, finalUserId), eq(conversations.sellerId, admin.id)),
                    and(eq(conversations.buyerId, admin.id), eq(conversations.sellerId, finalUserId))
                )
            )
        )
        .limit(1);

    if (existingResults[0]) redirect(`/messages/${existingResults[0].id}`);

    const conversationId = uuidv4();
    await db.insert(conversations).values({
        id: conversationId,
        listingId: null,
        buyerId: finalUserId,
        sellerId: admin.id,
    });

    await db.insert(messages).values([
        {
            id: uuidv4(),
            conversationId: conversationId,
            senderId: admin.id,
            content: `Jambo ${userName || 'there'}! Your support request has been officially received.`,
        },
        {
            id: uuidv4(),
            conversationId: conversationId,
            senderId: admin.id,
            content: `Please describe your issue in detail below. A member of our team (Josiah) will review this and take further action within the next 24 hours. Thank you for your patience!`,
        }
    ]);

    revalidatePath('/messages');
    redirect(`/messages/${conversationId}`);
}