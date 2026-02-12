import * as dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

async function revert() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        // Revert "Fresh fruits" to its original URL
        await client.query("UPDATE listings SET image_url = 'https://ahhpmteokk9zs0fr.public.blob.vercel-storage.com/IMG_4945-4EWygUz19E86wHiDw88CDjoX153ODF.jpeg' WHERE title = 'Fresh fruits'");
        console.log('Reverted 1 listing');
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
revert();
