import * as dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM listings');
        console.log(`Total listings: ${res.rows.length}`);
        res.rows.forEach((row, i) => {
            console.log(`${i + 1}. [${row.title}] -> ${row.image_url}`);
        });
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
check();
