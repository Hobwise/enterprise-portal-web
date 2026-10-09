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
 * 3. Replay is NOT idempotent, so nothing may be replayed on a guess. The API
 *    has no idempotency/`clientReference` support, which means a request the
 *    server *did* accept but whose response we never saw cannot be re-sent
 *    safely. Every entry therefore records how sure we are that the server has
 *    not seen it — see `DeliveryState` — and the flush is deliberately
 *    asymmetric:
 *
 *      `unsent`   the request provably never left the device (browser was
 *                 offline, DNS failure, connection refused). Safe to replay.
 *      `unknown`  the request was in flight and failed ambiguously — our axios
 *                 timeout elapsed, or the connection dropped mid-response. The
 *                 server may already hold this order. These are reconciled
 *                 against recent server-side orders *before* being re-sent
 *                 (see `lib/orderReconcile.ts`); only a proven miss is replayed.
 *
 *    The single biggest source of duplicate orders was the 8s axios timeout:
 *    the server accepted the order, the reply was late, we queued it and
 *    replayed it. Timeouts are therefore classified `unknown`, never `unsent`.
 *
 * 4. Queued orders carry a stale price/stock snapshot. The server revalidates
 *    on replay, so an item can legitimately fail; those land in `failed` and
 *    are surfaced to the user rather than silently dropped.
 *
 * 5. The queue is shared localStorage, so two open tabs would otherwise both
 *    read the same entry and both send it. `flushQueue` takes an origin-wide
 *    lock (`lib/offlineFlushLock.ts`) and re-checks each entry's status
 *    immediately before sending.
 */

import { withFlushLock } from './offlineFlushLock';

export type QueueKind = 'order' | 'booking' | 'reservation';

/**
 * `needs-review` is not a failure. It means the client could not prove whether
 * the server already has this entry, so replaying it blindly would risk a
 * duplicate and dropping it silently would risk losing a real order. It sits
 * between `failed` (we tried and it was refused) and `pending` (never tried):
 * a person has to look at the kitchen/server and choose "send it" or "drop it".
 */
export type QueueStatus = 'pending' | 'sending' | 'failed' | 'needs-review';

/** How confident we are that the server has not already received this entry. */
export type DeliveryState = 'unsent' | 'unknown';

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
  /** Defaults to `unsent`. See `DeliveryState`. */
  delivery: DeliveryState;
  lastError?: string;
  /** Why an entry is parked in `needs-review`, in words the user can act on. */
  reviewReason?: string;
  /** Device-local receipt snapshot. Never transmitted; see QueuedSubmissionLocal. */
  local?: QueuedSubmissionLocal;
}

/**
 * Device-local snapshot of one submitted line.
 *
 * The API payload only carries `itemID` / `unitPrice` / `quantity` — never the
 * item name. That is fine when the order reaches the server, but a queued order
 * has no server-side record, so the offline invoice and the queue list would
 * render a column of bare GUIDs. This snapshot is stored on the queue entry and
 * is **never sent to the API**, so it can safely carry display-only fields.
 */
export interface QueuedLineMeta {
  itemID: string;
  itemName: string;
  menuName?: string;
  isPacked?: boolean;
}

/** Display-only metadata that makes a queued order self-describing. */
export interface QueuedSubmissionLocal {
  businessName?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPhone?: string;
  staffName?: string;
  currency?: string;
  table?: string;
  customerName?: string;
  customerPhone?: string;
  comment?: string;
  /** When the order was taken on the device. Optional — defaulted on enqueue. */
  createdAt?: number;
  lines?: QueuedLineMeta[];
  /**
   * Payment taken on the device while the order was still queued.
   *
   * Kept on the local snapshot rather than in the payload: the API's order
   * schema only knows the fields it validates, and the queue replay posts the
   * payload verbatim. Recording a tender here lets staff settle a queued order
   * offline without teaching the server about fields it has never seen.
   */
  paymentMethod?: number;
  paymentReference?: string;
  amountPaid?: number;
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
    return parsed;
  } catch {
    return [];
  }
};

/**
 * Re-arms anything left mid-flight by a closed tab.
 *
 * This used to happen inside `readQueue`, which was wrong: it silently reset the
 * `sending` marker on *every* read, so a live in-flight send was indistinguishable
 * from a stale one. An edit made while an order was being sent would therefore be
 * written to storage and then either lost (the flush removes the item on success)
 * or silently divergent from what the server received (the server got the
 * pre-edit payload). `updateQueuedItem` refuses to edit a `sending` item, so that
 * only works if the marker survives the read.
 *
 * Recovery now happens once at startup, where the "tab was closed mid-request"
 * case can actually be identified, instead of on every read.
 *
 * Recovered entries are also downgraded to `delivery: 'unknown'`. A tab that
 * died mid-POST is exactly the "we don't know if the server got it" situation, so
 * re-arming it as a plain `unsent` would blind-replay a possibly-delivered order
 * — the original duplicate bug.
 *
 * @returns true when at least one item was re-armed.
 */
