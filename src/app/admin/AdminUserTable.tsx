'use client';

import { useState } from 'react';
import { banUser, unbanUser, deleteUser, verifyUser } from './actions';
import { CheckCircle, XCircle, Trash2, Shield } from 'lucide-react';

type User = {
    id: string;
    name: string | null;
    email: string | null;
    isVerified: boolean | null;
    isAdmin: boolean | null;
    isBanned: boolean | null;
    createdAt: Date | null;
};

export default function AdminUserTable({ users }: { users: User[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleBan = async (userId: string) => {
        if (!confirm('Are you sure you want to ban this user?')) return;
        setLoading(userId);
        await banUser(userId);
        setLoading(null);
    };

    const handleUnban = async (userId: string) => {
        setLoading(userId);
        await unbanUser(userId);
        setLoading(null);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete all their listings.')) return;
        setLoading(userId);
        await deleteUser(userId);
        setLoading(null);
    };

    const handleVerify = async (userId: string) => {
        setLoading(userId);
        await verifyUser(userId);
        setLoading(null);
    };

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        {user.name || 'N/A'}
                                        {user.isAdmin && <Shield className="h-3 w-3 text-purple-400" />}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400">{user.email}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                        {user.isVerified && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                                                <CheckCircle className="h-3 w-3" />
                                                Verified
                                            </span>
                                        )}
                                        {user.isBanned && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-400">
                                                <XCircle className="h-3 w-3" />
                                                Banned
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex justify-end gap-2">
                                        {!user.isVerified && (
                                            <button
                                                onClick={() => handleVerify(user.id)}
                                                disabled={loading === user.id || user.isAdmin === true}
                                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                                            >
                                                Verify
                                            </button>
                                        )}
                                        {!user.isBanned ? (
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                disabled={loading === user.id || user.isAdmin === true}
                                                className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium hover:bg-amber-500 disabled:opacity-50 transition-colors"
                                            >
                                                Ban
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUnban(user.id)}
                                                disabled={loading === user.id}
                                                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
                                            >
                                                Unban
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={loading === user.id || user.isAdmin === true}
                                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium hover:bg-red-500 disabled:opacity-50 transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
