'use client';

import { useActionState } from 'react';
import { registerUser } from './actions';
import Link from 'next/link';

export default function RegisterPage() {
    const [state, dispatch] = useActionState(registerUser, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-400">Join Kenya's Premier Marketplace today</p>
                </div>

                <form action={dispatch} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                placeholder="Full Name"
                            />
                            {state?.errors?.name && <p className="text-xs text-red-500 mt-1">{state.errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                placeholder="Email address"
                            />
                            {state?.errors?.email && <p className="text-xs text-red-500 mt-1">{state.errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                placeholder="Password"
                            />
                            {state?.errors?.password && <p className="text-xs text-red-500 mt-1">{state.errors.password}</p>}
                        </div>
                    </div>

                    {state?.message && (
                        <div className="rounded-md bg-red-500/10 p-4">
                            <p className="text-sm text-red-400">{state.message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        Sign up
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
