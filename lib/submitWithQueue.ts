/**
 * Bridges the API layer to the offline queue.
 *
 * The submit controllers all follow the same shape:
 *
 *   validate -> api.post(...) -> catch { handleError(error) }
 *
 * `handleError` swallows the error and the controller returns `undefined`, so
 * callers cannot tell "rejected by the server" from "never reached the server".
 * That distinction is the whole point of the queue, so this helper performs the
 * post itself and returns a discriminated result the UI can act on.
 */

import api, { handleError } from '@/app/api/apiService';
import {
  classifyFailure,
  enqueue,
  isOfflineFailure,
  isQueueableOrder,
  type DeliveryState,
  type QueueKind,
  type QueuedSubmissionLocal,
} from './offlineQueue';
import { getJsonItemFromLocalStorage } from './utils';

export type SubmitResult<T> =
  | { status: 'sent'; data: T }
  | { status: 'queued'; queueId: string }
  | { status: 'rejected'; error: unknown }
  | { status: 'validation'; errors: Record<string, string[]> };

const isAuthenticated = (): boolean => {
  const user = getJsonItemFromLocalStorage('userInformation');
  return Boolean(user?.token);
};

/**
 * POSTs a submission, falling back to the offline queue when the request could
 * not reach the server.
 *
 * @param kind        Queue bucket, for the pending-sync UI and PostHog events.
 * @param url         Endpoint path from `api-url`.
 * @param payload     Request body. A `clientReference` is injected for future
 *                    server-side dedupe; the API currently ignores it, which is
 *                    why duplicate-on-lost-response remains a known risk.
 * @param headers     Business/cooperate scope headers.
 * @param canQueue    Return false for flows that cannot safely be replayed
 *                    (e.g. online payment). Defaults to true.
 * @param local       Device-only receipt snapshot (item names, business, table).
 *                    Stored on the queue entry so an undelivered order can still
 *                    be listed, corrected and invoiced with no server. Never
 *                    transmitted — see `QueuedSubmissionLocal`.
 */
export const submitWithQueue = async <T>({
  kind,
  url,
  payload,
  headers,
  canQueue = true,
  local,
}: {
  kind: QueueKind;
  url: string;
  payload: any;
  headers: Record<string, any>;
  canQueue?: boolean;
  local?: QueuedSubmissionLocal;
}): Promise<SubmitResult<T>> => {
  const queueId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Present from day one so the backend can dedupe on it without a client
  // change. Harmless while unsupported.
  const body = { ...payload, clientReference: payload?.clientReference ?? queueId };

  try {
    const data = await api.post(url, body, { headers });
    return { status: 'sent', data: data as T };
  } catch (error) {
    const queueable =
      canQueue &&
      isOfflineFailure(error) &&
      (kind !== 'order' || isQueueableOrder(body));

    if (!queueable) {
      // A real server answer, or a flow we must not replay. Preserve the
      // existing behaviour: toast the reason and hand the error back.
      handleError(error);
      return { status: 'rejected', error };
    }

    const failure = classifyFailure(error);
    // Be conservative: for orders we cannot prove the server never saw it.
    // Any non-rejected failure is treated as ambiguous to prevent blind replay.
    const delivery: DeliveryState = kind === 'order' ? 'unknown' : failure === 'unknown' ? 'unknown' : 'unsent';
    enqueue({
      id: queueId,
      kind,
      url,
      payload: body,
      headers,
      authenticated: isAuthenticated(),
      // `local` is only stored when supplied. Never merged into the request body —
      // it exists purely so the device can still show and invoice this order.
      ...(local ? { local } : {}),
      delivery,
    });

    // Track separately from the real conversion so funnels can see how many
    // submissions never made it to the server on the first try.
    if (typeof window !== 'undefined') {
      const { trackEvent } = require('./posthogAnalytics') as typeof import('./posthogAnalytics');
      trackEvent('submission_queued', { kind });
    }

    return { status: 'queued', queueId };
  }
};

/**
 * Sends one queued item. Returns true on success.
 *
 * Uses a bare axios call rather than the submit controllers so replay cannot
 * re-enter the queueing path (which would nest queues on every attempt).
 * A 4xx/5xx here is a genuine rejection — e.g. the item sold out while the
 * device was offline — so the item fails instead of retrying forever.
 *
 * Anonymous customer submissions (public /order, /reserve) are replayed with a
 * raw fetch instead of axios: going through the authenticated api instance
 * would attach a stale token and could redirect an unsigned-in customer to
 * /auth/login on a 401.
 */
export const sendQueuedItem = async (item: {
  url: string;
  payload: unknown;
  headers: Record<string, string>;
  authenticated?: boolean;
}): Promise<boolean> => {
  if (item.authenticated === false) {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const response = await fetch(`${base}${item.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...item.headers },
        body: JSON.stringify(item.payload),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  try {
    await api.post(item.url, item.payload, { headers: item.headers });
    return true;
  } catch {
    return false;
  }
};
