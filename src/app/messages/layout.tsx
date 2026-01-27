import { getConversations } from './actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { MessageSquare, User, LifeBuoy } from 'lucide-react';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const inbox = await getConversations();

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-950 text-slate-100">
            {/* Sidebar / Inbox List */}
            <aside className="w-80 border-r border-white/10 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare size={18} className="text-purple-500" /> Inbox
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {inbox.map((chat) => {
                        const isSupport = !chat.listingId;
                        return (
                            <Link
                                key={chat.id}
                                href={`/messages/${chat.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isSupport ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {isSupport ? <LifeBuoy size={18} /> : <User size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {isSupport ? "SokoKenya Support" : (chat.listingTitle || "Marketplace Chat")}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {isSupport ? "Admin Help" : "Click to view chat"}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                    {inbox.length === 0 && (
                        <p className="text-center text-slate-500 mt-10 text-xs">No conversations yet.</p>
                    )}
                </nav>
            </aside>

            {/* The actual chat room displays here */}
            <main className="flex-1 flex flex-col bg-slate-950 relative">
                {children}
            </main>
        </div>
    );
}