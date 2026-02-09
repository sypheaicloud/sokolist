import Link from "next/link";
import { ArrowLeft, CheckCircle2, Camera, Tag, ShieldCheck, Zap } from "lucide-react";

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft size={16} />
                    Back to Marketplace
                </Link>

                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                        How Uza Market Works
                    </h1>
                    <p className="text-xl text-slate-400">
                        Expert strategies to help you sell faster and safer on MarketPlace254.
                    </p>
                </header>

                <div className="grid gap-12">
                    {/* Section 1: Creating a Great Post */}
                    <section className="relative p-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Camera size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20">
                                <Camera size={24} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 italic uppercase">1. Master Your Photos</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Items with high-quality photos sell **3x faster**. Take photos in natural daylight and show multiple angles. Specifically for the 254 market, buyers want to see the item "in action" or in its actual surroundings.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Clean the item before shooting",
                                    "Use a neutral background",
                                    "Show any minor scratches to build trust",
                                    "Include at least 3-5 photos"
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Section 2: Pricing Strategy */}
                    <section className="relative p-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Tag size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                                <Tag size={24} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 italic uppercase">2. Competitive Pricing</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Price your item competitively by checking what others are charging in Nairobi or your local town. Be open to a bit of negotiation—it&apos;s part of the culture!
                            </p>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Pro Tip:</p>
                                <p className="text-sm text-slate-300 italic">
                                    &quot;Start slightly higher than your desired price to allow for the classic Kenyan bargain.&quot;
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Safety & Trust */}
                    <section className="relative p-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 italic uppercase">3. Stay Safe</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Your safety is our priority. Always use our in-app messaging system and follow these core rules:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex gap-3">
                                    <Zap size={20} className="text-yellow-500 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Meet in Public</p>
                                        <p className="text-xs text-slate-500">Meet at malls or busy petrol stations.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Zap size={20} className="text-yellow-500 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Verify Payment</p>
                                        <p className="text-xs text-slate-500">Confirm MPESA messages before releasing items.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-20 text-center">
                    <Link
                        href="/post"
                        className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-8 py-4 text-lg font-bold text-white hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 active:scale-95"
                    >
                        Start Posting Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
