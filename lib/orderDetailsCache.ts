/**
 * Persisted read-through cache for a single order's details.
 *
 * The orders page warms rows and the invoice / update / docket / refund modals
 * read the same data through `useOrderDetails`. That data lives in React
 * Query's in-memory cache, which dies with the tab — so a reload while offline
 * loses every order the user had already opened. This mirrors the last good
 * payload to localStorage so those modals still open offline.
 *
 * Online requests are never answered from this cache: mutations invalidate the
 * query and expect fresh data, so the cache only steps in once the network is
 * unavailable or a request fails.
 */
import { getOrder } from "@/app/api/controllers/dashboard/orders";
import { isNetworkOnline } from "./connectivity";
import { PersistentCache } from "./persistentCache";

type CachedOrderDetails = {
  /** The API body: `{ isSuccessful, data, error }`. */
  body: any;
  timestamp: number;
};

const orderDetailsCache = new PersistentCache<CachedOrderDetails>(
  "order-details",
  { maxEntries: 60 }
);

// `getOrder` resolves to an axios response; callers only ever read `.data`, so
// a cache hit can stand in for the real thing.
const asResponse = (body: any) => ({ data: body }) as any;

/**
 * Fetch one order's details, falling back to the last successful payload when
 * the network is unavailable or the request fails.
 */
export const fetchOrderDetails = async (orderId: string): Promise<any> => {
  const cached = orderDetailsCache.get(orderId);

  if (cached && !isNetworkOnline()) {
    return asResponse(cached.body);
  }

  const response = await getOrder(orderId);
  const body = (response as any)?.data;

  if (body?.isSuccessful && body?.data) {
    orderDetailsCache.set(orderId, { body, timestamp: Date.now() });
  }

  // `getOrder` swallows failures and returns undefined; fall back to whatever
  // was cached so a flaky request does not blank the modal, and otherwise
  // return the (undefined) response so existing callers behave as before.
  if (!response && cached) {
    return asResponse(cached.body);
  }

  return response;
};
