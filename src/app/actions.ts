'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { desc, eq, ilike, or, and, SQL } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
// 👇 1. IMPORT THIS TO FIX THE ID ERROR
import { randomUUID } from 'crypto';

// --- GET LISTINGS (Your existing code) ---
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

        filters.push(eq(listings.isActive, true));

        if (searchParams?.q) {
            filters.push(or(
                ilike(listings.title, `%${searchParams.q}%`),
                ilike(listings.description, `%${searchParams.q}%`),
                ilike(listings.category, `%${searchParams.q}%`)
            ));
        }

        if (searchParams?.category && searchParams.category !== 'all') {
            filters.push(ilike(listings.category, `%${searchParams.category}%`));
        }

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

// --- 👇 THIS IS THE FUNCTION THAT FIXES YOUR ERROR ---
export async function createListing(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error('Not authenticated');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await db.insert(listings).values({
        // ✅ THE FIX: We manually generate the ID here
        id: randomUUID(),

        title,
        description,
        price,
        category,
        location,
        imageUrl,
        userId: session.user.id,
        createdAt: new Date(),
        isActive: true, // Ensuring the ad is visible immediately
    });

    revalidatePath('/');
    redirect('/');
}