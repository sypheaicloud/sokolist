import NextAuth from "next-auth";
import { v4 as uuidv4 } from 'uuid';
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    // SQLite 'get' is not directly available in all drizzle drivers, using generic select
                    const result = await db.select().from(users).where(eq(users.email, email));
                    const user = result[0];

                    if (!user) return null;
                    if (!user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Auto-sync Google users to our database since we don't use an adapter
            if (account?.provider === 'google' && user.email) {
                try {
                    const existingUser = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
                    if (!existingUser[0]) {
                        await db.insert(users).values({
                            id: user.id || uuidv4(),
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            isVerified: true, // Google accounts are pre-verified
                            isAdmin: user.email === 'djboziah@gmail.com',
                        });
                    }
                } catch (err) {
                    console.error('Failed to sync Google user to DB:', err);
                }
            }

            if (user?.email === 'djboziah@gmail.com') {
                try {
                    await db.update(users)
                        .set({ isAdmin: true, isVerified: true })
                        .where(eq(users.email, user.email!));
                } catch (err) {
                    console.error('Failed to auto-grant admin in signIn:', err);
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                if (user.email === 'djboziah@gmail.com') {
                    token.isAdmin = true;
                } else {
                    // Check DB for existing users
                    try {
                        const dbUser = await db.select().from(users).where(eq(users.email, user.email!)).limit(1);
                        token.isAdmin = dbUser[0]?.isAdmin ?? false;
                    } catch (e) {
                        token.isAdmin = false;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).isAdmin = token.isAdmin === true;
            }
            return session;
        }
    }
});
