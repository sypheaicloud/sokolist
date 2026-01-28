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
    secret: process.env.AUTH_SECRET,
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
                    const result = await db.select().from(users).where(eq(users.email, email));
                    const user = result[0];

                    if (!user) return null;

                    if (!user.password) {
                        throw new Error("GOOGLE_ACCOUNT_EXISTS");
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            try {
                // 1. Check for existing user first
                const existingUser = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
                const isSystemAdmin = user.email === 'djboziah@gmail.com';

                if (!existingUser[0]) {
                    // 2. New User: Insert safely
                    await db.insert(users).values({
                        id: user.id || uuidv4(),
                        email: user.email,
                        name: user.name || 'User',
                        image: user.image,
                        isVerified: true,
                        isAdmin: isSystemAdmin,
                    });
                } else if (isSystemAdmin && !existingUser[0].isAdmin) {
                    // 3. Existing User is Admin but not marked: Update safely
                    await db.update(users)
                        .set({ isAdmin: true, isVerified: true })
                        .where(eq(users.email, user.email));
                }

                return true;
            } catch (err) {
                console.error('SignIn Callback Error:', err);
                // Return true so they can still log in even if DB sync has a minor hiccup
                return true;
            }
        },
        async jwt({ token, user, trigger, session }) {
            // When user first signs in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.isAdmin = user.email === 'djboziah@gmail.com';
            }

            // Periodically refresh Admin status from DB to stay in sync
            if (!token.isAdmin && token.email) {
                try {
                    const dbUser = await db.select().from(users).where(eq(users.email, token.email as string)).limit(1);
                    token.isAdmin = dbUser[0]?.isAdmin ?? false;
                } catch {
                    token.isAdmin = false;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).isAdmin = !!token.isAdmin;
            }
            return session;
        }
    }
});