import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/lib/db';
import { listings } from './src/lib/schema';

async function checkListings() {
    console.log("Listing ALL Image URLs in the database...");
    try {
        const results = await db.select().from(listings);
        console.log(`Total listings: ${results.length}`);
        results.forEach((item, i) => {
            console.log(`${i + 1}. [${item.title}] -> ${item.imageUrl || 'NULL'}`);
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}

checkListings();
