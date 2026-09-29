'use client';

/**
 * Global offline-queue UI: mounts the sync loop in the root layout, shows a
 * small status pill while submissions are waiting, and flushes the queue once
 * connectivity returns.
 */

import { useOfflineQueueSync } from '@/hooks/useOfflineQueueSync';

export default function OfflineQueueSync() {
  const { pending, isOnline, flushNow } = useOfflineQueueSync();

  if (pending === 0 && isOnline) return null;

  const offline = !isOnline;

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
      {pending > 0 && (
        <button
          type="button"
          onClick={() => void flushNow()}
          className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              offline ? 'bg-red-200' : 'animate-pulse bg-white'
            }`}
          />
          {pending} queued — tap to sync
        </button>
      )}
      {offline && (
        <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          Offline — saved locally, will send when back online
        </div>
      )}
    </div>
  );
}