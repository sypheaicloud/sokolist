export { auth as middleware } from "@/lib/auth";

export const config = {
    // We explicitly tell the middleware to IGNORE api/uploadthing
    matcher: ["/((?!api/uploadthing|_next/static|_next/image|favicon.ico).*)"],
};