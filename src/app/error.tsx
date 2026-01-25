'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
            <p className="text-slate-400 mb-8 max-w-md">{error.message || 'An unexpected error occurred.'}</p>
            <button
                onClick={() => reset()}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
