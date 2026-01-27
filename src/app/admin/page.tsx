import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LayoutDashboard, FileText, Users, Settings, LogOut } from "lucide-react";

export default async function AdminPage() {
    const session = await auth();

    // 🔒 SECURITY: Kick out anyone who is not an Admin
    if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-purple-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-slate-950/50 hidden md:block">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-500 to-emerald-400" />
                        <span className="text-xl font-bold tracking-tight">SokoAdmin</span>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    <NavItem icon={LayoutDashboard} label="Dashboard" active />
                    <NavItem icon={FileText} label="Listings" />
                    <NavItem icon={Users} label="Users" />
                    <NavItem icon={Settings} label="Settings" />
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-white/10">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Exit Admin</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome back, {session.user.name}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Admin Verified
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard label="Total Listings" value="1,248" change="+12% from last week" />
                    <StatCard label="Active Users" value="8,542" change="+5% from last week" />
                    <StatCard label="Pending Approvals" value="12" change="Requires attention" alert />
                </div>

                {/* Placeholder for Content */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col items-center justify-center text-center h-64">
                    <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <LayoutDashboard className="h-8 w-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Admin Tools Ready</h3>
                    <p className="text-slate-400 max-w-sm mt-2">
                        Select a category from the sidebar to manage listings, users, or platform settings.
                    </p>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon: Icon, label, active = false }: { icon: React.ElementType, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </button>
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