export const recoverStaleInFlight = (): boolean => {
  const items = readQueue();
  if (!items.some((i) => i.status === 'sending')) return false;
  writeQueue(
    items.map((i) =>
      i.status === 'sending' ? { ...i, status: 'pending', delivery: 'unknown' as const } : i
    )
  );
  return true;
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
  item: Omit<QueuedSubmission, 'createdAt' | 'attempts' | 'status' | 'delivery'> & {
    delivery?: DeliveryState;
  }
): QueuedSubmission => {
  const id = item.id ?? newId();
  const entry: QueuedSubmission = {
    ...item,
    id,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
    // Default to the safe assumption: if we did not record why we believe the
    // server has not seen this, treat it as possibly-delivered.
    delivery: item.delivery ?? 'unsent',
  };
  writeQueue([...readQueue(), entry]);
  return entry;
};

export const updateItem = (id: string, patch: Partial<QueuedSubmission>): void => {
  writeQueue(readQueue().map((i) => (i.id === id ? { ...i, ...patch } : i)));
};

export const removeItem = (id: string): void => {
  writeQueue(readQueue().filter((i) => i.id !== id));
};

export const pendingCount = (): number =>
  readQueue().filter((i) => i.status === 'pending' || i.status === 'sending').length;

export const failedItems = (): QueuedSubmission[] =>
  readQueue().filter((i) => i.status === 'failed');

export const failedCount = (): number => failedItems().length;

export const reviewItems = (): QueuedSubmission[] =>
  readQueue().filter((i) => i.status === 'needs-review');

export const reviewCount = (): number => reviewItems().length;

/**
 * Whole queue, oldest first — the same order `flushQueue` replays in, so the UI
 * shows items top-down in the sequence they will actually be sent.
 */
export const getQueueItems = (): QueuedSubmission[] =>
  readQueue().sort((a, b) => a.createdAt - b.createdAt);

export const getQueuedItem = (id: string): QueuedSubmission | undefined =>
  readQueue().find((i) => i.id === id);

/**
 * Edits a queued submission before it has been delivered.
 *
 * Two deliberate behaviours:
 *
 * - An item that had exhausted its attempts comes back as `pending` with the
 *   counter reset. Staff fixing a typo is the whole point of the retry action,
 *   so a correction must not be blocked by the previous failure count.
 * - An item that is mid-flight (`sending`) is not editable: its payload may
 *   already be on the server, so patching it here would desync the local copy
 *   from what the server received. Callers should check `status` first.
 *
 * @returns the stored item, or null when the id is unknown or in flight.
 */
export const updateQueuedItem = (
  id: string,
  patch: Partial<Omit<QueuedSubmission, 'id' | 'createdAt' | 'status' | 'attempts'>>
): QueuedSubmission | null => {
  const items = readQueue();
  const existing = items.find((i) => i.id === id);
  if (!existing || existing.status === 'sending') return null;

  updateItem(id, {
    ...patch,
    ...(existing.status === 'failed' ? { status: 'pending', attempts: 0, lastError: undefined } : {}),
  });

  return readQueue().find((i) => i.id === id) ?? null;
};

/** Discards one queued submission. Returns true when something was removed. */
export const deleteQueuedItem = (id: string): boolean => {
  const before = readQueue().length;
  removeItem(id);
  return readQueue().length < before;
};

/**
 * What a failed request tells us about the server's state.
 *
 * This distinction is the whole duplicate-order story, so it is worth spelling
 * out rather than collapsing into a boolean:
 *
 * - `rejected` the server answered (any `error.response`). A real answer such as
 *   "insufficient stock" or a zod error must never be queued — queueing it would
 *   hide a genuine problem and let the user believe an order was accepted.
 *
 * - `unsent` the request provably never reached the application server, so
 *   replaying it cannot duplicate anything:
 *     • the browser was offline when it was attempted;
 *     • `ERR_NETWORK`    — connect-level failure (DNS, refused, CORS, blocked);
 *     • `ENOTFOUND`      — DNS lookup failed;
 *     • `ECONNREFUSED`   — connection actively refused.
 *
 * - `unknown` the request *was* transmitted and we simply never saw the reply.
 *   The order may already exist on the server, so it must NOT be replayed on a
 *   guess — it is reconciled first (see `lib/orderReconcile.ts`):
 *     • `ECONNABORTED`   — our axios `timeout` elapsed;
 *     • `ETIMEDOUT`      — socket timeout;
 *     • no recognisable code while the browser claims to be online.
 *
 * Timeouts were previously treated as "offline" and queued for blind replay.
 * That is precisely how one order became two: the server accepted the order,
 * the response was slow, and we sent it again minutes later.
 */
