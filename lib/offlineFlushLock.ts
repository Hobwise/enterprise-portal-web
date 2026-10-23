/**
 * Origin-wide mutual exclusion for offline-queue flushes.
 *
 * Why this exists: the queue lives in `localStorage`, which every tab on the
 * origin shares. `useOfflineQueueSync` guards its own flush with an `inFlight`
 * ref, but that ref is per-tab. With two tabs open (common on a POS terminal,
 * and easy to do accidentally with a PWA), both tabs read the same pending
 * entry, both mark it `sending`, and both POST it — two orders from one tap.
 *
 * Web Locks is the right primitive because it is origin-scoped, held across
 * tabs, and released automatically if the tab dies mid-request. We ask for it
 * non-blocking (`ifAvailable`) rather than queuing: if another tab is already
 * flushing, our job is done — it will pick up our entries too.
 *
 * The localStorage lease is a fallback for browsers without Web Locks (it is
 * broadly supported, but private/embedded webviews can be an exception). It is
 * best-effort by nature: localStorage has no atomic compare-and-set, so two tabs
 * racing in the same millisecond could both win. The lease is therefore only a
 * mitigation; the per-entry `sending` re-check inside `flushQueue` is what makes
 * a lost race harmless.
 */

const LOCK_NAME = 'enterprise-portal:offline-queue-flush';
const LEASE_KEY = 'offlineQueueFlushLease';
const LEASE_TTL_MS = 30_000;

/** Long enough to cover one POST, short enough that a crashed tab self-heals. */
const ownerId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

interface Lease {
  owner: string;
  expiresAt: number;
}

const readLease = (): Lease | null => {
  try {
    const raw = localStorage.getItem(LEASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Lease;
    if (!parsed || typeof parsed.expiresAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

const leaseIsFree = (): boolean => {
  const lease = readLease();
  return !lease || lease.expiresAt <= Date.now();
};

const acquireLease = (): string | null => {
  const owner = ownerId();
  if (!leaseIsFree()) return null;
  try {
    localStorage.setItem(LEASE_KEY, JSON.stringify({ owner, expiresAt: Date.now() + LEASE_TTL_MS }));
    // Re-read: if another tab wrote between our check and our write, its owner id
    // will be there instead of ours and we must stand down.
    const confirmed = readLease();
    if (!confirmed || confirmed.owner !== owner) return null;
    return owner;
  } catch {
    return null;
  }
};

const releaseLease = (owner: string): void => {
  try {
    if (readLease()?.owner === owner) localStorage.removeItem(LEASE_KEY);
  } catch {
    /* best effort */
  }
};

const hasWebLocks = (): boolean =>
  typeof navigator !== 'undefined' && !!navigator.locks?.request;

/**
 * Runs `fn` while holding the origin-wide flush lock.
 *
 * @returns the callback's result, or `null` when another tab already holds the
 *          lock and the work was deliberately skipped.
 */
export const withFlushLock = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  if (typeof window === 'undefined') return null;

  if (hasWebLocks()) {
    return navigator.locks.request(LOCK_NAME, { mode: 'exclusive', ifAvailable: true }, (lock) =>
      // `lock === null` means another tab holds it; skipping is correct because
      // that flush is already draining the same shared queue.
      lock ? fn() : null
    );
  }

  const owner = acquireLease();
  if (!owner) return null;
  try {
    return await fn();
  } finally {
    releaseLease(owner);
  }
};
