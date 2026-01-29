import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { createListing } from "./actions"; // Imports from the code above

export default async function PostAdPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white">Post an Ad</h1>
                <p className="text-slate-400">Reach thousands of buyers in Kenya instantly.</p>
            </div>

            {/* Connects the form to the Create Listing action */}
            <ListingForm action={createListing} />
        </div>
    );
}