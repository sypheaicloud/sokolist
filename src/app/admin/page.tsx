import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, LayoutDashboard, FileText, Users, LogOut, Trash2, PauseCircle, PlayCircle, Power, Shield, ExternalLink, Activity, Globe, MapPin } from "lucide-react";
import { getAdminData, deleteListing, toggleListingStatus, deleteUser, toggleUserBan, toggleUserAdmin } from "./actions";

// ⚡ FORCE DYNAMIC: Ensures fresh data every time
export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const session = await auth();
    const params = await searchParams;
    const currentView = params.view || 'dashboard';

    // 🔒 SECURITY CHECK
    if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
        redirect("/");
    }

    // Fetch Data
    const { listings, users, stats, locations } = await getAdminData();
    const activeListings = listings.length;
    const totalUsers = users.length;
    // @ts-expect-error - status checking
    const pendingListings = listings.filter(l => l.status === 'HOLD').length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">

            {/* SIDEBAR */}
            <aside className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-white/10 z-[9999] pointer-events-auto flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-500 to-emerald-400" />
                        <span className="text-xl font-bold tracking-tight text-white">SokoAdmin</span>
                    </div>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    <a href="/admin?view=dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 ${currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                    </a>
                    <a href="/admin?view=analytics" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 ${currentView === 'analytics' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                        <Activity className="h-5 w-5" />
                        <span className="font-medium">Analytics</span>
                    </a>
                    <a href="/admin?view=listings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 ${currentView === 'listings' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">Listings</span>
                    </a>
                    <a href="/admin?view=users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 ${currentView === 'users' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Users</span>
                    </a>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <a href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Exit Admin</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64 min-h-screen relative z-0 bg-slate-950 p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight capitalize text-white">{currentView}</h1>
                        <p className="text-slate-400 mt-1">Overview of system performance</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Super Admin
                    </div>
                </header>

                {/* VIEW: DASHBOARD */}
                {currentView === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total Site Visits" value={stats.totalVisits.toLocaleString()} change="Overall traffic" />
                        <StatCard label="Live Listings" value={activeListings.toString()} change="Verified items" />
                        <StatCard label="Registered Users" value={totalUsers.toString()} change="Platform growth" />
                    </div>
                )}

                {/* VIEW: ANALYTICS */}
                {currentView === 'analytics' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                                <Activity className="h-12 w-12 text-purple-400 mb-4" />
                                <h3 className="text-4xl font-black text-white mb-2">{stats.totalVisits.toLocaleString()}</h3>
                                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Total Page Views</p>
                            </div>
                            <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Regional Distribution</h3>
                                </div>
                                <div className="space-y-4">
                                    {(locations || []).length > 0 ? (
                                        locations.map((loc) => (
                                            <div key={loc.location} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <MapPin className="h-3 w-3 text-slate-500" />
                                                    {loc.location}
                                                </div>
                                                <div className="font-bold text-white pr-2">{loc.count} Posts</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-slate-500 py-4">No regional data yet</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl border border-purple-500/30 bg-purple-500/5 text-center">
                            <h3 className="text-xl font-bold text-white mb-4">Need even more detail?</h3>
                            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                                For deep insights into user behavior, device types, and real-time session tracking, check the Vercel Analytics dashboard.
                            </p>
                            <a
                                href="https://vercel.com/dashboard"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20"
                            >
                                <ExternalLink className="h-5 w-5" />
                                Open Vercel Analytics
                            </a>
                        </div>
                    </div>
                )}

                {/* VIEW: LISTINGS */}
                {currentView === 'listings' && (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                                    <tr>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Seller</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {listings.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No listings found.</td></tr>
                                    ) : (
                                        listings.map((listing) => (
                                            <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium text-white group">
                                                    <a href={`/listing/${listing.id}`} target="_blank" className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                                                        {listing.title}
                                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                                    </a>
                                                </td>
                                                <td className="p-4 text-emerald-400">KSh {listing.price.toLocaleString()}</td>
                                                {/* @ts-expect-error - user check */}
                                                <td className="p-4 text-slate-300">{listing.user?.email || 'Unknown'}</td>
                                                <td className="p-4">
                                                    {/* @ts-expect-error - status check */}
                                                    {listing.status === 'ACTIVE'
                                                        ? <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">ACTIVE</span>
                                                        : <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">HOLD</span>
                                                    }
                                                </td>
                                                <td className="p-4 flex justify-end gap-2 text-white">
                                                    <form action={toggleListingStatus}>
                                                        <input type="hidden" name="id" value={listing.id} />
                                                        {/* @ts-expect-error - status check */}
                                                        <input type="hidden" name="currentStatus" value={listing.status || 'ACTIVE'} />
                                                        <button className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 cursor-pointer" title="Toggle Hold">
                                                            {/* @ts-expect-error - status check */}
                                                            {listing.status === 'HOLD' ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                                                        </button>
                                                    </form>
                                                    <form action={deleteListing}>
                                                        <input type="hidden" name="id" value={listing.id} />
                                                        <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer" title="Delete Forever">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW: USERS */}
                {currentView === 'users' && (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium text-white">{user.name}</td>
                                                <td className="p-4 text-slate-300">{user.email}</td>
                                                <td className="p-4">
                                                    {user.isAdmin
                                                        ? <span className="flex items-center gap-1 text-purple-400 font-bold"><Shield className="h-3 w-3" /> Admin</span>
                                                        : <span className="text-slate-500">User</span>
                                                    }
                                                </td>
                                                <td className="p-4">
                                                    {user.isBanned
                                                        ? <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold">BANNED</span>
                                                        : <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">ACTIVE</span>
                                                    }
                                                </td>
                                                <td className="p-4 flex justify-end gap-2 text-white">
                                                    <form action={toggleUserAdmin}>
                                                        <input type="hidden" name="id" value={user.id} />
                                                        <input type="hidden" name="isAdmin" value={String(user.isAdmin)} />
                                                        <button type="submit" className={`p-2 rounded-lg cursor-pointer ${user.isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-500 hover:text-purple-400'}`} title={user.isAdmin ? "Remove Admin" : "Make Admin"}>
                                                            <Shield className="h-4 w-4" />
                                                        </button>
                                                    </form>
                                                    <form action={toggleUserBan}>
                                                        <input type="hidden" name="id" value={user.id} />
                                                        <input type="hidden" name="isBanned" value={String(user.isBanned)} />
                                                        <button type="submit" className={`p-2 rounded-lg cursor-pointer ${user.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400'}`} title={user.isBanned ? "Activate User" : "Deactivate/Ban User"}>
                                                            <Power className="h-4 w-4" />
                                                        </button>
                                                    </form>
                                                    <form action={deleteUser}>
                                                        <input type="hidden" name="id" value={user.id} />
                                                        <button type="submit" className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer" title="Delete User Permanently">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, value, change, alert = false }: { label: string, value: string, change: string, alert?: boolean }) {
    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
            <p className={`text-xs font-medium ${alert ? 'text-amber-400' : 'text-emerald-400'}`}>
                {change}
            </p>
        </div>
    );
}