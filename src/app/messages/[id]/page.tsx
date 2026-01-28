import { db } from '@/lib/db';
import { conversations, listings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getMessages, sendMessage } from '../actions';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Send, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Use 'any' for params to ensure compatibility during the Next.js 15 transition
export default async function ChatPage({ params }: { params: any }) {
    // Await params safely
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const session = await auth();
    if (!session?.user) redirect('/login');

    // Fetch conversation and listing data
    const result = await db.select({
        conversation: conversations,
        listing: listings,
    })
        .from(conversations)
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .where(eq(conversations.id, id))
        .limit(1);

    const data = result[0];

    // If no conversation is found in DB, trigger the 404 page
    if (!data) return notFound();

    const chatMessages = await getMessages(id);
    const isSupport = !data.conversation.listingId;

    return (
        <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl shrink-0">
                <div className="mx-auto flex max-w-4xl items-center gap-4">
                    <Link href="/messages" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center relative border border-white/5">
                        {isSupport ? (
                            <LifeBuoy className="text-purple-400" size={20} />
                        ) : data.listing?.imageUrl ? (
                            <Image src={data.listing.imageUrl} alt="" fill className="object-cover" unoptimized />
                        ) : (
                            <div className="bg-slate-700 h-full w-full" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-bold truncate">
                            {isSupport ? 'SokoKenya Official Support' : (data.listing?.title || 'Marketplace Chat')}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {isSupport ? 'Active Support Session' : `KSh ${data.listing?.price?.toLocaleString() || '0'}`}
                        </p>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-4xl space-y-4">
                    {chatMessages.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                                <Send size={20} className="text-slate-600 -rotate-45" />
                            </div>
                            <p className="text-sm text-slate-500 italic">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        chatMessages.map((msg: any) => {
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
            <footer className="border-t border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl shrink-0">
                <div className="mx-auto max-w-4xl">
                    <form
                        action={async (formData: FormData) => {
                            'use server';
                            const content = formData.get('message') as string;
                            if (!content.trim()) return;
                            await sendMessage(id, content);
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