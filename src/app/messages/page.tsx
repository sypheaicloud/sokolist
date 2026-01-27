import { getMessages, sendMessage } from '../actions';
import { auth } from '@/lib/auth';
import { Send, CheckCheck } from 'lucide-react';

export default async function ChatRoom({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const chatMessages = await getMessages(id);

    async function handleSend(formData: FormData) {
        'use server';
        const content = formData.get('message') as string;
        if (content.trim()) {
            await sendMessage(id, content);
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
            {/* WhatsApp-style Background Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://w0.peakpx.com/wallpaper/580/650/HD-wallpaper-whatsapp-bg-dark-background.jpg')] bg-repeat" />

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 z-10">
                {chatMessages.map((msg) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`relative max-w-[85%] md:max-w-[70%] px-3 py-2 shadow-md ${isMe
                                ? 'bg-[#005c4b] text-[#e9edef] rounded-l-lg rounded-br-lg rounded-tr-none'
                                : 'bg-[#202c33] text-[#e9edef] rounded-r-lg rounded-bl-lg rounded-tl-none'
                                }`}>
                                {/* Message Content */}
                                <p className="text-[15px] leading-relaxed pb-1 pr-12">
                                    {msg.content}
                                </p>

                                {/* Timestamp & Status Check */}
                                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && <CheckCheck size={14} className="text-emerald-400" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area (WhatsApp Style) */}
            <form action={handleSend} className="p-3 bg-[#202c33] flex items-center gap-3 z-10">
                <input
                    name="message"
                    placeholder="Type a message"
                    autoComplete="off"
                    className="flex-1 bg-[#2a3942] text-[#d1d7db] border-none rounded-lg px-4 py-2.5 focus:ring-0 outline-none placeholder:text-slate-500"
                />
                <button
                    type="submit"
                    className="bg-[#00a884] p-3 rounded-full hover:bg-[#008f72] transition-colors text-white shadow-lg"
                >
                    <Send size={20} fill="currentColor" />
                </button>
            </form>
        </div>
    );
}