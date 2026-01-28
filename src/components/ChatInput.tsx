'use client';

import { useState } from 'react';
import { sendMessage } from '@/app/messages/actions';
import { Send } from 'lucide-react';

export default function ChatInput({ conversationId }: { conversationId: string }) {
    const [text, setText] = useState("");

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        const currentText = text;
        setText(""); // Clear input immediately for better UX
        await sendMessage(conversationId, currentText);
    };

    return (
        <form onSubmit={handleSend} className="flex gap-2">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="bg-purple-600 p-2 rounded-xl hover:bg-purple-500 transition-colors">
                <Send size={18} className="text-white" />
            </button>
        </form>
    );
}