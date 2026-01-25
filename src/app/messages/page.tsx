import { getConversations } from './actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, ArrowRight, User } from 'lucide-react';

export default async function InboxPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const chats = await getConversations();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                        <p className="mt-2 text-sm text-slate-400">Manage your inquiries and sales.</p>
                    </div>
                </div>

                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
                        <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-slate-500" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Your inbox is empty</h2>
                        <p className="text-sm text-slate-500 max-w-xs mb-6">
                            Start a conversation with a seller to see messages here.
                        </p>
                        <Link href="/" className="text-sm font-semibold text-purple-400 hover:text-purple-300">
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {chats.map((chat) => (
                            <Link
                                key={chat.id}
                                href={`/messages/${chat.id}`}
                                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10"
                            >
                                <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-800 relative">
                                    {chat.listingImage ? (
                                        <Image src={chat.listingImage} alt="" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-600">
                                            <Tag className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-100 group-hover:text-purple-400 transition-colors truncate">
                                        {chat.listingTitle}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <User className="h-3 w-3" />
                                        <span>{chat.otherUserName}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
                                        Active
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 transform transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { Tag } from 'lucide-react';
