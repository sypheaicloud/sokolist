import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, and, ne, sql } from "drizzle-orm";

export default async function UnreadBadge() {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Count unread messages sent by others in chats I belong to
    const result = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
            and(
                ne(messages.senderId, session.user.id), // Not my messages
                eq(messages.isRead, false),             // Only unread
                // Security: Must be my chat
                sql`(${conversations.buyerId} = ${session.user.id} OR ${conversations.sellerId} = ${session.user.id})`
            )
        );

    const count = Number(result[0]?.count || 0);

    if (count === 0) return null;

    return (
        <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
            {count > 9 ? '9+' : count}
        </span>
    );
}