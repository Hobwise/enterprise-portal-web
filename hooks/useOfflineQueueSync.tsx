'use client';

/**
 * Drains the offline submission queue when connectivity returns.
 *
 * Mounted once in the root layout so a queued order or booking is retried even
 * if the user has navigated away from the page that created it. Flush triggers:
 *
 *   - browser `online` event
 *   - window regaining focus (covers flaky connections that never fire `online`)
 *   - tab becoming visible
 *   - a periodic backstop for captive-portal / silent-drop cases
 *
 * Also exposes a small reactive count so the UI can show a "1 order waiting to
 * send" banner without every component polling localStorage.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flushQueue, pendingCount } from '@/lib/offlineQueue';
import { sendQueuedItem } from '@/lib/submitWithQueue';
import { trackEvent } from '@/lib/posthogAnalytics';

const BACKSTOP_INTERVAL_MS = 60_000;

export const useOfflineQueueSync = () => {
  const [pending, setPending] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const inFlight = useRef(false);
  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    setPending(pendingCount());
  }, []);

  const drain = useCallback(async () => {
    // Guard against overlapping flushes: the online event, focus handler and
    // interval can all fire at once and would replay the same item twice.
    if (inFlight.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    inFlight.current = true;
    try {
      const { synced } = await flushQueue(sendQueuedItem);
      if (synced > 0) {
        trackEvent('queued_submissions_synced', { count: synced });
        refresh();
        // Invalidate the dashboard caches so a page that just came back online
        // isn't stuck showing data from before the queued items were replayed.
        // Only active queries refetch; the rest are simply marked stale.
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
        await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
        await queryClient.invalidateQueries({ queryKey: ['categoryOrders'] });
        await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        await queryClient.invalidateQueries({ queryKey: ['bookingCategories'] });
        await queryClient.invalidateQueries({ queryKey: ['bookingDetails'] });
        await queryClient.invalidateQueries({ queryKey: ['reservation'] });
      }
    } finally {
      inFlight.current = false;
    }
  }, [refresh, queryClient]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    refresh();

    const goOnline = () => {
      setIsOnline(true);
      void drain();
    };
    const goOffline = () => setIsOnline(false);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void drain();
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('focus', drain);
    document.addEventListener('visibilitychange', onVisible);

    // An item may have been left mid-flight by a closed tab.
    void drain();

    const timer = window.setInterval(() => {
      void drain();
    }, BACKSTOP_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('focus', drain);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [drain, refresh]);

  return { pending, isOnline, flushNow: drain };
};
