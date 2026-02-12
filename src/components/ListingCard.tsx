import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

// This component represents a single "item" in your marketplace grid.
export default function ListingCard({ item }: { item: any }) {
    return (
        <Link
            href={`/listing/${item.id}`}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all active:scale-[0.98] md:hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
        >
            {/* Image Container */}
            <div className="h-32 sm:h-48 w-full relative overflow-hidden bg-slate-800">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 md:group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 bg-slate-900 uppercase font-black tracking-widest">
                        {item.category}
                    </div>
                )}
                {/* Price Tag Overlay on Mobile */}
                <div className="absolute top-2 right-2 md:hidden">
                    <div className="bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <p className="text-[10px] font-black text-emerald-400">
                            KSh {Number(item.price).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-3 md:p-4">
                <div className="mb-1.5 flex justify-between items-center">
                    {/* Category Badge */}
                    <span className="text-[8px] md:text-[10px] uppercase tracking-wider font-extrabold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded-md">
                        {item.category}
                    </span>
                    {/* Location */}
                    <span className="hidden sm:flex text-[10px] text-slate-400 items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-purple-400" /> {item.location}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xs md:text-lg font-bold text-slate-100 truncate group-hover:text-purple-400 transition-colors">
                    {item.title}
                </h3>

                {/* Price (Desktop only, since we have overlay on mobile) */}
                <p className="hidden md:block mt-1 font-black text-emerald-400 text-lg">
                    KSh {Number(item.price).toLocaleString()}
                </p>
            </div>
        </Link>
    );
}