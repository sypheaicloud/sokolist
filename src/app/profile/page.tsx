import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, PlusCircle, Settings, User } from "lucide-react";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <nav className="border-b border-white/10 bg-slate-950/50 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-tr from-purple-500 to-emerald-400 bg-clip-text text-transparent">
                        SokoKenya
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Welcome, {session.user.name}</span>
                        <form action={async () => {
                            'use server';
                            await signOut();
                        }}>
                            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10 transition-colors">
                                <LogOut className="h-3 w-3" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto mt-8 p-4">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Sidebar */}
                    <aside className="md:col-span-1">
                        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                            <button className="flex w-full items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white">
                                <User className="h-4 w-4" />
                                My Listings
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                                <Settings className="h-4 w-4" />
                                Settings
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <section className="md:col-span-3">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-2xl font-bold">My Listings</h1>
                            <Link href="/post" className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors">
                                <PlusCircle className="h-4 w-4" />
                                Post New Ad
                            </Link>
                        </div>

                        {/* Empty State for now */}
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-500">
                            <p>You haven&apos;t posted any ads yet.</p>
                            <Link href="/post" className="mt-2 text-emerald-400 hover:underline">Start selling today</Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
