'use server';

import { db } from '@/lib/db';
import { listings } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const CreateListingSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    category: z.string().min(1, "Please select a category"),
    location: z.string().min(2, "Location is required"),
    image: z.any()
        .refine((file) => {
            if (!file || file === 'null') return true;
            return typeof file === 'object' && 'size' in file && (file as { size: number }).size <= MAX_FILE_SIZE;
        }, `Max image size is 5MB.`)
        .refine((file) => {
            if (!file || file === 'null') return true;
            return typeof file === 'object' && 'type' in file && ACCEPTED_IMAGE_TYPES.includes((file as { type: string }).type);
        }, "Only .jpg, .jpeg, .png and .webp formats are supported.")
        .optional().or(z.literal('null')),
});

export type CreateListingState = {
    errors?: {
        title?: string[];
        description?: string[];
        price?: string[];
        category?: string[];
        location?: string[];
        image?: string[];
    };
    message?: string;
} | undefined;

export async function createListing(prevState: CreateListingState, formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        return { message: "You must be logged in to post an ad." };
    }

    const imageFile = formData.get('image');

    // Check if we have a valid file with content
    const isFile = !!(imageFile && typeof imageFile === 'object' && 'size' in imageFile);
    const hasImage = isFile && (imageFile as { size: number }).size > 0;
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    console.log('[POST_AD] Environment Check:', { hasToken });
    console.log('[POST_AD] Image Debug:', {
        exists: !!imageFile,
        isFile,
        size: isFile ? (imageFile as { size: number }).size : 'N/A',
    });

    const validatedFields = CreateListingSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        location: formData.get('location'),
        image: hasImage ? imageFile : 'null',
    });

    if (!validatedFields.success) {
        console.log('[POST_AD] Validation Failed:', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { title, description, price, category, location, image } = validatedFields.data;

    let imageUrl = null;

    try {
        // Handle image upload if a file was provided
        if (hasImage && image && image !== 'null' && hasToken) {
            console.log('[POST_AD] Attempting Vercel Blob upload...');
            const finalImage = image as unknown as File;
            const blob = await put(`listings/${uuidv4()}-${finalImage.name || 'image'}`, finalImage, {
                access: 'public',
            });
            imageUrl = blob.url;
            console.log('[POST_AD] Upload successful:', imageUrl);
        } else if (hasImage && !hasToken) {
            console.warn('[POST_AD] Warning: Image provided but BLOB_READ_WRITE_TOKEN is missing!');
        } else {
            console.log('[POST_AD] No image to upload.');
        }

        console.log('[POST_AD] Saving to DB with imageUrl:', imageUrl);
        await db.insert(listings).values({
            id: uuidv4(),
            title,
            description,
            price,
            category,
            location,
            userId: session.user.id,
            imageUrl: imageUrl,
            createdAt: new Date(),
        });

        revalidatePath('/');
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("[POST_AD] Fatality Error:", error);
        return {
            message: 'An error occurred while creating your listing. Please try again.',
        };
    }

    redirect('/');
}
