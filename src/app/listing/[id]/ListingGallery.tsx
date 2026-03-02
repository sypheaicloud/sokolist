'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface ListingGalleryProps {
    photos: string[];
    title: string;
    isSold: boolean;
}

export default function ListingGallery({ photos, title, isSold }: ListingGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const prev = () => setActiveIndex(i => (i - 1 + photos.length) % photos.length);
    const next = () => setActiveIndex(i => (i + 1) % photos.length);

    if (photos.length === 0) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden aspect-square flex items-center justify-center text-slate-600 bg-slate-900 shadow-2xl">
                <div className="flex flex-col items-center gap-2">
                    <ImageOff className="h-12 w-12 opacity-30" />
                    <span className="text-sm">No image available</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Main Large Image */}
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden aspect-square relative shadow-2xl group">

                {/* SOLD OVERLAY */}
                {isSold && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-5xl font-black text-red-500 -rotate-12 border-4 border-red-500 px-8 py-2 rounded-xl tracking-widest uppercase">
                            SOLD
                        </span>
                    </div>
                )}

                <Image
                    src={photos[activeIndex]}
                    alt={`${title} – photo ${activeIndex + 1}`}
                    fill
                    className={`object-cover transition-transform duration-500 ${!isSold && 'group-hover:scale-105'}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized
                />

                {/* Navigation arrows – only shown when multiple photos */}
                {photos.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                            aria-label="Next photo"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Photo counter */}
                        <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {activeIndex + 1} / {photos.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail Strip – only shown when multiple photos */}
            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {photos.map((url, index) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`relative flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all
                                ${index === activeIndex
                                    ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/30'
                                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                                }`}
                        >
                            <Image
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
