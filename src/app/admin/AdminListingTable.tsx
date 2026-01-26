'use client';

import { useState } from 'react';
import { deactivateListing, activateListing, deleteListing } from './actions';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

type Listing = {
    id: string;
    title: string;
    price: number;
    category: string;
    location: string;
    isActive: boolean | null;
    isApproved: boolean | null;
    createdAt: Date | null;
};

export default function AdminListingTable({ listings }: { listings: Listing[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleDeactivate = async (listingId: string) => {
        setLoading(listingId);
        await deactivateListing(listingId);
        setLoading(null);
    };

    const handleActivate = async (listingId: string) => {
        setLoading(listingId);
        await activateListing(listingId);
        setLoading(null);
    };

    const handleDelete = async (listingId: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        setLoading(listingId);
        await deleteListing(listingId);
        setLoading(null);
    };

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {listings.map((listing) => (
                            <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium">{listing.title}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">{listing.category}</td>
                                <td className="px-4 py-3 text-sm text-emerald-400">
                                    KSh {listing.price.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400">{listing.location}</td>
                                <td className="px-4 py-3 text-sm">
                                    {listing.isActive ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                                            <Eye className="h-3 w-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-1 text-xs text-slate-400">
                                            <EyeOff className="h-3 w-3" />
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400">
                                    {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex justify-end gap-2">
                                        {listing.isActive ? (
                                            <button
                                                onClick={() => handleDeactivate(listing.id)}
                                                disabled={loading === listing.id}
                                                className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium hover:bg-amber-500 disabled:opacity-50 transition-colors"
                                            >
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleActivate(listing.id)}
                                                disabled={loading === listing.id}
                                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                                            >
                                                Activate
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(listing.id)}
                                            disabled={loading === listing.id}
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
