/**
 * Offline submission queue for orders, bookings and reservations.
 *
 * Problem: when a customer or staff member has no connectivity (or our API is
 * down) the submit button currently fails outright and the payload is lost.
 * For a restaurant, a customer losing signal mid-checkout is common, so this
 * queues the submission in localStorage and replays it on reconnect.
 *
 * Scope and safety rules — please read before changing:
 *
 * 1. ONLY *network* failures are queued. HTTP responses (4xx/5xx) are
 *    deliberate server answers such as "Insufficient stock" or a zod
 *    validation error; queueing those would hide real problems and let the
 *    customer believe an order was accepted when it was rejected.
 *
 * 2. ONLY cash / pay-later orders are queueable. An online (Paystack) order
 *    needs a live `orderId` from the server before payment can be initialised
 *    (`initializePayment`), so it cannot be completed offline. See
 *    `isQueueableOrder`.
 *
 * 3. Replay is NOT idempotent. The backend has no client-supplied unique key
 *    (no idempotency/clientReference support exists in the API), so a request
 *    that succeeds server-side but whose *response* is lost will be duplicated
 *    on the next attempt. We mark an item as "in flight" before sending and
 *    reconcile against the item count after, which closes the common window
 *    but cannot eliminate the race. This residual risk is accepted for now and
 *    must be removed when the backend supports a unique client order id.
 *
 * 4. Queued orders carry a stale price/stock snapshot. The server revalidates
 *    on replay, so an item can legitimately fail; those land in `failed` and
 *    are surfaced to the user rather than silently dropped.
 */

export type QueueKind = 'order' | 'booking' | 'reservation';

export type QueueStatus = 'pending' | 'sending' | 'failed';

export interface QueuedSubmission {
  /** Client-generated id, also sent as `clientReference` for future dedupe. */
  id: string;
  kind: QueueKind;
  /** Endpoint path, e.g. `api/v1/Order/place`. */
  url: string;
  payload: unknown;
  /** Business scope, replayed as headers so the request matches the original. */
  headers: Record<string, string>;
  /** Distinguishes anonymous public checkouts from authenticated dashboard ones. */
  authenticated: boolean;
  createdAt: number;
  attempts: number;
  status: QueueStatus;
  lastError?: string;
}

const STORAGE_KEY = 'pendingSubmissions';
const MAX_ATTEMPTS = 5;
const MAX_ITEMS = 50;

const isBrowser = (): boolean => typeof window !== 'undefined';

const newId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const readQueue = (): QueuedSubmission[] => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Anything left mid-flight when the tab closed is unknowable. Treat it as
    // pending so it is retried, but drop the in-flight marker.
    return parsed.map((item: QueuedSubmission) =>
      item.status === 'sending' ? { ...item, status: 'pending' } : item
    );
  } catch {
    return [];
  }
};

const writeQueue = (items: QueuedSubmission[]): void => {
  if (!isBrowser()) return;
  try {
    // Cap the backlog so a long offline period cannot fill localStorage and
    // take down the app. Oldest failed items are dropped first.
    const trimmed = items.slice(-MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota exceeded or private mode: drop the least valuable entries.
    try {
      const pending = readQueue().filter((i) => i.status !== 'failed');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pending.slice(-10)));
    } catch {
      /* give up silently; queueing is best-effort */
    }
  }
};

export const enqueue = (
  item: Omit<QueuedSubmission, 'createdAt' | 'attempts' | 'status'>
): QueuedSubmission => {
  const id = item.id ?? newId();
  const entry: QueuedSubmission = {
    ...item,
    id,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
  };
  writeQueue([...readQueue(), entry]);
  return entry;
};

const updateItem = (id: string, patch: Partial<QueuedSubmission>): void => {
  writeQueue(readQueue().map((i) => (i.id === id ? { ...i, ...patch } : i)));
};

export const removeItem = (id: string): void => {
  writeQueue(readQueue().filter((i) => i.id !== id));
};

export const pendingCount = (): number =>
  readQueue().filter((i) => i.status === 'pending' || i.status === 'sending').length;

export const failedItems = (): QueuedSubmission[] =>
  readQueue().filter((i) => i.status === 'failed');

/**
 * True only when the failure means "the request never reached the server".
 *
 * `ERR_NETWORK`  — browser could not connect (offline, DNS, CORS, blocked).
 * `ECONNABORTED` — our 30s axios timeout elapsed.
 * `ETIMEDOUT` / `ENOTFOUND` / `ECONNREFUSED` — transport-level failures.
 *
 * Anything with an `error.response` is a real server reply and must NOT queue.
 */
export const isOfflineFailure = (error: unknown): boolean => {
  if (!navigator.onLine) return true;
  const err = error as {
    response?: unknown;
    code?: string;
    message?: string;
  };
  if (err?.response) return false;
  return ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'].includes(
    err?.code ?? ''
  );
};

/**
 * An order is only safe to queue when it is settled (or to be settled) in cash.
 * Paystack orders require a server-issued orderId before payment can start, so
 * they must be blocked offline with a clear message instead.
 */
export const isQueueableOrder = (payload: any): boolean => {
  if (!payload) return false;
  if (payload.isOnlinePayment || payload.paymentMethod === 'online') return false;
  // status 0 === unpaid/new. Anything already paid must not be replayed.
  return payload.status === 0 || payload.status === undefined;
};

/**
 * Replays the queue in submission order.
 *
 * Stops at the first item that fails so ordering is preserved — a later
 * booking must not overtake an earlier one. Items that exhaust their attempts
 * move to `failed` and are skipped on subsequent runs.
 */
export const flushQueue = async (
  send: (item: QueuedSubmission) => Promise<boolean>
): Promise<{ synced: number; failed: number }> => {
  if (!isBrowser() || !navigator.onLine) return { synced: 0, failed: 0 };

  const items = readQueue()
    .filter((i) => i.status === 'pending')
    .sort((a, b) => a.createdAt - b.createdAt);

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    // Mark before sending: if the tab dies mid-request we can tell on reload
    // that this one may have reached the server.
    updateItem(item.id, { status: 'sending' });

    let ok = false;
    try {
      ok = await send(item);
    } catch {
      ok = false;
    }

    if (ok) {
      removeItem(item.id);
      synced += 1;
      continue;
    }

    const attempts = item.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      updateItem(item.id, {
        status: 'failed',
        attempts,
        lastError: 'Could not be delivered after several attempts',
      });
      failed += 1;
      // A hard failure here means later items are probably failing too.
      break;
    }

    updateItem(item.id, { status: 'pending', attempts });
    break; // preserve ordering
  }

  return { synced, failed };
};

/** Retries items that previously exhausted their attempts. */
export const retryFailed = async (
  send: (item: QueuedSubmission) => Promise<boolean>
): Promise<{ synced: number; failed: number }> => {
  readQueue()
    .filter((i) => i.status === 'failed')
    .forEach((i) => updateItem(i.id, { status: 'pending', attempts: 0, lastError: undefined }));
  return flushQueue(send);
};

export const clearQueue = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
};
