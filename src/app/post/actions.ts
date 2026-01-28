'use server';

import { db } from '@/lib/db';
import { listings, users } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

export async function createListing(prevState: any, formData: FormData) {
    console.log("--- DIAGNOSTIC START ---");

    // Check if the Vercel Token is actually reaching the code
    console.log("1. BLOB_TOKEN exists in env:", !!process.env.BLOB_READ_WRITE_TOKEN);

    const session = await auth();

    // 1. Session Protection
    if (!session?.user?.id) {
        console.log("2. Session Error: No User ID");
        return { message: "You must be logged in to post an ad." };
    }

    // 2. Image Validation & Upload
    const imageFile = formData.get('image') as File;
    console.log("3. File details:", {
        name: imageFile?.name,
        size: imageFile?.size,
        type: imageFile?.type
    });

    if (!imageFile || imageFile.size === 0) {
        return { message: "Please select an image to upload." };
    }

    const sessionUserId = session.user.id;
    const userEmail = session.user.email;

    try {
        console.log("4. Attempting Vercel Blob put...");
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
        });
        console.log("5. Blob upload success. URL:", blob.url);

        // 3. User Sync Logic
        console.log("6. Syncing user with DB...");
        const userExists = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);
        let finalUserId = sessionUserId;

        if (userExists.length === 0 && userEmail) {
            const userByEmail = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
            if (userByEmail.length > 0) {
                finalUserId = userByEmail[0].id;
            } else {
                await db.insert(users).values({
                    id: sessionUserId,
                    email: userEmail,
                    name: session.user.name || "User",
                });
            }
        }

        // 4. Save the Listing to DB
        console.log("7. Inserting listing into database...");
        await db.insert(listings).values({
            id: uuidv4(),
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            category: formData.get("category") as string,
            location: formData.get("location") as string,
            imageUrl: blob.url,
            userId: finalUserId,
            isApproved: true,
            isActive: true,
        });

        console.log("8. DB Success. Revalidating paths...");
        revalidatePath("/");
        revalidatePath("/dashboard");

    } catch (error: any) {
        // This will print the FULL error details in Vercel
        console.error("--- CRITICAL ERROR ---");
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));

        return { message: `Error: ${error.message || "Could not save listing."}` };
    }

    console.log("9. Redirecting to home...");
    redirect("/");
}