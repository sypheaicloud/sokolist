import * as dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

async function fix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const res = await client.query("UPDATE listings SET image_url = 'https://ahhpmteokk9zs0fr.public.blob.vercel-storage.com/IMG_4945-4EWygUz19E86wHiDw88CDjoX153ODF.jpeg' WHERE id = '12b75fa1-5197-4029-b4e9-a4b58ca2993d'");
        console.log('Update result:', res.rowCount);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
fix();
