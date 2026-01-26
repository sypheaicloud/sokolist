import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { desc } from "drizzle-orm";
// import { auth } from "@/lib/auth";
import { ShieldAlert, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import Link from "next/link";

export default async function DiagPage() {
    // const session = await auth();
    // const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;

    const checkToken = () => {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) return { status: false, msg: "Missing BLOB_READ_WRITE_TOKEN" };
        if (!token.startsWith('vercel_blob_rw_')) return { status: false, msg: "Invalid Token Format" };
        return { status: true, msg: "Token format valid" };
    };

    const tokenInfo = checkToken();

    interface ListingStub {
        id: string;
        title: string;
        imageUrl: string | null;
        createdAt: Date | null;
    }

    let recentListings: ListingStub[] = [];
    try {
        const results = await db.select().from(listings).orderBy(desc(listings.createdAt)).limit(5);
        recentListings = results.map(r => ({
            id: r.id,
            title: r.title,
            imageUrl: r.imageUrl,
            createdAt: r.createdAt
        }));
    } catch (e) {
        console.error(e);
    }

    const checks = [
        {
            name: "Vercel Blob Token",
            status: tokenInfo.status,
            hint: tokenInfo.msg
        },
        {
            name: "Database Connection",
            status: !!process.env.DATABASE_URL,
            hint: "Required for all storage operations."
        },
        {
            name: "Auth Secret",
            status: !!process.env.AUTH_SECRET,
            hint: "Required for secure logins."
        },
        {
            name: "Current Build Target",
            status: process.env.NODE_ENV === 'production',
            hint: `Running in: ${process.env.NODE_ENV}`
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShieldAlert className="text-purple-500" />
                    System Diagnostics
                </h1>

                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    {checks.map((check) => (
                        <div key={check.name} className="p-4 rounded-xl border border-white/10 bg-white/5">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{check.name}</span>
                                {check.status ? (
                                    <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                                ) : (
                                    <XCircle className="text-red-500 h-5 w-5" />
                                )}
                            </div>
                            {!check.status && (
                                <p className="text-xs text-red-400 mt-2">{check.hint}</p>
                            )}
                            {check.status && check.name === "Current Build Target" && (
                                <p className="text-xs text-slate-400 mt-2">{check.hint}</p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mb-8 p-6 rounded-xl border border-white/10 bg-white/5">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon className="text-purple-400 h-5 w-5" />
                        Recent Listings (DB Verify)
                    </h2>
                    <div className="space-y-4">
                        {recentListings.map(item => (
                            <div key={item.id} className="p-3 rounded-lg bg-black/40 border border-white/5 text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold">{item.title}</div>
                                        <div className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'No date'}</div>
                                    </div>
                                    {item.imageUrl ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">HAS IMAGE</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">NO IMAGE (NULL)</span>
                                    )}
                                </div>
                                {item.imageUrl && (
                                    <div className="mt-2 text-[10px] break-all text-slate-400 font-mono">{item.imageUrl}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 p-4 rounded-xl border border-purple-500/20 bg-purple-500/10">
                    <h2 className="text-sm font-semibold text-purple-300 mb-2 font-mono">Build Identifier</h2>
                    <code className="text-xs text-slate-400">Commit: Diagnostic_v2 - Jan 26 14:35</code>
                </div>

                <Link href="/" className="mt-8 block text-center text-sm text-slate-500 hover:text-white transition-colors">
                    Return to Marketplace
                </Link>
            </div>
        </div>
    );
}
