import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
    return (
        <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-950">
            <div className="text-center">
                <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <MessageSquare size={32} className="text-purple-500" />
                </div>
                <h2 className="text-white font-medium">Your Messages</h2>
                <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
            </div>
        </div>
    );
}