# Offline Prefetch Gating - Test Guide

## Issue Fixed
The menu page and orders page prefetched aggressively regardless of connectivity.
Offline, every one of those speculative requests failed and the resulting retry
timers competed with the actions the user was actually trying to perform.
Coverage was also uneven: on the orders page only rows that were *hovered* got
their details prefetched, so touch users (and anyone who did not hover a row)
had almost nothing warm when the connection dropped.

The caches that made the pages feel instant were also in-memory only. Closing or
reloading a tab while offline wiped every section, sub-tab, and order the user
had already loaded, so an offline reload showed empty pages even though the data
had just been on screen. Already-loaded data is now persisted to `localStorage`
so it survives a reload and stays available offline.

## Changes Made

### New `lib/persistentCache.ts`
- `PersistentCache<V>` - a Map-compatible cache that mirrors itself into
  `localStorage` (debounced writes, flushed on `pagehide`/tab hide).
- Storage safety: entries are capped by count and byte size, evicted
  oldest-first, and writes are wrapped in a quota guard. If storage is full or
  unavailable the cache silently falls back to in-memory only.
- Each bucket is namespaced by the active **business id**, so switching business
  (or a shared device) can never surface another business's cached data.
- `clearPersistentCaches()` wipes every cache and is called from
  `clearAppStorage()` on logout, so a shared device starts clean.

### New `lib/orderDetailsCache.ts`
- `fetchOrderDetails(orderId)` - a persisted read-through cache for a single
  order's details, used by both the orders-page prefetch and the
  `useOrderDetails` query.
- Online, a payload within the query's 5-minute stale window is reused; offline
  (or on a failed request) the last successful payload is served.

### New `lib/connectivity.ts`
- `isNetworkOnline()` - synchronous connectivity check (same `navigator.onLine`
  detection the offline queue already uses, so everything agrees on when the
  app is offline).

### New `hooks/useNetworkOnline.ts`
- Reactive `navigator.onLine` for components that need to respond to a
  connection change (e.g. resuming preloading on reconnect).

### `app/dashboard/menu/page.tsx`
1. **`preloadMenuSections` is connectivity-gated**
   - Skips the whole run when offline.
   - Breaks out of the sequential loop if the connection drops mid-run.
2. **New `isCacheUsable` helper** used by every cache read (initial load,
   category select, section select, `fetchMenuItems`):
   - Fresh entries serve as before while online.
   - Offline, an expired entry is served instead of firing a request that
     cannot succeed - so every section/sub-tab that was ever loaded stays
     viewable.
3. **Offline error handling**
   - `fetchMenuItems` no longer blanks the grid and repeats a generic failure
     toast while offline; it keeps what is on screen and says why.
   - The background "remaining items" fetch reports a single clear offline
     message instead of leaving a silent blank page.
4. **Reconnect resumes preloading** - a new effect watches for the offline ->
   online transition and warms whatever sections are still missing from the
   cache, so sections skipped while offline catch up automatically.
5. Fixed the subsequent-load cache lookup key (was `${section.id}`, writes
   always use `${section.id}_page_1`).

### `components/ui/dashboard/orders/order.tsx`
1. **`prefetchOrderDetails` is connectivity-gated** and uses `retry: 0` - a
   speculative warm-up must never stack backoff retries. It warms through the
   shared persisted `fetchOrderDetails`, so the warmed data also survives a
   reload. Real reads (`useOrderDetails` in the invoice/update/refund modals)
   reuse the same cache and still fetch on their own when online.
2. **New row-warming effect** - details for the rows currently on screen
   (capped by `WARMED_ROW_LIMIT = 25`, skipping already cached rows) are
   prefetched when the list renders, so row actions keep working offline even
   without hover. This is what fixes "only a few rows were prefetched".

### `components/ui/dashboard/orders/place-order/menuList.tsx`
The place-order menu has its own items cache (`globalOrderItemsCache`) with the
same issues, plus a noisy failure path:
1. **Cache is persisted** (`order-items`) so the sections a user opened survive
   a reload.
2. **Offline handling in `fetchMenuItems`** - it no longer fires a request that
   can only fail; it serves the previously loaded page, or shows one clear
   "You're offline" message.
3. **No false error** - the `API returned unsuccessful response: undefined`
   `console.error` (which the dev overlay surfaced as an error) is only logged
   when actually online; offline the controller resolving `undefined` is
   expected.
4. `fetchFirstItemPriority`, `fetchRemainingItemsBackground` and
   `preloadOtherSections` are all connectivity-gated, and missing sections are
   warmed again on the offline -> online transition.

### `hooks/cachedEndpoints/useOrder.tsx`
- The internal page cache (`globalOrdersCache`) is now a `PersistentCache`, so
  order rows survive a reload and are available offline.
