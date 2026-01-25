import { db } from '@/lib/db';
import { conversations, listings, users, messages } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getMessages, sendMessage } from '../actions';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Send, User } from 'lucide-react';
import Link from 'next/link';

export default async function ChatPage({ params }: { params: { conversationId: string } }) {
    const { conversationId } = await params;
    const session = await auth();
    if (!session?.user) redirect('/login');

    const result = await db.select({
        conversation: conversations,
        listing: listings,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(eq(conversations.id, conversationId))
        .limit(1);

    const data = result[0];
    if (!data) notFound();

    const chatMessages = await getMessages(conversationId);

    return (
        <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-4xl items-center gap-4">
                    <Link href="/messages" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-800">
                        {data.listing?.imageUrl && (
                            <img src={data.listing.imageUrl} alt="" className="h-full w-full object-cover" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
                            {data.listing?.title || 'Unknown Listing'}
                        </h1>
                        <p className="text-xs text-slate-500">KSh {data.listing?.price?.toLocaleString()}</p>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-4xl space-y-4">
                    {chatMessages.length === 0 ? (
                        <div className="text-center py-20 text-slate-600">
                            <p className="text-sm italic">No messages yet. Say hello!</p>
                        </div>
                    ) : (
                        chatMessages.map((msg) => {
                            const isMe = msg.senderId === session.user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                            ? 'bg-purple-600 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Input Footer */}
            <footer className="border-t border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl">
                <div className="mx-auto max-w-4xl">
                    <form
                        action={async (formData: FormData) => {
                            'use server';
                            const content = formData.get('message') as string;
                            if (!content.trim()) return;
                            await sendMessage(conversationId, content);
                        }}
                        className="flex gap-2"
                    >
                        <input
                            name="message"
                            placeholder="Type a message..."
                            autoComplete="off"
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}
