'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  capturePageview,
  identifyUser,
  initPostHog,
} from '@/lib/posthogAnalytics';

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Survives StrictMode double-invocation so the same route is never counted
  // twice for one render.
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    initPostHog();
    // Re-attach the person profile on reload/hard navigation, where the
    // in-memory identity from the login callback is gone but localStorage isn't.
    identifyUser();
  }, []);

  useEffect(() => {
    // App Router transitions never reload the document, so autocapture alone
    // would only ever report the entry page.
    if (!pathname || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    capturePageview();
  }, [pathname]);

  return <>{children}</>;
}