- It also serves entries **past** expiry while offline, so switching order
  status sub-tabs offline shows the rows loaded earlier instead of failing
  (`networkMode: 'offlineFirst'` already runs this query fn once without a
  connection).

### `hooks/cachedEndpoints/useMenuCategories.tsx`
- Last good categories payload is kept in a persisted singleton cache and served
  offline. The menu page derives every section/sub-tab from this list - without
  it an offline visit rendered an empty page even though the items were
  prefetched.
- Query now uses `networkMode: 'offlineFirst'` so the offline fallback gets a
  chance to answer.

### `app/dashboard/menu/page.tsx` / `orders/order.tsx` caches
- `globalMenuItemsCache` (`menu-items`) and `globalOrdersCache` (`orders`) are
  persisted, so the sections/sub-tabs and rows a user already loaded survive a
  reload and remain accessible offline.

## How to Test

### Test Scenario 1: No failed-request storm on the menu page
1. Open DevTools -> Network tab.
2. Load the menu page online and let it settle.
3. Toggle DevTools -> Network -> "Offline" (or disconnect the network).
4. Click through several category tabs and section sub-tabs.
5. **Expected**: no stream of failing `menu-items` requests; cached sections
   render immediately.
6. **Expected**: at most one offline toast per user-initiated fetch, never a
   blank grid that cleared items already on screen.

### Test Scenario 2: Menu preloading resumes on reconnect
1. Load the menu page while offline (or go offline before it finishes
   preloading).
2. Note in DevTools -> Network that background preloading is not running.
3. Go back online.
4. **Expected**: the still-missing sections are fetched shortly after the
   `online` event, and every sub-tab now opens instantly.

### Test Scenario 3: Orders rows work offline without hover
1. Open the orders page on a touch device or with a narrow window (mobile
   card layout), or simply avoid hovering any row.
2. Let the list render while online.
3. Go offline.
4. Tap/click a row and open "Generate invoice" / "View Progress".
5. **Expected**: order details load from cache (up to 25 rows are warmed).

### Test Scenario 4: Order sub-tabs offline
1. On the orders page, open each status sub-tab (All Orders, Open, Closed,
   Cancelled) while online.
2. Go offline.
3. Switch between those sub-tabs.
4. **Expected**: each tab shows the rows it displayed earlier rather than an
   error. The 10-minute freshness window only governs online refetching -
   offline, previously loaded rows are served from cache (and now survive a
   reload too).

### Test Scenario 5: Reconnect behaviour is unchanged
1. Go offline, then back online on both pages.
2. **Expected**: the offline queue drains as before, orders refetch, and no
   duplicate/preload storms appear in the Network tab beyond the one warm-up
   pass.

### Test Scenario 6: Menu survives an offline reload
1. Online, open the menu page and click through several categories and
   sub-tabs so their items are cached.
2. Go offline (DevTools -> Network -> Offline).
3. **Reload the page** (F5) while still offline.
4. **Expected**: the menu page renders the categories and previously opened
   sections instead of an empty grid; opening a previously visited sub-tab
   shows its items.
5. **Expected**: no repeating failed-request storm in the Network tab.

### Test Scenario 7: Orders survive an offline reload
1. Online, open the orders page and let the list render (rows are warmed).
2. Go offline.
3. **Reload the page** while still offline.
4. **Expected**: the order rows the page was showing appear from cache.
5. Open "Generate invoice" / "View Progress" on a warmed row.
6. **Expected**: details open from cache rather than failing.

### Test Scenario 8: No data leaks between businesses / users
1. Load the menu and orders pages for business A and note the data.
2. Log out (or switch business).
3. Log in as business B (or a different user).
4. **Expected**: no data from business A appears; the persisted caches were
   cleared on logout and are additionally namespaced per business id.
5. Close the browser's devtools Application tab and confirm the `cache:*`
   entries are gone after logout.

### Test Scenario 9: Storage pressure is handled gracefully
1. In DevTools, throttle/fill `localStorage` (or open many sections to grow the
   cache).
2. **Expected**: the page keeps working; entries are evicted oldest-first and,
   if the quota is still exceeded, the cache degrades to in-memory only rather
   than throwing.

### Test Scenario 10: Place-order menu has no false offline error
1. Open the place-order page (New Order / Add Items) and click through a few
   sections while online so their items are cached.
2. Go offline.
3. Switch sections and paginate.
4. **Expected**: previously loaded sections/pages render from cache.
5. **Expected**: no `API returned unsuccessful response: undefined` error in
   the console or the Next.js dev overlay; at most one clear "You're offline"
   toast.
6. Reload the page while still offline.
7. **Expected**: the sections loaded earlier still render.
