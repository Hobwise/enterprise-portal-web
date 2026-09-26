'use client';

import { useEffect } from 'react';
import { identifyUser, initPostHog } from '@/lib/posthogAnalytics';

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPostHog();
    // Re-attach the person profile on reload/hard navigation, where the
    // in-memory identity from the login callback is gone but localStorage isn't.
    identifyUser();
  }, []);

  return <>{children}</>;
}
