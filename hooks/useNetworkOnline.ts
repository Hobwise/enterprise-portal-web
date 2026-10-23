'use client';

import { useEffect, useState } from 'react';

/**
 * Reactive `navigator.onLine`.
 *
 * `isNetworkOnline()` is the synchronous check for code running inside a
 * callback (a prefetch loop, a hover handler). Components that need to react to
 * a connection change — resuming the section preloading the moment the user
 * comes back online — use this hook instead.
 *
 * Same detection as `useOfflineQueueSync`, so the UI, the offline queue and the
 * prefetch gates all agree on when the app is offline.
 */
const useNetworkOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkOnline;
