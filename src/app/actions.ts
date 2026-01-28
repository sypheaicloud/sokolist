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
        })
            .from(listings)
            .leftJoin(users, eq(listings.userId, users.id)); // Matches your schema.ts

        // 2. Build filters array with explicit SQL types
        const filters: (SQL | undefined)[] = [];

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

        // 3. Only apply WHERE if there are actual filters
        const activeFilters = filters.filter((f): f is SQL => f !== undefined);

        let results;
        if (activeFilters.length > 0) {
            results = await query
                .where(and(...activeFilters))
                .orderBy(desc(listings.createdAt));
        } else {
            results = await query
                .orderBy(desc(listings.createdAt));
        }

        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Error fetching listings:", error);
        return [];
    }
}