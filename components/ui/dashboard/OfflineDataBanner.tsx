'use client';

import { MdOutlineWifiOff, MdRefresh } from 'react-icons/md';

interface OfflineDataBannerProps {
  /**
   * Show the notice. Pages set it when the fetch failed (usually because the
   * network dropped) but stale data from a previous successful load is still
   * on screen.
   */
  visible: boolean;
  /** Timestamp (ms) of the last successful data load, from `dataUpdatedAt`. */
  dataUpdatedAt?: number;
  onRetry: () => void;
}

/**
 * Amber notice shown when a page is failing to reach the server but is still
 * displaying previously loaded data. Replaces the old silent behaviour where
 * an offline dashboard announced "No orders found".
 */
const OfflineDataBanner = ({
  visible,
  dataUpdatedAt,
  onRetry,
}: OfflineDataBannerProps) => {
  if (!visible) return null;

  const time =
    dataUpdatedAt && dataUpdatedAt > 0
      ? new Date(dataUpdatedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <div className="flex items-center gap-2">
        <MdOutlineWifiOff className="h-4 w-4 shrink-0" />
        <span>
          {time
            ? `You're offline — showing data from ${time}. It may be out of date.`
            : "You're offline — showing data loaded earlier. It may be out of date."}
        </span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
      >
        <MdRefresh className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
};

export default OfflineDataBanner;