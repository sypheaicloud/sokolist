import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

const migrate = async () => {
    console.log('Running manual migration...');

    try {
        // Users table updates
        console.log('Updating users table...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP`);

        // Listings table updates
        console.log('Updating listings table...');
        await db.execute(sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true`);
        await db.execute(sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

migrate();
