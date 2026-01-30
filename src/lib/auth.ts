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
                // 1. Check for existing user
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
                    // 3. Update Admin status if needed
                    await db.update(users)
                        .set({ isAdmin: true, isVerified: true })
                        .where(eq(users.email, user.email));
                }

                return true;
            } catch (err) {
                console.error('SignIn Callback Error:', err);
                return true;
            }
        },
        async jwt({ token, user, trigger, session }) {
            // 🛑 CRITICAL FIX: ALWAYS SYNC WITH DATABASE ID
            // Don't trust the ID on the token blindly. The DB is the source of truth.

            if (token.email) {
                try {
                    const dbUser = await db.select().from(users).where(eq(users.email, token.email as string)).limit(1);
                    if (dbUser[0]) {
                        // ✅ FORCE the Token ID to match the Database ID
                        token.id = dbUser[0].id;
                        token.isAdmin = dbUser[0].isAdmin;
                    }
                } catch (error) {
                    console.error("Error syncing token with DB:", error);
                }
            }

            // Initial sign in fallback (only runs if DB lookup failed above)
            if (user && !token.id) {
                token.id = user.id;
                token.email = user.email;
                token.isAdmin = user.email === 'djboziah@gmail.com';
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                // Pass the robust ID to the session
                session.user.id = token.id as string;
                (session.user as any).isAdmin = !!token.isAdmin;
            }
            return session;
        }
    }
});