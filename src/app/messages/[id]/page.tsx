import { getMessages, getConversationById } from '../actions';
import { auth } from '@/lib/auth';
import ChatInput from '@/components/ChatInput';
import { notFound } from 'next/navigation';

export default async function ChatRoom({ params }: { params: Promise<{ id: string }> }) {
    // 1. Await the ID from the URL
    const { id } = await params;
    const session = await auth();

    if (!session) return notFound();

    // 2. Fetch the specific messages and conversation details
    const chatMessages = await getMessages(id);
    const conversation = await getConversationById(id);
    const currentUserId = session.user?.id;

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header: Shows what item this chat is about */}
            <div className="p-4 border-b border-white/10 bg-slate-900/30">
                <h3 className="text-sm font-semibold text-white">
                    {conversation?.listingTitle || "Inquiry"}
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Conversation ID: {id.slice(-8)}
                </p>
            </div>

            {/* Message Bubbles Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                {chatMessages.length === 0 && (
                    <div className="text-center py-10 text-slate-600 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                )}

                {chatMessages.map((msg: any) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.senderId === currentUserId
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.content}
                            <div className="text-[10px] mt-1 opacity-50 text-right">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* The Typing Bar */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50">
                <ChatInput conversationId={id} />
            </div>
        </div>
    );
}