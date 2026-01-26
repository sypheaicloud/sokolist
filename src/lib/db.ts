import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL || "postgres://db_user:db_pass@db_host:5432/db_name";
const sql = neon(connectionString);
export const db = drizzle(sql);
