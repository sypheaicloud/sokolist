import { auth as middleware } from "@/lib/auth";

export default middleware((req) => {
    // We are not adding any custom logic here, 
    // just letting the auth wrapper handle the session.
});

export const config = {
    // This is the most important part. 
    // It tells Next.js to COMPLETELY IGNORE the uploadthing API.
    matcher: [
        "/((?!api/uploadthing|_next/static|_next/image|favicon.ico).*)",
    ],
};