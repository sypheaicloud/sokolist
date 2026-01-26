import { auth } from './auth';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function isAdmin(): Promise<boolean> {
    const session = await auth();

    if (!session?.user?.email) {
        return false;
    }

    // Check if user is admin
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);

    if (!user[0]) {
        return false;
    }

    return user[0].isAdmin === true;
}

export async function requireAdmin() {
    const admin = await isAdmin();

    if (!admin) {
        throw new Error('Unauthorized: Admin access required');
    }
}
