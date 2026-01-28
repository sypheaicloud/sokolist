'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { desc, eq, like, or, and } from 'drizzle-orm';

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
        })
            .from(listings)
            // 🛑 IMPORTANT: Ensure this matches your schema (sellerId vs userId)
            .leftJoin(users, eq(listings.sellerId, users.id));

        const filters = [];

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

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const allListings = await query
            .where(whereClause)
            .orderBy(desc(listings.createdAt));

        // Return a plain object to avoid Next.js serialization issues
        return JSON.parse(JSON.stringify(allListings));
    } catch (error) {
        console.error("Error fetching listings:", error);
        return [];
    }
}