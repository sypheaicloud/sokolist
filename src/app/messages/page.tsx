import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, Search, MoreVertical, Send } from "lucide-react";

export default async function MessagesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-4 px-4 font-sans flex flex-col h-screen">
            <div className="container mx-auto max-w-6xl flex-1 flex overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">

                {/* LEFT SIDEBAR: Chat List */}
                <aside className="w-80 border-r border-white/10 flex flex-col bg-slate-900/50 hidden md:flex">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input type="text" placeholder="Search chats..." className="w-full bg-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-500" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {/* Demo Chat Item */}
                        <div className="p-3 rounded-xl bg-purple-600/10 border border-purple-500/20 cursor-pointer">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold text-white">SokoSupport</span>
                                <span className="text-xs text-purple-300">Now</span>
                            </div>
                            <p className="text-sm text-slate-300 truncate">Welcome to SokoKenya! Start buying and selling today.</p>
                        </div>

                        {/* Empty State for List */}
                        <div className="p-8 text-center opacity-50 text-sm">
                            <p>No other conversations yet.</p>
                        </div>
                    </div>
                </aside>

                {/* RIGHT SIDE: Chat Window */}
                <main className="flex-1 flex flex-col bg-slate-950/30 relative">

                    {/* Chat Header */}
                    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-emerald-400" />
                            <div>
                                <h3 className="font-bold">SokoSupport</h3>
                                <span className="text-xs text-emerald-400 flex items-center gap-1">● Online</span>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </header>

                    {/* Chat Area (Empty State) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-md shadow-lg border border-white/5">
                                <p>Hello {session.user.name?.split(' ')[0]}! 👋</p>
                                <p className="mt-2">This is your inbox. When you contact sellers or they contact you, your messages will appear here.</p>
                            </div>
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-white/10 bg-slate-900/50">
                        <form className="flex gap-2">
                            <input type="text" placeholder="Type a message..." className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <button type="button" className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors">
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                </main>
            </div>
        </div>
    );
}