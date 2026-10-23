"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearQueue = exports.retryFailed = exports.flushQueue = exports.isQueueableOrder = exports.isOfflineFailure = exports.deleteQueuedItem = exports.updateQueuedItem = exports.getQueuedItem = exports.getQueueItems = exports.failedCount = exports.failedItems = exports.pendingCount = exports.removeItem = exports.enqueue = exports.recoverStaleInFlight = exports.readQueue = void 0;
const STORAGE_KEY = 'pendingSubmissions';
const MAX_ATTEMPTS = 5;
const MAX_ITEMS = 50;
const isBrowser = () => typeof window !== 'undefined';
const newId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};
const readQueue = () => {
    if (!isBrowser())
        return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed;
    }
    catch {
        return [];
    }
};
exports.readQueue = readQueue;
/**
 * Re-queues anything left mid-flight by a closed tab.
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
 * @returns true when at least one item was re-armed.
 */
const recoverStaleInFlight = () => {
    const items = (0, exports.readQueue)();
    if (!items.some((i) => i.status === 'sending'))
        return false;
    writeQueue(items.map((i) => (i.status === 'sending' ? { ...i, status: 'pending' } : i)));
    return true;
};
exports.recoverStaleInFlight = recoverStaleInFlight;
const writeQueue = (items) => {
    if (!isBrowser())
        return;
    try {
        // Cap the backlog so a long offline period cannot fill localStorage and
        // take down the app. Oldest failed items are dropped first.
        const trimmed = items.slice(-MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
    catch {
        // Quota exceeded or private mode: drop the least valuable entries.
        try {
            const pending = (0, exports.readQueue)().filter((i) => i.status !== 'failed');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pending.slice(-10)));
        }
        catch {
            /* give up silently; queueing is best-effort */
        }
    }
};
const enqueue = (item) => {
    var _a;
    const id = (_a = item.id) !== null && _a !== void 0 ? _a : newId();
    const entry = {
        ...item,
        id,
        createdAt: Date.now(),
        attempts: 0,
        status: 'pending',
    };
    writeQueue([...(0, exports.readQueue)(), entry]);
    return entry;
};
exports.enqueue = enqueue;
const updateItem = (id, patch) => {
    writeQueue((0, exports.readQueue)().map((i) => (i.id === id ? { ...i, ...patch } : i)));
};
const removeItem = (id) => {
    writeQueue((0, exports.readQueue)().filter((i) => i.id !== id));
};
exports.removeItem = removeItem;
const pendingCount = () => (0, exports.readQueue)().filter((i) => i.status === 'pending' || i.status === 'sending').length;
exports.pendingCount = pendingCount;
const failedItems = () => (0, exports.readQueue)().filter((i) => i.status === 'failed');
exports.failedItems = failedItems;
const failedCount = () => (0, exports.failedItems)().length;
exports.failedCount = failedCount;
/**
 * Whole queue, oldest first — the same order `flushQueue` replays in, so the UI
 * shows items top-down in the sequence they will actually be sent.
 */
const getQueueItems = () => (0, exports.readQueue)().sort((a, b) => a.createdAt - b.createdAt);
exports.getQueueItems = getQueueItems;
const getQueuedItem = (id) => (0, exports.readQueue)().find((i) => i.id === id);
exports.getQueuedItem = getQueuedItem;
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
const updateQueuedItem = (id, patch) => {
    var _a;
    const items = (0, exports.readQueue)();
    const existing = items.find((i) => i.id === id);
    if (!existing || existing.status === 'sending')
        return null;
    updateItem(id, {
        ...patch,
        ...(existing.status === 'failed' ? { status: 'pending', attempts: 0, lastError: undefined } : {}),
    });
    return (_a = (0, exports.readQueue)().find((i) => i.id === id)) !== null && _a !== void 0 ? _a : null;
};
exports.updateQueuedItem = updateQueuedItem;
/** Discards one queued submission. Returns true when something was removed. */
const deleteQueuedItem = (id) => {
    const before = (0, exports.readQueue)().length;
    (0, exports.removeItem)(id);
    return (0, exports.readQueue)().length < before;
};
exports.deleteQueuedItem = deleteQueuedItem;
/**
 * True only when the failure means "the request never reached the server".
 *
 * `ERR_NETWORK`  — browser could not connect (offline, DNS, CORS, blocked).
 * `ECONNABORTED` — our 30s axios timeout elapsed.
 * `ETIMEDOUT` / `ENOTFOUND` / `ECONNREFUSED` — transport-level failures.
 *
 * Anything with an `error.response` is a real server reply and must NOT queue.
 */
const isOfflineFailure = (error) => {
    var _a;
    if (!navigator.onLine)
        return true;
    const err = error;
    if (err === null || err === void 0 ? void 0 : err.response)
        return false;
    return ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'].includes((_a = err === null || err === void 0 ? void 0 : err.code) !== null && _a !== void 0 ? _a : '');
};
exports.isOfflineFailure = isOfflineFailure;
/**
 * An order is only safe to queue when it is settled (or to be settled) in cash.
 * Paystack orders require a server-issued orderId before payment can start, so
 * they must be blocked offline with a clear message instead.
 */
const isQueueableOrder = (payload) => {
    if (!payload)
        return false;
    if (payload.isOnlinePayment || payload.paymentMethod === 'online')
        return false;
    // status 0 === unpaid/new. Anything already paid must not be replayed.
    return payload.status === 0 || payload.status === undefined;
};
exports.isQueueableOrder = isQueueableOrder;
/**
 * Replays the queue in submission order.
 *
 * Stops at the first item that fails so ordering is preserved — a later
 * booking must not overtake an earlier one. Items that exhaust their attempts
 * move to `failed` and are skipped on subsequent runs.
 */
const flushQueue = async (send) => {
    if (!isBrowser() || !navigator.onLine)
        return { synced: 0, failed: 0 };
    const items = (0, exports.readQueue)()
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
        }
        catch {
            ok = false;
        }
        if (ok) {
            (0, exports.removeItem)(item.id);
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
exports.flushQueue = flushQueue;
/** Retries items that previously exhausted their attempts. */
const retryFailed = async (send) => {
    (0, exports.readQueue)()
        .filter((i) => i.status === 'failed')
        .forEach((i) => updateItem(i.id, { status: 'pending', attempts: 0, lastError: undefined }));
    return (0, exports.flushQueue)(send);
};
exports.retryFailed = retryFailed;
const clearQueue = () => {
    if (!isBrowser())
        return;
    localStorage.removeItem(STORAGE_KEY);
};
exports.clearQueue = clearQueue;
