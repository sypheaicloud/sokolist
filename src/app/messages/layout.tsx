import { getConversations } from './actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { MessageSquare, User, LifeBuoy } from 'lucide-react';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) return null;

    const inbox = await getConversations();

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-950 overflow-hidden">
            <aside className="w-80 border-r border-white/10 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/10">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageSquare className="text-purple-500" size={20} /> Inbox
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-2">
                    {inbox?.map((chat: any) => (
                        <Link
                            key={chat.id}
                            href={`/messages/${chat.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all mb-1 border border-transparent hover:border-white/5"
                        >
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                {!chat.listingId ? <LifeBuoy size={18} className="text-purple-400" /> : <User size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {chat.listingTitle || "Support Chat"}
                                </p>
                                <p className="text-xs text-slate-500">View message history</p>
                            </div>
                        </Link>
                    ))}
                    {(!inbox || inbox.length === 0) && (
                        <p className="text-center text-slate-500 text-sm mt-10">No chats yet.</p>
                    )}
                </nav>
            </aside>
            <main className="flex-1 bg-slate-950 relative">{children}</main>
        </div>
    );
}