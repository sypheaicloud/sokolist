'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { desc, eq, ilike, or, and, SQL } from 'drizzle-orm';

export async function getListings(searchParams?: { q?: string; category?: string; location?: string }) {
    try {
        const query = db.select({
            id: listings.id,
            title: listings.title,
            price: listings.price,
            category: listings.category,
            location: listings.location,
            imageUrl: listings.imageUrl,
            userVerified: users.isVerified,
            isActive: listings.isActive,
        })
            .from(listings)
            .leftJoin(users, eq(listings.userId, users.id));

        const filters: (SQL | undefined)[] = [];

        // 1. ALWAYS filter for active listings
        filters.push(eq(listings.isActive, true));

        // 2. Universal Text Search (Search Title OR Description OR Category)
        if (searchParams?.q) {
            filters.push(or(
                ilike(listings.title, `%${searchParams.q}%`),
                ilike(listings.description, `%${searchParams.q}%`),
                ilike(listings.category, `%${searchParams.q}%`) // Now checks category too!
            ));
        }

        // 3. Category Sidebar Search
        if (searchParams?.category && searchParams.category !== 'all') {
            // Using % on both sides makes "Service" match "Services" 
            // and ilike makes it case-insensitive
            filters.push(ilike(listings.category, `%${searchParams.category}%`));
        }

        // 4. Location Search
        if (searchParams?.location) {
            filters.push(ilike(listings.location, `%${searchParams.location}%`));
        }

        const activeFilters = filters.filter((f): f is SQL => f !== undefined);

        const results = await query
            .where(and(...activeFilters))
            .orderBy(desc(listings.id));

        return JSON.parse(JSON.stringify(results));

    } catch (error) {
        console.error("Error fetching listings:", error);
        return [];
    }
}