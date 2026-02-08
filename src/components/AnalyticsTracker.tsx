'use client';

import { useEffect } from 'react';
import { trackVisit } from '@/app/actions';

export default function AnalyticsTracker() {
    useEffect(() => {
        // Track the visit only once when the component mounts
        trackVisit();
    }, []);

    return null;
}
