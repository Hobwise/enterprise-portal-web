'use client';

/**
 * Reactive view of the offline submission queue, plus the sync loop.
 *
 * Mounted once in the root layout so a queued order or booking is retried even
 * if the user has navigated away from the page that created it. Flush triggers:
 *
 *   - browser `online` event
 *   - window regaining focus (covers flaky connections that never fire `online`)
 *   - tab becoming visible
 *   - a periodic backstop for captive-portal / silent-drop cases
 *
 * The queue lives in localStorage and has no other source of truth, so this hook
 * re-reads it after every mutation and on a storage event (another tab editing or
 * discarding an order). That is what keeps the status pill and the queued rows in
 * the orders list in step with the queue.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  approveAllQueuedItems,
  approveQueuedItems,
  deleteQueuedItem,
  flushQueue,
  getQueueItems,
  recoverStaleInFlight,
  retryFailed,
  updateQueuedItem,
  type QueuedSubmission,
  type QueuedSubmissionLocal,
} from '@/lib/offlineQueue';
import { sendQueuedItem } from '@/lib/submitWithQueue';
import { queuedOrderViews, type QueuedOrderPayload } from '@/lib/queuedOrder';
import { getOrder, getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { trackEvent } from '@/lib/posthogAnalytics';

const BACKSTOP_INTERVAL_MS = 60_000;

export const useOfflineQueueSync = () => {
  const [items, setItems] = useState<QueuedSubmission[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const inFlight = useRef(false);
  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    setItems(getQueueItems());
  }, []);

  /** Orders only — the list and the offline invoice are both order-scoped. */
  const orders = useMemo(() => queuedOrderViews(items), [items]);
  const pending = useMemo(
    () => items.filter((i) => i.status === 'pending' || i.status === 'sending').length,
    [items]
  );
  const failed = useMemo(() => items.filter((i) => i.status === 'failed').length, [items]);
  const needsReview = useMemo(
    () => items.filter((i) => i.status === 'needs-review').length,
    [items]
  );

  const invalidateOrders = useCallback(async () => {
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
  }, [queryClient]);

  const drain = useCallback(async () => {
    if (inFlight.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    inFlight.current = true;
    try {
      const businessInformation = getJsonItemFromLocalStorage('business');
      const businessId = businessInformation?.[0]?.businessId as string | undefined;

      const { synced, skipped, needsReview, failed: resFailed } = await flushQueue({
        send: sendQueuedItem,
        reconcile: async (item) => {
          const payload = (item.payload ?? {}) as QueuedOrderPayload;
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

          try {
            const list = await getOrderByBusiness(
              businessId ?? '',
              1,
              50,
              payload.quickResponseID ? undefined : 'All',
              0,
              startOfToday.toISOString(),
              endOfToday.toISOString()
            );

            const rows = (list?.data?.orderCategories?.[0]?.orders ??
              list?.data?.orders ??
              []) as any[];

            const getOrderLines = async (row: any) => {
              if (!row?.id && !row?.reference) return null;
              try {
                const details = await getOrder(row.id || row.reference, businessId);
                return (details?.data?.data?.orderDetails ??
                  details?.data?.orderDetails ??
                  null) as any[] | null;
              } catch {
                return null;
              }
            };

            const { reconcileOrder } = await import('@/lib/orderReconcile');
            const res = await reconcileOrder(payload, item.createdAt, {
              listRecentOrders: async () => rows as any[],
              getOrderLines,
            });
            return res;
          } catch {
            return { verdict: 'inconclusive' as const };
          }
        },
      });
      refresh();
      if (synced > 0 || skipped > 0 || needsReview > 0 || resFailed > 0) {
        trackEvent('queued_submissions_synced', {
          count: synced,
          skipped,
          needsReview,
          failed: resFailed,
        });
      }
      if (synced > 0) {
        await invalidateOrders();
      }
    } finally {
      inFlight.current = false;
    }
  }, [refresh, invalidateOrders]);

  /**
   * Rewrites a queued order and re-arms it for delivery.
   *
   * `updateQueuedItem` already lifts an exhausted item back to `pending`, which
   * is the behaviour we want after a correction: the user fixed it, so it gets
   * another go. Returns the queue entry that was stored, or null when the item
   * was unknown or already in flight.
   */
  const updateOrder = useCallback(
    (
      id: string,
      edits: {
        payload?: Record<string, any>;
        local?: QueuedSubmissionLocal;
      }
    ): boolean => {
      const updated = updateQueuedItem(id, edits);
      refresh();
      if (updated) {
        trackEvent('queued_submission_edited', { kind: updated.kind });
        // Corrected data is ready to go; don't wait for the next connectivity
        // tick if we are online right now.
        if (typeof navigator !== 'undefined' && navigator.onLine) void drain();
      }
      return Boolean(updated);
    },
    [refresh, drain]
  );

  /** Discards one queued submission. */
  const discardOrder = useCallback(
    (id: string) => {
      const removed = deleteQueuedItem(id);
      refresh();
      if (removed) trackEvent('queued_submission_discarded');
      return removed;
    },
    [refresh]
  );

  /** Re-queues everything that exhausted its attempts, then drains. */
  const retryAllFailed = useCallback(async () => {
    await retryFailed({ send: sendQueuedItem });
    refresh();
    await invalidateOrders();
  }, [refresh, invalidateOrders]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    // Anything still marked `sending` is left over from a closed tab. Re-queue it
    // before the first flush; see `recoverStaleInFlight` for why this is not done
    // on every read.
    recoverStaleInFlight();
    refresh();

    const goOnline = () => {
      setIsOnline(true);
      void drain();
    };
    const goOffline = () => setIsOnline(false);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void drain();
    };
    // Another tab (or an older build) touching the same localStorage key must
    // not leave this panel showing a stale list.
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'pendingSubmissions' || event.key === null) refresh();
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('focus', drain);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('storage', onStorage);

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
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, [drain, refresh]);

  return {
    /** Every queued submission, oldest first. */
    items,
    /** The subset that are orders, projected for display. */
    orders,
    pending,
    failed,
    needsReview,
    isOnline,
    flushNow: drain,
    updateOrder,
    discardOrder,
    retryAllFailed,
    approveAllQueuedItems,
    approveQueuedItems,
  };
};