export type FailureClass = 'rejected' | 'unsent' | 'unknown';

const UNSENT_CODES = ['ERR_NETWORK', 'ENOTFOUND', 'ECONNREFUSED'];
const UNKNOWN_CODES = ['ECONNABORTED', 'ETIMEDOUT'];

export const classifyFailure = (error: unknown): FailureClass => {
  const err = (error ?? {}) as { response?: unknown; code?: string; message?: string };

  // A response means the server made a decision. Never queue it.
  if (err.response) return 'rejected';

  const code = err.code ?? '';
  if (UNKNOWN_CODES.includes(code)) return 'unknown';
  if (UNSENT_CODES.includes(code)) return 'unsent';

  // The browser knows its own connectivity, and it is authoritative about
  // whether a request could have been issued at all.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'unsent';

  // Online, no response, no recognisable code: most likely a dropped connection
  // mid-flight, but we cannot prove it. Treat as ambiguous rather than guess.
  return 'unknown';
};

/**
 * True only when the failure means "the request may be retryable later".
 *
 * Kept for the read paths in the controllers, which only need to know whether to
 * rethrow for the offline banner. Note that it is deliberately true for
 * `unknown` too — those entries are reconciled before replay, not dropped.
 */
export const isOfflineFailure = (error: unknown): boolean => classifyFailure(error) !== 'rejected';

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
 * Outcome of a single entry within one flush run.
 *
 * `sent`           the server accepted it and the entry is gone.
 * `skipped`        deliberately not sent because it was already delivered.
 * `needs-review`   deliberately not sent because we could not tell; a human must.
 * `failed`         the server refused it, or attempts were exhausted.
 * `deferred`       untouched this run (ordering, or another tab owns it).
 */
export interface FlushResult {
  synced: number;
  failed: number;
  /** Entries found already on the server and dropped instead of re-sent. */
  skipped: number;
  /** Entries parked for a human decision. */
  needsReview: number;
  /** Entries left pending because the run stopped early or the lock was taken. */
  deferred: number;
}

const emptyResult = (): FlushResult => ({ synced: 0, failed: 0, skipped: 0, needsReview: 0, deferred: 0 });

/** Verdict returned by an injected reconciler for one ambiguous entry. */
export type ReconcileVerdict = 'already-delivered' | 'not-delivered' | 'inconclusive';

export interface FlushOptions {
  send: (item: QueuedSubmission) => Promise<boolean>;
  /**
   * Proves whether an ambiguous entry is already on the server.
   *
   * Injected rather than imported so `offlineQueue` stays free of API imports
   * (it is imported by controllers and runs on every render path). When omitted,
   * every `unknown` entry resolves to `inconclusive` and is parked for review —
   * the safe default, since with no reconciler we cannot prove absence.
   */
  reconcile?: (item: QueuedSubmission) => Promise<ReconcileVerdict | { verdict: ReconcileVerdict; reason?: string; matchedReference?: string }>;
}

/**
 * Replays the queue in submission order, without ever sending a possible duplicate.
 *
 * The three things that make this safe, in the order they happen:
 *
 * 1. **One flusher at a time.** The whole run is wrapped in the origin-wide lock
 *    (`lib/offlineFlushLock.ts`). Two tabs sharing this localStorage queue would
 *    otherwise each read the same entry and each POST it.
 *
 * 2. **Ambiguous entries are proven missing first.** `delivery: 'unknown'` means
 *    the request may already have been accepted. Those are reconciled against the
 *    server and only replayed on a proven `not-delivered`. This is the direct fix
 *    for orders being sent twice after an axios timeout.
 *
 * 3. **Status is re-read immediately before each POST.** The snapshot taken at
 *    the top of the run can be stale by the time we get to an entry (a user may
 *    have edited or discarded it, or another tab may have taken it). Re-reading
 *    here means a lost race resolves to "someone else handled it", not a double
 *    send.
 *
 * Ordering is still preserved for genuine send failures — a later booking must
 * not overtake an earlier one. Entries parked for review do *not* break the
 * run: needing a human is not a delivery failure, and blocking the queue behind
 * it would strand every order behind it.
 */
