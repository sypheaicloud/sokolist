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
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="Subscribe..."
                    disabled={status === 'loading' || status === 'success'}
                    className="h-9 pl-10 pr-4 rounded-full bg-white border border-white text-xs text-black font-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full max-w-[170px] md:max-w-none md:w-52 transition-all disabled:opacity-50"
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`h-9 w-9 flex items-center justify-center rounded-full transition-all shadow-lg ${status === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
            >
                {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === 'success' && <Check className="h-4 w-4" />}
                {status === 'idle' && <ArrowRight className="h-4 w-4 stroke-[3]" />}
                {status === 'error' && <span className="text-[10px] font-black italic">!</span>}
            </button>
        </form>
    );
}