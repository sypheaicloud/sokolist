'use server';

import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'; // 👈 Import the ID generator

export async function startChat(listingId: string, sellerId: string) {
    const session = await auth();

    // 1. Security Check
    if (!session?.user?.id) return redirect("/login");

    // 2. Prevent chatting with yourself
    if (session.user.id === sellerId) {
        return;
    }

    // 3. Check if conversation already exists for this specific item
    const existingChat = await db.select()
        .from(conversations)
        .where(
            and(
                eq(conversations.buyerId, session.user.id),
                eq(conversations.listingId, listingId)
            )
        )
        .limit(1);

    if (existingChat.length > 0) {
        // Chat exists! Go there.
        redirect(`/messages/${existingChat[0].id}`);
    }

    // 4. Create new conversation WITH A GENERATED ID
    const newChatId = uuidv4(); // 👈 Generate ID here

    await db.insert(conversations).values({
        id: newChatId, // 👈 Explicitly set the ID
        buyerId: session.user.id,
        sellerId: sellerId,
        listingId: listingId,
    });

    // 5. Redirect to the new chat room
    redirect(`/messages/${newChatId}`);
}