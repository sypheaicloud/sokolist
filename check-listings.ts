import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/lib/db';

import { listings } from './src/lib/schema';

async function checkListings() {
    const allListings = await db.select().from(listings);
    console.log(JSON.stringify(allListings, null, 2));
}

checkListings();
