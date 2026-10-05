'use client';

/**
 * The offline orders panel: everything the pending-count pill could not do.
 *
 * Until now a queued order existed only as a number on a floating pill. Staff
 * could not see what they had taken, could not fix a mistake, and could not print
 * a receipt. This drawer is the place for all three.
 *
 * Per-order actions:
 *   - Expand to view the full line items and totals.
 *   - Update: correct name / phone / table / quantities, re-armed for sending.
 *   - Invoice: print or save a PDF rendered entirely from the device.
 *   - Discard: drop it. Deliberate and confirmed, because it is the only way to
 *     cancel an order that never reached the server.
 *
 * Non-order submissions (bookings, reservations) are summarised as a count at
 * the top so nothing silently disappears from the queue now that the pill has
 * been replaced by this button.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import moment from 'moment';
import {
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { MdOutlineCloudSync, MdOutlineErrorOutline } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import type { QueuedSubmission } from '@/lib/offlineQueue';
import type { QueuedOrderView } from '@/lib/queuedOrder';
import QueuedOrderEditor from './QueuedOrderEditor';
import QueuedOrderInvoice from './QueuedOrderInvoice';

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: 'Waiting to send', className: 'bg-amber-100 text-amber-800' },
  sending: { label: 'Sending…', className: 'bg-blue-100 text-blue-800' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
  'needs-review': { label: 'Needs review', className: 'bg-purple-100 text-purple-800' },
};

const shortRef = (id: string): string => id.replace(/^q_/, '').slice(0, 10);

/**
 * Props come from `OfflineQueueSync`, which owns the only `useOfflineQueueSync`
 * instance in the tree.
 *
 * This must not call the hook itself: each instance runs its own flush interval
 * with its own `inFlight` guard, so two instances could replay the same queued
 * item twice — exactly the duplicate-order failure the queue exists to prevent.
 */
export interface OfflineQueuePanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: QueuedSubmission[];
  orders: QueuedOrderView[];
  pending: number;
  failed: number;
  needsReview?: number;
  isOnline: boolean;
  flushNow: () => void | Promise<void>;
  retryAllFailed: () => Promise<void>;
  updateOrder: (id: string, edits: any) => boolean;
  discardOrder: (id: string) => boolean;
  approveAllQueuedItems?: () => number;
  approveQueuedItems?: (ids: string[]) => number;
}

