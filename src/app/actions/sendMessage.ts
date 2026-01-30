'use server';

import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid'; // 👈 Import the ID generator

export async function sendMessage(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const content = formData.get("content") as string;
    const conversationId = formData.get("conversationId") as string;

    if (!content || !conversationId) return;

    // 1. Verify the user is actually part of this conversation (Security)
    const chat = await db.select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (!chat[0]) return;

    const isParticipant = chat[0].buyerId === session.user.id || chat[0].sellerId === session.user.id;
    if (!isParticipant) return;

    // 2. Save the message WITH A GENERATED ID
    await db.insert(messages).values({
        id: uuidv4(), // 👈 THIS IS THE FIX. We generate the ID manually.
        conversationId: conversationId,
        senderId: session.user.id,
        content: content,
    });

    // 3. Update the conversation "Updated At" time
    await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    // 4. Refresh the page so the new message appears instantly
    revalidatePath(`/messages/${conversationId}`);
}