import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

// This component represents a single "item" in your marketplace grid.
export default function ListingCard({ item }: { item: any }) {
    return (
        <Link
            href={`/listing/${item.id}`}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
        >
            {/* Image Container */}
            <div className="h-48 w-full relative overflow-hidden bg-slate-800">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-900">
                        {/* Fallback text if no image exists */}
                        {item.category}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-4">
                <div className="mb-2 flex justify-between items-center">
                    {/* Category Badge */}
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                        {item.category}
                    </span>
                    {/* Location */}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-purple-400" /> {item.location}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-100 truncate group-hover:text-purple-400 transition-colors">
                    {item.title}
                </h3>

                {/* Price */}
                <p className="mt-1 font-bold text-emerald-400 text-lg">
                    KSh {Number(item.price).toLocaleString()}
                </p>
            </div>
        </Link>
    );
}