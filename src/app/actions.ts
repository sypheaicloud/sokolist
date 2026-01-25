'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { desc, eq, like, or, and } from 'drizzle-orm';

export async function getListings(searchParams?: { q?: string; category?: string; location?: string }) {
    const query = db.select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        category: listings.category,
        location: listings.location,
        imageUrl: listings.imageUrl,
        userVerified: users.isVerified,
    })
        .from(listings)
        .leftJoin(users, eq(listings.userId, users.id));

    const filters = [];
    if (searchParams?.q) {
        filters.push(or(
            like(listings.title, `%${searchParams.q}%`),
            like(listings.description, `%${searchParams.q}%`)
        ));
    }
    if (searchParams?.category && searchParams.category !== 'all') {
        // Handle case sensitivity or normalized category names if needed
        filters.push(eq(listings.category, searchParams.category));
    }
    if (searchParams?.location) {
        filters.push(like(listings.location, `%${searchParams.location}%`));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // @ts-ignore
    const allListings = await query.where(whereClause).orderBy(desc(listings.createdAt));

    return allListings;
}
