'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { desc, eq, like, or, and, SQL } from 'drizzle-orm';

export async function getListings(searchParams?: { q?: string; category?: string; location?: string }) {
    try {
        // 1. Build the base query
        const query = db.select({
            id: listings.id,
            title: listings.title,
            price: listings.price,
            category: listings.category,
            location: listings.location,
            imageUrl: listings.imageUrl,
            userVerified: users.isVerified,
            isActive: listings.isActive, // Added to track status
        })
            .from(listings)
            .leftJoin(users, eq(listings.userId, users.id));

        // 2. Build filters array
        const filters: (SQL | undefined)[] = [];

        // ✨ ALWAYS filter for active listings on the public page
        filters.push(eq(listings.isActive, true));

        if (searchParams?.q) {
            filters.push(or(
                like(listings.title, `%${searchParams.q}%`),
                like(listings.description, `%${searchParams.q}%`)
            ));
        }

        if (searchParams?.category && searchParams.category !== 'all') {
            filters.push(eq(listings.category, searchParams.category));
        }

        if (searchParams?.location) {
            filters.push(like(listings.location, `%${searchParams.location}%`));
        }

        // 3. Filter out undefined values
        const activeFilters = filters.filter((f): f is SQL => f !== undefined);

        // 4. Execute query
        // Since we now always have at least one filter (isActive), we use .where(and(...))
        const results = await query
            .where(and(...activeFilters))
            .orderBy(desc(listings.id)); // Use ID or createdAt for ordering

        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Error fetching listings:", error);
        return [];
    }
}