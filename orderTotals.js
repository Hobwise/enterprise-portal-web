"use strict";
/**
 * Single source of truth for order total maths.
 *
 * Each line is rounded to 2dp before being summed, and VAT is applied **per
 * item** using that item's category VAT settings. This matters because
 * categories differ — e.g. most are 7.5% but `Uncategorized` is 0% — so a
 * single blended rate over the whole subtotal would over- or under-charge VAT
 * and the backend (which taxes per category) would reject the `totalAmount`.
 *
 * Using one calculation for the cart display, the submitted `totalAmount` and
 * any receipt keeps them all in agreement.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeOrderTotals = void 0;
const round2 = (value) => Math.round(value * 100) / 100;
const computeOrderTotals = ({ items, additionalCost = 0, }) => {
    let itemsSubtotal = 0;
    let packingSubtotal = 0;
    let vatAmount = 0;
    (items !== null && items !== void 0 ? items : []).forEach((item) => {
        const price = Number(item === null || item === void 0 ? void 0 : item.price) || 0;
        const count = Number(item === null || item === void 0 ? void 0 : item.count) || 0;
        // Round each line before summing to avoid float drift.
        const lineItems = round2(price * count);
        itemsSubtotal += lineItems;
        let linePacking = 0;
        const packingCost = Number(item === null || item === void 0 ? void 0 : item.packingCost) || 0;
        if ((item === null || item === void 0 ? void 0 : item.isPacked) && packingCost > 0) {
            linePacking = round2(packingCost * count);
            packingSubtotal += linePacking;
        }
        // VAT per item, so 0%-rated categories (e.g. Uncategorized) aren't taxed.
        const rate = Number(item === null || item === void 0 ? void 0 : item.vatRate) || 0;
        if ((item === null || item === void 0 ? void 0 : item.isVatEnabled) && rate > 0) {
            vatAmount += (lineItems + linePacking) * (rate / 100);
        }
    });
    itemsSubtotal = round2(itemsSubtotal);
    packingSubtotal = round2(packingSubtotal);
    vatAmount = round2(vatAmount);
    const subtotal = round2(itemsSubtotal + packingSubtotal);
    const addCost = round2(Number(additionalCost) || 0);
    const total = round2(subtotal + vatAmount + addCost);
    return {
        itemsSubtotal,
        packingSubtotal,
        subtotal,
        vatAmount,
        additionalCost: addCost,
        total,
    };
};
exports.computeOrderTotals = computeOrderTotals;
