/**
 * Normalises a queued (undelivered) submission into a shape the offline UI can
 * render, edit and invoice.
 *
 * Why this exists: a queued order has **no server-side record**, so everything
 * the offline queue list, the editor and the invoice need has to come from the
 * device. `lib/offlineQueue.ts` stores a `local` snapshot alongside the payload
 * (item names, business, table, staff) precisely because the API payload only
 * carries ids — see `QueuedSubmissionLocal`.
 *
 * Editing rules that must stay consistent everywhere:
 *
 * 1. Totals are **recomputed** with `computeOrderTotals` — the same function the
 *    cart and the live checkout use. Hand-edited quantities must not be able to
 *    desync `totalAmount` from the lines, or the server rejects the order on
 *    replay for a reason the user cannot see.
 * 2. `clientReference` is preserved across edits. It is the only thing that
 *    could ever dedupe a replay, so regenerating it would silently re-open the
 *    duplicate-on-lost-response window documented in `offlineQueue.ts`.
 * 3. Local-only fields stay local. `placedByName`/`placedByPhoneNumber`/
 *    `quickResponseID` exist in the payload *and* the snapshot; both are updated
 *    together so the invoice can never disagree with what gets sent.
 */

import type { QueuedSubmission, QueueStatus, DeliveryState } from './offlineQueue';
import { computeOrderTotals } from './orderTotals';

export interface QueuedOrderLine {
  itemID: string;
  itemName: string;
  menuName?: string;
  quantity: number;
  unitPrice: number;
  isPacked: boolean;
  packingCost: number;
  comment: string;
}

/**
 * The subset of the order-create payload we fingerprint on for duplicate
 * detection. Deliberately narrow: these are the fields the server echoes back on
 * its order-list rows, which is all reconciliation can see.
 */
export interface QueuedOrderPayload {
  placedByName?: string;
  placedByPhoneNumber?: string;
  quickResponseID?: string;
  comment?: string;
  additionalCost?: number;
  isVatApplied?: boolean;
  totalAmount?: number;
  orderDetails?: Array<{
    itemID?: string;
    quantity?: number;
    unitPrice?: number;
    isPacked?: boolean;
    packingCost?: number;
  }>;
}

export interface QueuedOrderView {
  /** Queue entry id — the handle for edit/delete/retry. */
  id: string;
  status: QueueStatus;
  attempts: number;
  lastError?: string;
  /** When the order was taken on the device. */
  createdAt: number;

  businessName: string;
  businessAddress: string;
  staffName: string;
  currency: string;

  customerName: string;
  customerPhone: string;
  table: string;
  comment: string;

  lines: QueuedOrderLine[];
  itemCount: number;

  itemsSubtotal: number;
  packingSubtotal: number;
  subTotalAmount: number;
  vatAmount: number;
  isVatApplied: boolean;
  additionalCost: number;
  additionalCostName: string;
  totalAmount: number;

  /** Whether an edit may be applied right now (false while in flight). */
  canEdit: boolean;

  /**
   * Whether the server may already hold this order. `unknown` entries are
   * reconciled before replay; `unsent` ones are sent straight away.
   */
  delivery: DeliveryState;
  /** Set only when reconciliation could not decide — needs a human decision. */
  reviewReason?: string;
}

const round2 = (value: number): number => Math.round((Number(value) || 0) * 100) / 100;

/**
 * Recomputes the money fields of an order payload from its lines.
 *
 * Returns a new object; the input is not mutated. `additionalCost` is carried
 * through untouched because it is a free-typed surcharge (delivery, service
 * charge) that has no relationship to the lines.
 */
export const recomputeOrderPayload = <T extends Record<string, any>>(payload: T): T => {
  const orderDetails = Array.isArray(payload?.orderDetails) ? payload.orderDetails : [];

  const totals = computeOrderTotals({
    items: orderDetails.map((d: any) => ({
      price: d?.unitPrice,
      count: d?.quantity,
      isPacked: d?.isPacked,
      packingCost: d?.packingCost,
    })),
    additionalCost: payload?.additionalCost,
  });

  return {
    ...payload,
    // `subTotalAmount` is items + packing, before VAT and before the surcharge.
    subTotalAmount: totals.subtotal,
    vatAmount: payload?.isVatApplied ? totals.vatAmount : 0,
    totalAmount: totals.total,
  };
};

/** Best-effort line list from the payload, enriched with names from `local`. */
const readLines = (payload: any, local: QueuedSubmission['local']): QueuedOrderLine[] => {
  const nameById = new Map<string, { itemName: string; menuName?: string }>();
  (local?.lines ?? []).forEach((line) => {
    if (line?.itemID) nameById.set(String(line.itemID), line);
  });

  const orderDetails = Array.isArray(payload?.orderDetails) ? payload.orderDetails : [];

  return orderDetails.map((detail: any) => {
    const id = String(detail?.itemID ?? '');
    const known = nameById.get(id);
    return {
      itemID: id,
      // Fall back to the id so a row is never blank, and flag it visibly
      // rather than pretending we know the name.
      itemName: known?.itemName || detail?.itemName || `Item ${id}`,
      menuName: known?.menuName || detail?.menuName,
      quantity: Math.max(1, Number(detail?.quantity) || 1),
      unitPrice: Number(detail?.unitPrice) || 0,
      isPacked: Boolean(detail?.isPacked),
      packingCost: Number(detail?.packingCost) || 0,
      comment: detail?.comment || '',
    };
  });
};

