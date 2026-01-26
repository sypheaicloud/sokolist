// import { auth } from "@/lib/auth";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function DiagPage() {
    // const session = await auth();
    // const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
    const isAdmin = true; // Temporary public access for debugging

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
                <div className="text-center">
                    <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-slate-400 mt-2">Only administrators can access diagnostics.</p>
                    <Link href="/" className="mt-6 inline-block text-purple-400 hover:underline">Back Home</Link>
                </div>
            </div>
        );
    }

    const checks = [
        {
            name: "Vercel Blob Token",
            status: !!process.env.BLOB_READ_WRITE_TOKEN,
            hint: "Required for image uploads. Set BLOB_READ_WRITE_TOKEN in Vercel settings."
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
            hint: `Currently running in: ${process.env.NODE_ENV}`
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShieldAlert className="text-purple-500" />
                    System Diagnostics
                </h1>

                <div className="space-y-4">
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

                <div className="mt-8 p-4 rounded-xl border border-purple-500/20 bg-purple-500/10">
                    <h2 className="text-sm font-semibold text-purple-300 mb-2">Build Identifier</h2>
                    <code className="text-xs text-slate-400">Commit: Latest - Jan 26 13:30</code>
                </div>

                <Link href="/" className="mt-8 block text-center text-sm text-slate-500 hover:text-white transition-colors">
                    Return to Marketplace
                </Link>
            </div>
        </div>
    );
}
