import { db } from './src/lib/db';
import { users } from './src/lib/schema';
import { eq } from 'drizzle-orm';

const setAdmin = async () => {
    const email = 'djboziah@gmail.com';
    console.log(`Setting ${email} as admin...`);

    try {
        const result = await db.update(users)
            .set({ isAdmin: true, isVerified: true })
            .where(eq(users.email, email));

        console.log('Admin role granted successfully!');
    } catch (error) {
        console.error('Error granting admin role:', error);
    }
};

setAdmin();