/**
 * Projects a queue entry into the view model.
 *
 * Returns `null` for non-order submissions (bookings, reservations) and for
 * malformed entries — the offline orders panel simply skips those, they stay
 * visible only through the pending-count pill.
 */
export const toQueuedOrderView = (item: QueuedSubmission): QueuedOrderView | null => {
  if (item?.kind !== 'order' || !item?.payload) return null;

  const payload = item.payload as Record<string, any>;
  const local = item.local;
  const lines = readLines(payload, local);

  // Trust the recomputed numbers over whatever the payload claims: the payload
  // may predate an edit, and a stale total is exactly what we are fixing.
  const totals = computeOrderTotals({
    items: lines.map((l) => ({
      price: l.unitPrice,
      count: l.quantity,
      isPacked: l.isPacked,
      packingCost: l.packingCost,
    })),
    additionalCost: payload?.additionalCost,
  });

  const isVatApplied = payload?.isVatApplied ?? true;
  const additionalCost = round2(payload?.additionalCost);

  return {
    id: item.id,
    status: item.status,
    attempts: item.attempts,
    lastError: item.lastError,
    createdAt: item.createdAt,

    businessName: local?.businessName || '',
    businessAddress: local?.businessAddress || '',
    staffName: local?.staffName || '',
    currency: local?.currency || 'NGN',

    customerName: payload?.placedByName || local?.customerName || 'anonymous',
    customerPhone: payload?.placedByPhoneNumber || local?.customerPhone || '',
    table: payload?.quickResponseID || local?.table || '',
    comment: payload?.comment || local?.comment || '',

    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),

    itemsSubtotal: totals.itemsSubtotal,
    packingSubtotal: totals.packingSubtotal,
    subTotalAmount: totals.subtotal,
    vatAmount: isVatApplied ? totals.vatAmount : 0,
    isVatApplied,
    additionalCost,
    additionalCostName: payload?.additionalCostName || '',
    totalAmount: round2(totals.subtotal + totals.vatAmount + additionalCost),

    canEdit: item.status !== 'sending',
    delivery: item.delivery ?? 'unsent',
    reviewReason: item.reviewReason,
  };
};

/** Every queued order in submission order, skipping anything non-order. */
export const queuedOrderViews = (items: QueuedSubmission[]): QueuedOrderView[] =>
  items.map(toQueuedOrderView).filter((v): v is QueuedOrderView => v !== null);

/**
 * Applies an edited order view back onto a queue entry's payload + local
 * snapshot. Totals are recomputed via `recomputeOrderPayload`.
 */
export const applyQueuedOrderEdits = (
  item: QueuedSubmission,
  edits: Partial<
    Pick<QueuedOrderView, 'customerName' | 'customerPhone' | 'table' | 'comment' | 'additionalCost'>
  > & { lines?: QueuedOrderLine[] }
): { payload: Record<string, any>; local: NonNullable<QueuedSubmission['local']> } => {
  const payload = item.payload as Record<string, any>;
  const lines = edits.lines ?? readLines(payload, item.local);

  const nextPayload = recomputeOrderPayload({
    ...payload,
    placedByName: edits.customerName ?? payload?.placedByName,
    placedByPhoneNumber: edits.customerPhone ?? payload?.placedByPhoneNumber,
    quickResponseID: edits.table ?? payload?.quickResponseID,
    comment: edits.comment ?? payload?.comment,
    additionalCost:
      edits.additionalCost === undefined ? payload?.additionalCost : round2(edits.additionalCost),
    orderDetails: lines.map((l) => ({
      itemID: l.itemID,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      isPacked: l.isPacked,
      packingCost: l.packingCost,
      comment: l.comment || '',
    })),
  });

  return {
    payload: nextPayload,
    local: {
      ...(item.local ?? {}),
      createdAt: item.local?.createdAt ?? item.createdAt,
      customerName: nextPayload.placedByName,
      customerPhone: nextPayload.placedByPhoneNumber,
      table: nextPayload.quickResponseID,
      comment: nextPayload.comment,
      lines: lines.map((l) => ({
        itemID: l.itemID,
        itemName: l.itemName,
        menuName: l.menuName,
        isPacked: l.isPacked,
      })),
    },
  };
};

/**
 * Grand total as stored on the payload, falling back to the recomputed value.
 *
 * Reconciliation compares this against `totalAmount` on a server order row, so
 * it must be the same number the server would have stored — not a re-derived one
 * that could drift by a rounding penny.
 */
export const payloadTotal = (payload: QueuedOrderPayload | null | undefined): number => {
  if (typeof payload?.totalAmount === 'number') return payload.totalAmount;
  return recomputeOrderPayload(payload ?? {}).totalAmount as number;
};

/**
 * Order-insensitive fingerprint of an order's lines.
 *
 * Used to prove a server-side order is byte-for-byte the same basket, not merely
 * the same value. Multiplicity matters — two of one item is not the same as one
 * of two — so the lines are sorted rather than de-duplicated.
 *
 * Accepts both the payload shape (`orderDetails`) and a bare line array, because
 * reconciliation compares a local payload against lines returned by the API.
 */
export const orderLineSignature = (
  lines: Array<{ itemID?: string; quantity?: number; unitPrice?: number }> | null | undefined
): string => {
  if (!Array.isArray(lines)) return '';
  return lines
    .map((l) => `${String(l?.itemID ?? '')}|${Number(l?.quantity) || 0}|${round2(Number(l?.unitPrice) || 0)}`)
    .sort()
    .join('~');
};