import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
    ? process.env.DATABASE_URL
    : "postgres://placeholder:placeholder@localhost:5432/placeholder";

const sql = neon(connectionString);
export const db = drizzle(sql);
