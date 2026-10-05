"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyQueuedOrderEdits = exports.queuedOrderViews = exports.toQueuedOrderView = exports.recomputeOrderPayload = void 0;
const orderTotals_1 = require("./orderTotals");
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
/**
 * Recomputes the money fields of an order payload from its lines.
 *
 * Returns a new object; the input is not mutated. `additionalCost` is carried
 * through untouched because it is a free-typed surcharge (delivery, service
 * charge) that has no relationship to the lines.
 */
const recomputeOrderPayload = (payload) => {
    const orderDetails = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.orderDetails) ? payload.orderDetails : [];
    const totals = (0, orderTotals_1.computeOrderTotals)({
        items: orderDetails.map((d) => ({
            price: d === null || d === void 0 ? void 0 : d.unitPrice,
            count: d === null || d === void 0 ? void 0 : d.quantity,
            isPacked: d === null || d === void 0 ? void 0 : d.isPacked,
            packingCost: d === null || d === void 0 ? void 0 : d.packingCost,
        })),
        additionalCost: payload === null || payload === void 0 ? void 0 : payload.additionalCost,
    });
    return {
        ...payload,
        // `subTotalAmount` is items + packing, before VAT and before the surcharge.
        subTotalAmount: totals.subtotal,
        vatAmount: (payload === null || payload === void 0 ? void 0 : payload.isVatApplied) ? totals.vatAmount : 0,
        totalAmount: totals.total,
    };
};
exports.recomputeOrderPayload = recomputeOrderPayload;
/** Best-effort line list from the payload, enriched with names from `local`. */
const readLines = (payload, local) => {
    var _a;
    const nameById = new Map();
    ((_a = local === null || local === void 0 ? void 0 : local.lines) !== null && _a !== void 0 ? _a : []).forEach((line) => {
        if (line === null || line === void 0 ? void 0 : line.itemID)
            nameById.set(String(line.itemID), line);
    });
    const orderDetails = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.orderDetails) ? payload.orderDetails : [];
    return orderDetails.map((detail) => {
        var _a;
        const id = String((_a = detail === null || detail === void 0 ? void 0 : detail.itemID) !== null && _a !== void 0 ? _a : '');
        const known = nameById.get(id);
        return {
            itemID: id,
            // Fall back to the id so a row is never blank, and flag it visibly
            // rather than pretending we know the name.
            itemName: (known === null || known === void 0 ? void 0 : known.itemName) || (detail === null || detail === void 0 ? void 0 : detail.itemName) || `Item ${id}`,
            menuName: (known === null || known === void 0 ? void 0 : known.menuName) || (detail === null || detail === void 0 ? void 0 : detail.menuName),
            quantity: Math.max(1, Number(detail === null || detail === void 0 ? void 0 : detail.quantity) || 1),
            unitPrice: Number(detail === null || detail === void 0 ? void 0 : detail.unitPrice) || 0,
            isPacked: Boolean(detail === null || detail === void 0 ? void 0 : detail.isPacked),
            packingCost: Number(detail === null || detail === void 0 ? void 0 : detail.packingCost) || 0,
            comment: (detail === null || detail === void 0 ? void 0 : detail.comment) || '',
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
const toQueuedOrderView = (item) => {
    var _a;
    if ((item === null || item === void 0 ? void 0 : item.kind) !== 'order' || !(item === null || item === void 0 ? void 0 : item.payload))
        return null;
    const payload = item.payload;
    const local = item.local;
    const lines = readLines(payload, local);
    // Trust the recomputed numbers over whatever the payload claims: the payload
    // may predate an edit, and a stale total is exactly what we are fixing.
    const totals = (0, orderTotals_1.computeOrderTotals)({
        items: lines.map((l) => ({
            price: l.unitPrice,
            count: l.quantity,
            isPacked: l.isPacked,
            packingCost: l.packingCost,
        })),
        additionalCost: payload === null || payload === void 0 ? void 0 : payload.additionalCost,
    });
    const isVatApplied = (_a = payload === null || payload === void 0 ? void 0 : payload.isVatApplied) !== null && _a !== void 0 ? _a : true;
    const additionalCost = round2(payload === null || payload === void 0 ? void 0 : payload.additionalCost);
    return {
        id: item.id,
        status: item.status,
        attempts: item.attempts,
        lastError: item.lastError,
        createdAt: item.createdAt,
        businessName: (local === null || local === void 0 ? void 0 : local.businessName) || '',
        businessAddress: (local === null || local === void 0 ? void 0 : local.businessAddress) || '',
        staffName: (local === null || local === void 0 ? void 0 : local.staffName) || '',
        currency: (local === null || local === void 0 ? void 0 : local.currency) || 'NGN',
        customerName: (payload === null || payload === void 0 ? void 0 : payload.placedByName) || (local === null || local === void 0 ? void 0 : local.customerName) || 'anonymous',
        customerPhone: (payload === null || payload === void 0 ? void 0 : payload.placedByPhoneNumber) || (local === null || local === void 0 ? void 0 : local.customerPhone) || '',
        table: (payload === null || payload === void 0 ? void 0 : payload.quickResponseID) || (local === null || local === void 0 ? void 0 : local.table) || '',
        comment: (payload === null || payload === void 0 ? void 0 : payload.comment) || (local === null || local === void 0 ? void 0 : local.comment) || '',
        lines,
        itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
        itemsSubtotal: totals.itemsSubtotal,
        packingSubtotal: totals.packingSubtotal,
        subTotalAmount: totals.subtotal,
        vatAmount: isVatApplied ? totals.vatAmount : 0,
        isVatApplied,
        additionalCost,
        additionalCostName: (payload === null || payload === void 0 ? void 0 : payload.additionalCostName) || '',
        totalAmount: round2(totals.subtotal + totals.vatAmount + additionalCost),
        canEdit: item.status !== 'sending',
    };
};
exports.toQueuedOrderView = toQueuedOrderView;
/** Every queued order in submission order, skipping anything non-order. */
const queuedOrderViews = (items) => items.map(exports.toQueuedOrderView).filter((v) => v !== null);
exports.queuedOrderViews = queuedOrderViews;
/**
 * Applies an edited order view back onto a queue entry's payload + local
 * snapshot. Totals are recomputed via `recomputeOrderPayload`.
 */
const applyQueuedOrderEdits = (item, edits) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const payload = item.payload;
    const lines = (_a = edits.lines) !== null && _a !== void 0 ? _a : readLines(payload, item.local);
    const nextPayload = (0, exports.recomputeOrderPayload)({
        ...payload,
        placedByName: (_b = edits.customerName) !== null && _b !== void 0 ? _b : payload === null || payload === void 0 ? void 0 : payload.placedByName,
        placedByPhoneNumber: (_c = edits.customerPhone) !== null && _c !== void 0 ? _c : payload === null || payload === void 0 ? void 0 : payload.placedByPhoneNumber,
        quickResponseID: (_d = edits.table) !== null && _d !== void 0 ? _d : payload === null || payload === void 0 ? void 0 : payload.quickResponseID,
        comment: (_e = edits.comment) !== null && _e !== void 0 ? _e : payload === null || payload === void 0 ? void 0 : payload.comment,
        additionalCost: edits.additionalCost === undefined ? payload === null || payload === void 0 ? void 0 : payload.additionalCost : round2(edits.additionalCost),
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
            ...((_f = item.local) !== null && _f !== void 0 ? _f : {}),
            createdAt: (_h = (_g = item.local) === null || _g === void 0 ? void 0 : _g.createdAt) !== null && _h !== void 0 ? _h : item.createdAt,
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
exports.applyQueuedOrderEdits = applyQueuedOrderEdits;
