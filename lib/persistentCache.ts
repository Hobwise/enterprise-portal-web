/**
 * localStorage-backed caches for data a page has already loaded.
 *
 * The menu and orders pages keep their "already loaded" data in module-level
 * Maps so switching tabs/sections is instant. Those Maps die with the JS heap,
 * though: reload the tab while offline and every section that was loaded a
 * moment ago is gone. These classes give the same Map-shaped API but mirror
 * themselves into localStorage, so an offline reload still paints the pages.
 *
 * Persistence retention is deliberately much longer than the freshness windows
 * the pages use (10 min for menu/orders). Freshness answers "how stale may
 * online data be"; retention answers "how long may an offline user keep looking
 * at what they already had". The pages keep their own freshness checks — this
 * layer only decides what is worth keeping on disk.
 *
 * Storage safety: writes are debounced, capped by entry count and byte size,
 * evicted oldest-first, and wrapped in a quota guard. If storage is full or
 * unavailable, the cache silently degrades to in-memory only — caching is a
 * luxury and must never break the page that owns it.
 */

const STORAGE_PREFIX = "cache:";
const DEFAULT_MAX_ENTRIES = 40;
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_MAX_BYTES = 600_000; // ~1.2 MB of raw UTF-16 per cache
const WRITE_DEBOUNCE_MS = 400;

export interface PersistentCacheOptions {
  /** How long an entry may survive on disk, in ms. Default 7 days. */
  maxAgeMs?: number;
  /** Hard cap on stored entries; oldest evicted first. Default 40. */
  maxEntries?: number;
  /** Serialized size cap in characters; oldest entries shed until it fits. */
  maxBytes?: number;
  /**
   * Extra key part so caches cannot leak between accounts or businesses on a
   * shared device. Defaults to the active business id. Evaluated lazily on
   * every access so switching business reloads a different bucket.
   */
  scope?: () => string;
}

interface StoredEntry<V> {
  v: V;
  t: number;
}

const registry = new Set<PersistentCache<any>>();
let flushBound = false;

const bindFlushListeners = () => {
  if (flushBound || typeof window === "undefined") return;
  flushBound = true;
  const flushAll = () => registry.forEach((cache) => cache.flush());
  // The final writes before a tab closes are the ones an offline user needs
  // most, and the debounce may still be pending when that happens.
  window.addEventListener("pagehide", flushAll);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAll();
  });
};

/** Active business id, read straight from storage. */
const readBusinessScope = (): string => {
  if (typeof window === "undefined") return "server";
  try {
    const raw = window.localStorage.getItem("business");
    if (!raw) return "anonymous";
    const parsed = JSON.parse(raw);
    return parsed?.[0]?.businessId ?? "anonymous";
  } catch {
    return "anonymous";
  }
};

const storage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Storage can throw outright (blocked cookies, hardened privacy modes).
    return null;
  }
};

export class PersistentCache<V> {
  private readonly namespace: string;
  private readonly scope: () => string;
  private readonly maxAgeMs: number;
  private readonly maxEntries: number;
  private readonly maxBytes: number;

  private data = new Map<string, StoredEntry<V>>();
  private hydratedScope: string | null = null;
  private writeTimer: ReturnType<typeof setTimeout> | null = null;
  private disabled = false;

  constructor(namespace: string, options: PersistentCacheOptions = {}) {
    this.namespace = namespace;
    this.scope = options.scope ?? readBusinessScope;
    this.maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
    this.maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

    registry.add(this);
    bindFlushListeners();
    this.ensureHydrated();
  }

  private storageKey(): string {
    return `${STORAGE_PREFIX}${this.namespace}:${this.scope()}`;
  }

