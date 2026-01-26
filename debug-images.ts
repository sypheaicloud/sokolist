import { db } from './src/lib/db';
import { listings } from './src/lib/schema';

async function checkListings() {
    console.log("Fetching recent listings to check image URLs...");
    try {
        const results = await db.select().from(listings).limit(5);
        results.forEach(item => {
            console.log(`ID: ${item.id}`);
            console.log(`Title: ${item.title}`);
            console.log(`Image URL: ${item.imageUrl}`);
            console.log('---');
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}

checkListings();
