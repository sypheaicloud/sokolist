'use client';

import { useState } from 'react';
import { sendMessage } from '@/lib/actions/messages';
import { useRouter } from 'next/navigation';

interface ContactSellerButtonProps {
    listingId: string;
    sellerId: string;
    senderId: string; // The logged-in user
}

export default function ContactSellerButton({
    listingId,
    sellerId,
    senderId
}: ContactSellerButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // If the user is looking at their own listing, don't show the button
    if (senderId === sellerId) return null;

    const handleContact = async () => {
        setLoading(true);
        try {
            const result = await sendMessage({
                senderId,
                receiverId: sellerId,
                listingId,
                content: "Hi! Is this still available?", // Default first message
            });

            if (result.success) {
                // Redirect to the messages page once the chat is created
                router.push(`/messages/${result.conversationId}`);
            }
        } catch (error) {
            console.error("Failed to start conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleContact}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400"
        >
            {loading ? 'Starting Chat...' : 'Contact Seller'}
        </button>
    );
}