  private ensureHydrated(): void {
    if (this.disabled) return;
    const key = this.storageKey();
    if (this.hydratedScope === key) return;

    this.hydratedScope = key;
    this.data = new Map();

    const store = storage();
    if (!store) return;

    let raw: string | null = null;
    try {
      raw = store.getItem(key);
    } catch {
      this.disabled = true;
      return;
    }
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cutoff = Date.now() - this.maxAgeMs;
      for (const row of parsed) {
        if (!Array.isArray(row) || row.length !== 3) continue;
        const [entryKey, value, writtenAt] = row as [string, V, number];
        if (typeof entryKey !== "string" || typeof writtenAt !== "number") continue;
        if (writtenAt < cutoff) continue; // too old to be worth keeping
        this.data.set(entryKey, { v: value, t: writtenAt });
      }
    } catch {
      // Corrupt payload: drop it rather than failing every page load.
      try {
        store.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }

  private schedulePersist(): void {
    if (this.disabled || typeof window === "undefined") return;
    if (this.writeTimer !== null) return; // coalesce bursts (e.g. preload loops)
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null;
      this.persistNow();
    }, WRITE_DEBOUNCE_MS);
  }

  private dropOldest(count: number): void {
    if (count <= 0) return;
    const oldest = [...this.data.entries()]
      .sort((a, b) => a[1].t - b[1].t)
      .slice(0, count);
    for (const [key] of oldest) this.data.delete(key);
  }

  private serialize(): string {
    return JSON.stringify(
      [...this.data.entries()].map(([key, entry]) => [key, entry.v, entry.t])
    );
  }

  /** Write the current contents through to localStorage. */
  flush = (): void => {
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    this.persistNow();
  };

  private persistNow(): void {
    const store = storage();
    if (!store || this.disabled) return;
    // Only persist the bucket we actually hydrated; a pending write after a
    // scope switch would otherwise land under the wrong business.
    const scopeKey = this.hydratedScope;
    if (scopeKey === null || scopeKey !== this.storageKey()) return;

    const cutoff = Date.now() - this.maxAgeMs;
    for (const [key, entry] of [...this.data.entries()]) {
      if (entry.t < cutoff) this.data.delete(key);
    }
    if (this.data.size > this.maxEntries) {
      this.dropOldest(this.data.size - this.maxEntries);
    }

    let json = this.serialize();
    while (json.length > this.maxBytes && this.data.size > 0) {
      this.dropOldest(Math.max(1, Math.floor(this.data.size / 4)));
      json = this.serialize();
    }

    try {
      store.setItem(scopeKey, json);
    } catch {
      // Almost always QuotaExceededError. Shed half and retry once; if it still
      // does not fit, keep the cache in memory and stop writing to disk.
      this.dropOldest(Math.max(1, Math.ceil(this.data.size / 2)));
      try {
        store.setItem(scopeKey, this.serialize());
      } catch {
        this.disabled = true;
      }
    }
  }

  get(key: string): V | undefined {
    this.ensureHydrated();
    return this.data.get(key)?.v;
  }

  set(key: string, value: V): this {
    this.ensureHydrated();
    this.data.set(key, { v: value, t: Date.now() });
    this.schedulePersist();
    return this;
  }

  has(key: string): boolean {
    this.ensureHydrated();
    return this.data.has(key);
  }

  delete(key: string): boolean {
    this.ensureHydrated();
    const removed = this.data.delete(key);
    if (removed) this.schedulePersist();
    return removed;
  }

  clear(): void {
    this.ensureHydrated();
    this.data.clear();
    this.schedulePersist();
  }

  forEach(callback: (value: V, key: string) => void): void {
    this.ensureHydrated();
    this.data.forEach((entry, key) => callback(entry.v, key));
  }

  keys(): string[] {
    this.ensureHydrated();
    return [...this.data.keys()];
  }

  get size(): number {
    this.ensureHydrated();
    return this.data.size;
  }

  /** Forget everything for the current scope, including the stored copy. */
  reset(): void {
    this.data.clear();
    this.hydratedScope = null;
    const store = storage();
    if (store) {
      try {
        store.removeItem(this.storageKey());
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * A persisted cache holding a single value (e.g. the menu category list, which
 * the whole menu page is derived from). Kept as its own type so call sites do
 * not have to remember a magic key.
 */
export const createSingletonCache = <V>(
  namespace: string,
  options?: PersistentCacheOptions
) => {
  const KEY = "value";
  const cache = new PersistentCache<V>(namespace, { maxEntries: 1, ...options });
  return {
    get: () => cache.get(KEY),
    set: (value: V) => cache.set(KEY, value),
    clear: () => cache.clear(),
  };
};

/**
 * Drop every persisted cache in memory and on disk. Called on logout so the
 * next user on a shared device cannot read the previous session's data.
 */
export const clearPersistentCaches = (): void => {
  registry.forEach((cache) => cache.reset());
};
