'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function signInWithGoogle() {
    try {
        await signIn('google', { redirectTo: '/' });
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error('Google sign-in failed:', error);
        throw error;
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/',
        });
    } catch (error) {
        if (isRedirectError(error)) throw error;

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password.';
                default:
                    return 'Authentication failed. Please try again.';
            }
        }

        console.error('Login error:', error);
        return 'An unexpected error occurred. Please try again.';
    }
}
