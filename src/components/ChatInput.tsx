'use client';

import { sendMessage } from "@/app/actions/sendMessage";
import { Send } from "lucide-react";
import { useRef } from "react";

export default function ChatInput({ conversationId }: { conversationId: string }) {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                // 1. Send the message to the server
                await sendMessage(formData);
                // 2. Clear the input box instantly
                formRef.current?.reset();
            }}
            className="flex items-center gap-2"
        >
            {/* Hidden field to tell the server WHICH chat this is */}
            <input type="hidden" name="conversationId" value={conversationId} />

            <input
                name="content"
                type="text"
                required
                autoComplete="off"
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-500"
            />

            <button
                type="submit"
                className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors shadow-lg shadow-purple-900/20 active:scale-95"
            >
                <Send size={20} />
            </button>
        </form>
    );
}