const OfflineQueuePanel = ({
  isOpen,
  onOpenChange,
  items,
  orders,
  pending,
  failed,
  needsReview = 0,
  isOnline,
  flushNow,
  retryAllFailed,
  updateOrder,
  discardOrder,
  approveAllQueuedItems,
}: OfflineQueuePanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape closes the sheet. The editor and invoice are real modals with their
  // own Escape handling, so this must not fire while one of them is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (invoiceId || editorId) return;
      onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    // Move focus into the sheet so the keyboard is not left on the pill.
    sheetRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, invoiceId, editorId, onOpenChange]);

  /** Bookings / reservations have no offline UI yet, so count them separately. */
  const otherItems = items.filter((i) => i.kind !== 'order');

  const findEntry = (id: string): QueuedSubmission | null =>
    items.find((i) => i.id === id) ?? null;

  const invoiceOrder: QueuedOrderView | null =
    orders.find((o) => o.id === invoiceId) ?? null;
  const editorOrder: QueuedOrderView | null =
    orders.find((o) => o.id === editorId) ?? null;

  const handleDiscard = (id: string) => {
    discardOrder(id);
    setConfirmDiscardId(null);
    setExpandedId((current) => (current === id ? null : current));
  };

  return (
    <>
      {/* A side sheet rather than a NextUI modal: this panel owns the invoice
          and editor modals, and those need to stack cleanly on top of it.
          NextUI 2.4.8 has no Drawer component, so this is hand-rolled. */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Offline orders">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              ref={sheetRef}
              tabIndex={-1}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl outline-none"
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-black">Offline orders</h2>
                  <p className="mt-0.5 text-xs text-grey500">
                    {isOnline
                      ? 'Saved on this device. Sending in the background.'
                      : 'No connection. Saved on this device until you are back online.'}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close offline orders"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6">
                {/* Queue summary */}
                <div className="grid grid-cols-4 gap-2 my-4">
                  <div className="rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-xl font-bold text-amber-700">{pending}</p>
                    <p className="text-[11px] text-amber-700/80">Waiting</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-3 text-center">
                    <p className="text-xl font-bold text-purple-700">{needsReview}</p>
                    <p className="text-[11px] text-purple-700/80">Needs review</p>
                  </div>
                  <div className="rounded-xl bg-red-50 p-3 text-center">
                    <p className="text-xl font-bold text-red-700">{failed}</p>
                    <p className="text-[11px] text-red-700/80">Failed</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-xl font-bold text-gray-700">{orders.length}</p>
                    <p className="text-[11px] text-gray-500">Orders</p>
                  </div>
                </div>

              {(failed > 0 || needsReview > 0) && (
                <div className="mb-4 space-y-2">
                  {needsReview > 0 && approveAllQueuedItems && (
                    <button
                      type="button"
                      onClick={() => approveAllQueuedItems()}
                      disabled={!isOnline}
                      className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Send {needsReview} order{needsReview === 1 ? '' : 's'} (after checking)
                    </button>
                  )}
                  {failed > 0 && (
                    <button
                      type="button"
                      onClick={() => void retryAllFailed()}
                      disabled={!isOnline}
                      className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Retry {failed} failed {failed === 1 ? 'order' : 'orders'}
                    </button>
                  )}
                </div>
              )}

              {pending > 0 && (
                <button
                  type="button"
                  onClick={() => void flushNow()}
                  disabled={!isOnline}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5F35D2] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <MdOutlineCloudSync size={18} />
                  Send now
                </button>
              )}

              {orders.length === 0 && otherItems.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-black">Nothing waiting</p>
                  <p className="mt-1 text-xs text-grey500">
                    Orders placed without a connection will appear here.
                  </p>
                </div>
              )}

              {/* Orders */}
              <div className="space-y-3">
                {orders.map((order) => {
                  const status = statusStyles[order.status] ?? statusStyles.pending;
                  const expanded = expandedId === order.id;
                  const confirming = confirmDiscardId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`rounded-2xl border p-3 ${
                        order.status === 'failed' ? 'border-red-200 bg-red-50/40' : 'border-gray-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        className="flex w-full items-start justify-between gap-2 text-left"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-black">
                            {order.customerName}
                            {order.table && (
                              <span className="font-normal text-grey500"> · {order.table}</span>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-grey500">
                            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} ·{' '}
                            {order.totalAmount.toFixed(2)} {order.currency}
                          </p>
                          <p className="mt-0.5 text-[11px] text-grey400">
                            {moment(order.createdAt).format('MMM D, h:mma')} · ref {shortRef(order.id)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </button>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setInvoiceId(order.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <HiOutlineDocumentText size={14} />
                          Invoice
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorId(order.id)}
                          disabled={!order.canEdit}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                        >
                          <HiOutlinePencil size={14} />
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDiscardId(order.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <HiOutlineTrash size={14} />
                          Discard
                        </button>
                      </div>

                      {/* Discard confirmation — irreversible, so ask. */}
                      {confirming && (
                        <div className="mt-3 rounded-xl bg-red-50 p-3">
                          <p className="text-xs font-medium text-red-800">
                            Discard this order permanently? It has not been sent, so discarding it
                            is the only way to cancel it.
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleDiscard(order.id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Yes, discard
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDiscardId(null)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                            >
                              Keep
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Line items */}
                      {expanded && (
                        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                          {order.lines.map((line, index) => (
                            <div
                              key={line.itemID + index}
                              className="flex items-start justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-medium text-gray-800">
                                  {line.quantity} × {line.itemName}
                                </span>
                                {line.isPacked && (
                                  <span className="text-grey500"> (packed)</span>
                                )}
                                {line.comment && (
                                  <span className="block italic text-grey500">
                                    Note: {line.comment}
                                  </span>
                                )}
                              </div>
                              <span className="shrink-0 font-semibold text-gray-700">
                                {(line.unitPrice * line.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          <div className="space-y-1 border-t border-gray-100 pt-2 text-xs">
                            <div className="flex justify-between text-grey600">
                              <span>Subtotal</span>
                              <span>{order.subTotalAmount.toFixed(2)}</span>
                            </div>
                            {order.additionalCost > 0 && (
                              <div className="flex justify-between text-grey600">
                                <span>
                                  {order.additionalCostName || 'Additional cost'}
                                </span>
                                <span>{order.additionalCost.toFixed(2)}</span>
                              </div>
                            )}
                            {order.isVatApplied && order.vatAmount > 0 && (
                              <div className="flex justify-between text-grey600">
                                <span>VAT</span>
                                <span>{order.vatAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-black">
                              <span>Total</span>
                              <span>
                                {order.totalAmount.toFixed(2)} {order.currency}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Non-order queued submissions */}
              {otherItems.length > 0 && (
                <div className="mt-5 rounded-2xl border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-black">Other saved submissions</p>
                  <ul className="mt-2 space-y-1">
                    {otherItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">
                          {item.kind === 'booking' ? 'Booking' : 'Reservation'}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status === 'failed' ? 'Failed' : 'Waiting'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-grey500">
                    Bookings and reservations are sent automatically and cannot be edited here.
                  </p>
                </div>
              )}

              {failed > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800">
                  <MdOutlineErrorOutline size={18} className="mt-0.5 shrink-0" />
                  <p className="text-xs">
                    These orders could not be delivered — the item may have sold out or the
                    details may be invalid. Update the details and retry, or discard the order.
                  </p>
                </div>
              )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QueuedOrderInvoice
        isOpen={Boolean(invoiceOrder)}
        order={invoiceOrder}
        onClose={() => setInvoiceId(null)}
      />

      <QueuedOrderEditor
        isOpen={Boolean(editorOrder)}
        order={editorOrder}
        entry={editorOrder ? findEntry(editorOrder.id) : null}
        onSave={(id, edits) => updateOrder(id, edits)}
        onClose={() => setEditorId(null)}
      />
    </>
  );
};

export default OfflineQueuePanel;