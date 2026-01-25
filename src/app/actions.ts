'use server';

import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function getListings() {
    const allListings = await db.select().from(listings).orderBy(desc(listings.createdAt));
    return allListings;
}
