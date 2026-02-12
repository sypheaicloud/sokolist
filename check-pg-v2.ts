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
        const res = await client.query('SELECT * FROM listings');
        let output = `Total listings: ${res.rows.length}\n`;
        res.rows.forEach((row, i) => {
            output += `${i + 1}. [${row.title}] -> ${row.image_url}\n`;
        });
        fs.writeFileSync('listings_output.txt', output, 'utf8');
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}
check();
