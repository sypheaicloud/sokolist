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
        const res = await client.query('SELECT title, is_active, image_url FROM listings');
        let output = `Total listings: ${res.rows.length}\n`;
        res.rows.forEach((row, i) => {
            output += `${i + 1}. [${row.title}] -> Active: ${row.is_active}, Image: ${row.image_url}\n`;
        });
        fs.writeFileSync('listings_active_check.txt', output, 'utf8');
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
check();
