"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";

export default function TestUploadPage() {
    const [imageUrl, setImageUrl] = useState("");

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
                <h1 className="text-xl font-bold mb-4">UploadThing Test</h1>

                {!imageUrl ? (
                    <UploadButton
                        endpoint="listingImage"
                        onClientUploadComplete={(res) => {
                            console.log("Files: ", res);
                            setImageUrl(res[0].url);
                            alert("Upload Successful!");
                        }}
                        onUploadError={(error: Error) => {
                            alert(`UPLOAD FAILED: ${error.message}`);
                        }}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="relative h-64 w-full rounded-xl overflow-hidden border border-purple-500">
                            <Image src={imageUrl} alt="Uploaded" fill className="object-cover" />
                        </div>
                        <p className="text-xs text-emerald-400 break-all bg-emerald-500/10 p-2 rounded">
                            URL: {imageUrl}
                        </p>
                        <button
                            onClick={() => setImageUrl("")}
                            className="text-sm text-slate-400 hover:text-white underline"
                        >
                            Try another one
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}