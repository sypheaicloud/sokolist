'use server';

import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// 1. Updated Schema: Now expects a text URL string, not a File object
const CreateListingSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    category: z.string().min(1, "Please select a category"),
    location: z.string().min(2, "Location is required"),
    imageUrl: z.string().optional().nullable(), // <--- The big change
});

export type CreateListingState = {
    errors?: {
        title?: string[];
        description?: string[];
        price?: string[];
        category?: string[];
        location?: string[];
        imageUrl?: string[];
    };
    message?: string;
} | undefined;

export async function createListing(prevState: CreateListingState, formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        return { message: "You must be logged in to post an ad." };
    }

    // 2. Validate the form data (reading 'imageUrl' instead of 'image')
    const validatedFields = CreateListingSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        location: formData.get('location'),
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { title, description, price, category, location, imageUrl } = validatedFields.data;

    try {
        // 3. Save directly to DB (The URL is already uploaded by the time we get here)
        await db.insert(listings).values({
            id: uuidv4(),
            title,
            description,
            price,
            category,
            location,
            userId: session.user.id,
            imageUrl: imageUrl || null, // Saves the Vercel Blob URL
            createdAt: new Date(),
        });

        revalidatePath('/');
    } catch (error) {
        console.error("[POST_AD] Database Error:", error);
        return {
            message: 'An error occurred while creating your listing.',
        };
    }

    redirect('/');
}