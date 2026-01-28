import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    // Define a route for listing images
    listingImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await auth();
            if (!session?.user) throw new Error("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;