import { db } from '@/lib/db';
import { users, listings } from '@/lib/schema';
import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, FileText, ArrowLeft } from 'lucide-react';
import AdminUserTable from './AdminUserTable';
import AdminListingTable from './AdminListingTable';

export default async function AdminPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/');
    }

    const allUsers = await db.select().from(users);
    const allListings = await db.select().from(listings);

    const stats = {
        totalUsers: allUsers.length,
        bannedUsers: allUsers.filter(u => u.isBanned).length,
        verifiedUsers: allUsers.filter(u => u.isVerified).length,
        totalListings: allListings.length,
        activeListings: allListings.filter(l => l.isActive).length,
        pendingListings: allListings.filter(l => !l.isApproved).length,
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <nav className="border-b border-white/10 bg-slate-950/50 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-purple-500" />
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Site
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto p-6 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="h-5 w-5 text-blue-400" />
                            <h3 className="font-semibold">Users</h3>
                        </div>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {stats.verifiedUsers} verified • {stats.bannedUsers} banned
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-emerald-400" />
                            <h3 className="font-semibold">Listings</h3>
                        </div>
                        <p className="text-3xl font-bold">{stats.totalListings}</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {stats.activeListings} active • {stats.pendingListings} pending
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-5 w-5 text-purple-400" />
                            <h3 className="font-semibold">Status</h3>
                        </div>
                        <p className="text-lg font-semibold text-emerald-400">All Systems Operational</p>
                    </div>
                </div>

                {/* User Management */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <AdminUserTable users={allUsers} />
                </div>

                {/* Listing Management */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Listing Management</h2>
                    <AdminListingTable listings={allListings} />
                </div>
            </main>
        </div>
    );
}
