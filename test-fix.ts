import * as dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

async function fix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        // Update first listing to use local logo
        await client.query("UPDATE listings SET image_url = '/logo.png' WHERE id IN (SELECT id FROM listings LIMIT 1)");
        console.log('Updated 1 listing to use local logo');
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
fix();
