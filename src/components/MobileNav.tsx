"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, MessageSquare, User } from "lucide-react";

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Browse", href: "/browse", icon: Search },
        { label: "Post", href: "/post", icon: PlusSquare, primary: true },
        { label: "Messages", href: "/messages", icon: MessageSquare },
        { label: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
            <div className="mx-4 mb-6 relative">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" />
                <div className="relative flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        if (item.primary) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative -top-6 flex flex-col items-center justify-center"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 p-0.5 shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
                                        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <span className="mt-1 text-[10px] font-bold text-white uppercase tracking-tighter">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center transition-all ${isActive ? "text-purple-400" : "text-slate-400 active:text-slate-200"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                                <span className="mt-1 text-[10px] font-medium uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
