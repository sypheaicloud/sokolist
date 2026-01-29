import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
// import { auth } from '@/lib/auth'; 

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                // TEMPORARILY DISABLED AUTH CHECK
                // const session = await auth();
                // if (!session?.user) throw new Error('Unauthorized');

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

                    // ✅ THIS IS THE CORRECT PLACE FOR IT
                    addRandomSuffix: true,

                    tokenPayload: JSON.stringify({
                        // userId: session.user.id, 
                        test: "bypass"
                    }),
                };
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('blob uploaded', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}