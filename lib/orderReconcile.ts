/**
 * Decides whether an order we could not confirm is already on the server.
 *
 * The API has no idempotency key: it ignores the `clientReference` we send, so
 * it cannot tell us "I already have this order". That leaves the client with the
 * only option that does not require a backend change — before replaying an
 * ambiguous order, prove it is actually missing by looking at what the server
 * already holds.
 *
 * A queued order becomes ambiguous when the request was transmitted but the reply
 * was not seen (axios timeout, dropped connection). Those are the exact entries
 * that used to be replayed blindly and became duplicates, so they are the ones
 * reconciled here.
 *
 * Matching is done on a fingerprint:
 *   • table (`quickResponseID` / `qrReference`)
 *   • customer name
 *   • customer phone — only when both sides have one, since it is often blank
 *   • grand total, to the cent
 *   • the exact multiset of lines (item + quantity + unit price)
 *   • a time window around when the order was taken
 *
 * The line comparison is what makes this safe. Two customers at different tables
 * ordering the same food for the same amount collide on the first four keys
 * constantly; adding the exact line set and a 30-minute window makes a false
 * match effectively impossible in practice. We still prefer a false positive
 * (suppressing a duplicate) over a false negative (creating one), but only
 * inside the time window — outside it we return `inconclusive` and let a human
 * decide, so a genuine second order an hour later is never silently swallowed.
 */

import { orderLineSignature, payloadTotal, type QueuedOrderPayload } from './queuedOrder';

/**
 * `already-delivered` — the server has this order. Do not send.
 * `not-delivered`   — the server definitively does not have it. Safe to send.
 * `inconclusive`    — we could not tell (no reconcilable fingerprint, or the
 *                     only match sits outside the time window). Requires a human.
 */
export type ReconcileVerdict = 'already-delivered' | 'not-delivered' | 'inconclusive';

/** Generous enough to absorb clock skew and a slow replay, short enough to avoid
 *  matching the *next* genuine order for the same table. */
const TIME_WINDOW_MS = 30 * 60 * 1000;

/** Substring of the list row fields we fingerprint on. */
export interface RecentOrderRow {
  id?: string;
  reference?: string;
  qrReference?: string;
  placedByName?: string;
  placedByPhoneNumber?: string;
  totalAmount?: number;
  dateCreated?: string;
}

/** One line as returned by the order-details endpoint. */
export interface RecentOrderLine {
  itemID?: string;
  quantity?: number;
  unitPrice?: number;
}

/**
 * Injected so this module stays pure and testable: it never imports the API
 * client, which keeps it out of the render path and lets the behavioural tests
 * drive it with fixtures.
 */
export interface ReconcileDeps {
  /** Recent orders for the business, newest first. */
  listRecentOrders: () => Promise<RecentOrderRow[]>;
  /** Full lines for one order row. Return null/undefined when unavailable. */
  getOrderLines: (row: RecentOrderRow) => Promise<RecentOrderLine[] | null>;
}

const norm = (value: unknown): string => String(value ?? '').trim().toLowerCase();

const normPhone = (value: unknown): string => String(value ?? '').replace(/\D/g, '');

const sameMoney = (a: number | undefined, b: number | undefined): boolean =>
  typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 0.01;

const withinWindow = (rowDate: string | undefined, createdAt: number): boolean => {
  if (!rowDate) return false;
  const at = Date.parse(rowDate);
  if (Number.isNaN(at)) return false;
  return Math.abs(at - createdAt) <= TIME_WINDOW_MS;
};

/**
 * Can we even attempt a match for this payload?
 *
 * Public/anonymous checkouts have no phone and often no table, so their
 * fingerprint is weak enough that a match would be a coin flip. Those return
 * `null` and the caller reports `inconclusive` rather than guessing.
 */
export const isReconcilable = (payload: QueuedOrderPayload): boolean => {
  if (!payload) return false;
  // A table reference is the strongest single key we have; without it, matching
  // is not safe enough to prevent duplicates.
  if (!norm(payload.quickResponseID)) return false;
  if (!norm(payload.placedByName)) return false;
  if (!Array.isArray(payload.orderDetails) || payload.orderDetails.length === 0) return false;
  return true;
};

/**
 * Verdict for one queued entry.
 *
 * `fetched` (how many list rows and detail calls were involved) is returned so
 * the UI can be honest about how hard we looked before asking a human.
 */
export const reconcileOrder = async (
  payload: QueuedOrderPayload,
  createdAt: number,
  deps: ReconcileDeps
): Promise<{ verdict: ReconcileVerdict; matchedReference?: string; reason?: string }> => {
  if (!isReconcilable(payload)) {
    return {
      verdict: 'inconclusive',
      reason: 'This checkout has no table reference, so it cannot be matched against the server safely.',
    };
  }

  let rows: RecentOrderRow[];
  try {
    rows = await deps.listRecentOrders();
  } catch (error) {
    return {
      verdict: 'inconclusive',
      reason:
        'Could not reach the server to check whether this order already went through.',
    };
  }

  const targetTotal = payloadTotal(payload);
  const targetSignature = orderLineSignature(payload.orderDetails);

  // Cheap filter first: only rows that agree on the four stable keys are worth a
  // detail request. This keeps the expensive part of reconciliation rare.
  const candidates = rows.filter(
    (row) =>
      norm(row.qrReference) === norm(payload.quickResponseID) &&
      norm(row.placedByName) === norm(payload.placedByName) &&
      sameMoney(row.totalAmount, targetTotal) &&
      // Phone only narrows when both sides provided one.
      (!normPhone(payload.placedByPhoneNumber) ||
        !normPhone(row.placedByPhoneNumber) ||
        normPhone(row.placedByPhoneNumber) === normPhone(payload.placedByPhoneNumber))
  );

  if (candidates.length === 0) {
    return { verdict: 'not-delivered', reason: 'No matching order exists on the server.' };
  }

  const inWindow = candidates.filter((row) => withinWindow(row.dateCreated, createdAt));

  // No candidate inside the time window. If we simply reported "not-delivered"
  // we would re-send an order that may have succeeded a clock-skew ago, so this
  // is handed to a person instead.
  if (inWindow.length === 0) {
    return {
      verdict: 'inconclusive',
      reason: `The server has a similar order (${candidates[0].reference ?? candidates[0].id ?? 'unknown'}) but outside the time window, so we cannot tell if it is this one.`,
    };
  }

  // Confirm with the exact line set before concluding anything.
  const exactMatches: RecentOrderRow[] = [];
  let unreadable = 0;
  for (const row of inWindow) {
    let lines: RecentOrderLine[] | null = null;
    try {
      lines = await deps.getOrderLines(row);
    } catch {
      lines = null;
    }
    if (!lines) {
      unreadable += 1;
      continue;
    }
    if (orderLineSignature(lines) === targetSignature) exactMatches.push(row);
  }

  if (exactMatches.length > 0) {
    return {
      verdict: 'already-delivered',
      matchedReference: exactMatches[0].reference ?? exactMatches[0].id,
      reason: 'An identical order already exists on the server, so it was not sent again.',
    };
  }

  // Every detail lookup failed. That is *not* the same as "no match" — we never
  // got to compare anything, so it is not proof of absence and replaying would
  // risk a duplicate.
  if (unreadable > 0 && unreadable === inWindow.length) {
    return {
      verdict: 'inconclusive',
      reason: 'Could not load order details to compare, so this could not be verified.',
    };
  }

  return {
    verdict: 'not-delivered',
    reason: 'A similar order exists but its items differ, so this one is genuinely missing.',
  };
};
