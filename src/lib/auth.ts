import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;

                // Automatically make djboziah@gmail.com an admin
                if (session.user.email === 'djboziah@gmail.com') {
                    // Update session object
                    (session.user as any).isAdmin = true;

                    // Update database (fire and forget)
                    db.update(users)
                        .set({ isAdmin: true, isVerified: true })
                        .where(eq(users.email, session.user.email))
                        .execute().catch(err => console.error('Failed to auto-grant admin:', err));
                }
            }
            return session;
        }
    }
});