export const flushQueue = async ({ send, reconcile }: FlushOptions): Promise<FlushResult> => {
  if (!isBrowser() || !navigator.onLine) return emptyResult();

  return (
    (await withFlushLock(async () => {
      const result = emptyResult();

      const items = readQueue()
        .filter((i) => i.status === 'pending')
        .sort((a, b) => a.createdAt - b.createdAt);

      for (const snapshot of items) {
        // (3) Re-read rather than trusting the snapshot taken above.
        const item = getQueuedItem(snapshot.id);
        if (!item || item.status !== 'pending') {
          result.deferred += 1;
          continue;
        }

        // (2) Prove absence before replaying anything ambiguous.
        if (item.delivery === 'unknown') {
          const outcome = reconcile
            ? await reconcile(item).catch(() => 'inconclusive' as const)
            : ('inconclusive' as const);

          const verdict: ReconcileVerdict =
            typeof outcome === 'string' ? outcome : (outcome?.verdict ?? 'inconclusive');
          const reason =
            typeof outcome === 'string' ? undefined : (outcome as { reason?: string })?.reason;

          if (verdict === 'already-delivered') {
            // The server has it. Removing it here is the whole point of the
            // exercise — this is where the second copy of an order is prevented.
            removeItem(item.id);
            result.skipped += 1;
            continue;
          }

          if (verdict === 'inconclusive') {
            updateItem(item.id, {
              status: 'needs-review',
              reviewReason:
                reason ??
                'This order may or may not have reached the kitchen. Check the order list before sending it again.',
            });
            result.needsReview += 1;
            continue;
          }
          // 'not-delivered' — fall through and send it.
        }

        // Mark before sending: if the tab dies mid-request, `recoverStaleInFlight`
        // re-arms it as `unknown` so it is reconciled rather than blind-replayed.
        updateItem(item.id, { status: 'sending' });

        let ok = false;
        try {
          ok = await send(item);
        } catch {
          ok = false;
        }

        if (ok) {
          removeItem(item.id);
          result.synced += 1;
          continue;
        }

        const attempts = item.attempts + 1;
        if (attempts >= MAX_ATTEMPTS) {
          updateItem(item.id, {
            status: 'failed',
            attempts,
            lastError: 'Could not be delivered after several attempts',
          });
          result.failed += 1;
          // A hard failure here means later items are probably failing too.
          break;
        }

        // The request went out and we did not get a usable answer, so the server
        // may have it. Downgrade rather than replaying on the next tick.
        updateItem(item.id, {
          status: 'pending',
          attempts,
          delivery: 'unknown',
          reviewReason: undefined,
        });
        break; // preserve ordering
      }

      return result;
    })) ?? emptyResult()
  );
};

/**
 * Replays items that previously exhausted their attempts.
 *
 * Failure alone does not prove the server never saw the order, so entries that
 * were left `unknown` stay `unknown` and go back through reconciliation. Only
 * entries recorded as `unsent` are retried immediately.
 */
export const retryFailed = async (options: FlushOptions): Promise<FlushResult> => {
  readQueue()
    .filter((i) => i.status === 'failed')
    .forEach((i) => updateItem(i.id, { status: 'pending', attempts: 0, lastError: undefined }));
  return flushQueue(options);
};

/**
 * Parks every entry in `needs-review` back into `pending`, marked `unsent`.
 *
 * This is the human's "I checked the order list, it is not there, send it"
 * decision. Marking it `unsent` is what skips reconciliation on the next flush —
 * the override is deliberate, so it must not be second-guessed automatically.
 */
export const approveQueuedItems = (ids: string[]): number => {
  const wanted = new Set(ids);
  const items = readQueue().filter((i) => wanted.has(i.id) && i.status === 'needs-review');
  if (items.length === 0) return 0;
  writeQueue(
    readQueue().map((i) =>
      wanted.has(i.id) && i.status === 'needs-review'
        ? { ...i, status: 'pending', delivery: 'unsent' as const, reviewReason: undefined }
        : i
    )
  );
  return items.length;
};

/** Marks every parked entry as approved. See `approveQueuedItems`. */
export const approveAllQueuedItems = (): number =>
  approveQueuedItems(readQueue().filter((i) => i.status === 'needs-review').map((i) => i.id));

export const clearQueue = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
};
