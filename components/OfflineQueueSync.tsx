'use client';

/**
 * Global offline-queue UI: mounts the sync loop in the root layout, shows a
 * status pill while submissions are waiting, and flushes the queue once
 * connectivity returns.
 *
 * Queued orders already appear in the normal orders list, where they can be
 * viewed, updated, cancelled and invoiced like any other order. That is the
 * single place staff manage them, so there is no separate offline-orders panel
 * or queued-order editor here — this component only reports status and offers
 * the common actions (send now / retry failed / approve reviewed).
 */

import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useOfflineQueueSync } from '@/hooks/useOfflineQueueSync';

export default function OfflineQueueSync() {
  // The single source of queue state and the single flush loop. Keeping the hook
  // mounted here means a queued order is retried even away from the page that
  // created it.
  const queue = useOfflineQueueSync();
  const {
    pending,
    failed,
    needsReview,
    isOnline,
    flushNow,
    retryAllFailed,
    approveAllQueuedItems,
  } = queue;

  // Nothing queued and back online: render nothing.
  if (pending === 0 && failed === 0 && needsReview === 0 && isOnline) return null;

  const offline = !isOnline;

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
      {(pending > 0 || failed > 0) && (
        <div className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          <HiOutlineClipboardDocumentList className="h-4 w-4" />
          {pending + failed} offline {pending + failed === 1 ? 'order' : 'orders'}
        </div>
      )}

      {needsReview > 0 && (
        // A parked order could not be proven either way, so it is not sent until
        // someone confirms. Approving requeues it; the normal drain sends it.
        <button
          type="button"
          onClick={() => {
            approveAllQueuedItems();
            void flushNow();
          }}
          disabled={!isOnline}
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
        >
          {needsReview} need{needsReview === 1 ? 's' : ''} review — send
        </button>
      )}

      {failed > 0 && (
        // Failed items are never retried on their own: they have exhausted their
        // attempts. One tap requeues them all; per-order fixes happen in the
        // orders list.
        <button
          type="button"
          onClick={() => void retryAllFailed()}
          disabled={!isOnline}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
        >
          {failed} could not be sent — retry
        </button>
      )}

      {offline && (
        <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          Offline — saved locally, will send when back online
        </div>
      )}

      {pending > 0 && isOnline && (
        <button
          type="button"
          onClick={() => void flushNow()}
          className="rounded-full border border-[#5F35D2] bg-white px-4 py-2 text-sm font-semibold text-[#5F35D2] shadow-lg transition hover:bg-[#f5f3ff]"
        >
          Send now
        </button>
      )}
    </div>
  );
}
