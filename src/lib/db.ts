import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const createDb = () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        // Return a mock or handle missing URL during build
        console.warn("DATABASE_URL is missing. DB operations will fail at runtime.");
        return drizzle(neon("postgresql://dummy:dummy@localhost:5432/dummy"));
    }
    const sql = neon(url);
    return drizzle(sql);
};

export const db = createDb();
