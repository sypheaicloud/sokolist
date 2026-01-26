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
            // Check for our custom error message relayed through Auth.js
            if (error.cause?.err instanceof Error && error.cause.err.message === 'GOOGLE_ACCOUNT_EXISTS') {
                return 'This account was created with Google. Please click "Continue with Google" to sign in.';
            }

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
