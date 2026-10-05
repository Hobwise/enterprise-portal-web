'use client';

/**
 * Global offline-queue UI: mounts the sync loop in the root layout, shows a
 * status pill while submissions are waiting, and flushes the queue once
 * connectivity returns.
 *
 * The pill doubles as the entry point to the offline orders panel. A count alone
 * was not actionable: staff could not see what they had taken, could not correct
 * a mistake, and could not print a receipt for an order that had not reached the
 * server. Tapping it now opens the panel, where all three are possible.
 */

import { useState } from 'react';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useOfflineQueueSync } from '@/hooks/useOfflineQueueSync';
import OfflineQueuePanel from './offline/OfflineQueuePanel';

export default function OfflineQueueSync() {
  // The single source of queue state and the single flush loop. Everything the
  // panel needs is passed down rather than re-reading the hook, so two flush
  // loops can never race and replay an order twice.
  const queue = useOfflineQueueSync();
  const { pending, failed, isOnline, flushNow } = queue;
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Nothing queued and back online: render nothing.
  if (pending === 0 && failed === 0 && isOnline) return null;

  const offline = !isOnline;

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
        {(pending > 0 || failed > 0) && (
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600"
          >
            <HiOutlineClipboardDocumentList className="h-4 w-4" />
            {pending + failed} offline {pending + failed === 1 ? 'order' : 'orders'}
            {offline ? '' : ' — tap to manage'}
          </button>
        )}

        {failed > 0 && (
          // Failed items are never retried on their own: they have exhausted
          // their attempts and need a decision, so they go through the panel
          // rather than silently looping in the background.
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            {failed} could not be sent — review
          </button>
        )}

        {offline && (
          <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            Offline — saved locally, will send when back online
          </div>
        )}

        {/* Manual retry, kept separate from the panel so the common case
            (connection is back, just send it) stays one tap. */}
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

      <OfflineQueuePanel
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        items={queue.items}
        orders={queue.orders}
        pending={queue.pending}
        failed={queue.failed}
        needsReview={queue.needsReview}
        isOnline={queue.isOnline}
        flushNow={flushNow}
        retryAllFailed={queue.retryAllFailed}
        updateOrder={queue.updateOrder}
        discardOrder={queue.discardOrder}
        approveAllQueuedItems={queue.approveAllQueuedItems}
      />
    </>
  );
}