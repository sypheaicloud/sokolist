import * as dotenv from 'dotenv';
import { Client } from 'pg';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const res = await client.query('SELECT id, title, image_url FROM listings');
        let output = `Database Dump:\n`;
        res.rows.forEach((row) => {
            output += `ID: ${row.id} | Title: ${row.title} | URL: ${row.image_url}\n`;
        });
        fs.writeFileSync('db_dump.txt', output, 'utf8');
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
check();
