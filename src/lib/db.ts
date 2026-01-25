import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is missing.");
}

// Support for local dev
if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost/db' });
export const db = drizzle(pool);
