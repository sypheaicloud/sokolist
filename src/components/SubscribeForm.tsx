'use client';

import { useState } from 'react';
import { subscribeUser } from '@/app/actions/subscribe'; // Imports from your new folder
import { Loader2, Mail, Check, ArrowRight } from 'lucide-react';

export default function SubscribeForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    async function handleSubmit(formData: FormData) {
        setStatus('loading');
        const result = await subscribeUser(formData);

        if (result.success) {
            setStatus('success');
            // Reset to idle after 3 seconds so they can see "Done"
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    }

    return (
        <form action={handleSubmit} className="flex items-center gap-2">
            <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="Subscribe for updates..."
                    disabled={status === 'loading' || status === 'success'}
                    className="h-8 pl-8 pr-3 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-48 transition-all disabled:opacity-50"
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`h-8 w-8 flex items-center justify-center rounded-full transition-all ${status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
            >
                {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
                {status === 'success' && <Check className="h-3 w-3" />}
                {status === 'idle' && <ArrowRight className="h-3 w-3" />}
                {status === 'error' && <span className="text-[10px] font-bold">!</span>}
            </button>
        </form>
    );
}