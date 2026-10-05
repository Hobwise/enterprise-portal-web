'use client';

/**
 * Corrects an order that is still sitting in the offline queue.
 *
 * This is the "update the previous order in case of error" path. There is no
 * server record to PUT to yet, so the edit is written straight back onto the
 * queue entry and it gets re-armed for delivery.
 *
 * Two rules keep a corrected order deliverable:
 *
 * 1. Quantity is clamped to >= 1. A zero-quantity line is dropped by the API's
 *    own validation on replay, which would fail the *whole* order with an error
 *    the user cannot see while offline.
 * 2. Totals are never edited by hand. `applyQueuedOrderEdits` recomputes them
 *    with `computeOrderTotals` — the same function the cart uses — so the
 *    server cannot reject the order for a `totalAmount` that disagrees with its
 *    own lines.
 */

import { useEffect, useMemo, useState } from 'react';
import { Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, Spinner } from '@nextui-org/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { notify } from '@/lib/utils';
import { applyQueuedOrderEdits, type QueuedOrderLine, type QueuedOrderView } from '@/lib/queuedOrder';
import type { QueuedSubmission } from '@/lib/offlineQueue';

interface QueuedOrderEditorProps {
  isOpen: boolean;
  onClose: () => void;
  order: QueuedOrderView | null;
  /** Raw queue entry — the editor patches the payload, not the view model. */
  entry: QueuedSubmission | null;
  /**
   * Persists the edit. Resolves false when the entry was in flight or already
   * gone, in which case the editor stays open and explains why.
   */
  onSave: (id: string, edits: { payload: Record<string, any>; local: NonNullable<QueuedSubmission['local']> }) => boolean;
}

const QueuedOrderEditor = ({ isOpen, onClose, order, entry, onSave }: QueuedOrderEditorProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [table, setTable] = useState('');
  const [comment, setComment] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [lines, setLines] = useState<QueuedOrderLine[]>([]);
  const [saving, setSaving] = useState(false);

  // Re-seed from the queue entry each time the editor opens, so reopening after
  // a discard never shows the previous order's edits.
  useEffect(() => {
    if (!isOpen || !order) return;
    setCustomerName(order.customerName === 'anonymous' ? '' : order.customerName);
    setCustomerPhone(order.customerPhone);
    setTable(order.table);
    setComment(order.comment);
    setAdditionalCost(order.additionalCost ? String(order.additionalCost) : '');
    setLines(order.lines);
  }, [isOpen, order]);

  // Live preview of what the order will cost after the edit, using the same
  // maths as the cart and the server.
  const preview = useMemo(() => {
    const subtotal = lines.reduce(
      (sum, l) =>
        sum +
        l.unitPrice * l.quantity +
        (l.isPacked ? l.packingCost * l.quantity : 0),
      0
    );
    const rounded = Math.round(subtotal * 100) / 100;
    const addCost = Math.round((Number(additionalCost) || 0) * 100) / 100;
    return { subtotal: rounded, total: Math.round((rounded + addCost) * 100) / 100 };
  }, [lines, additionalCost]);

  if (!order) return null;

  const currency = order.currency || 'NGN';

  const changeQuantity = (index: number, delta: number) => {
    setLines((prev) =>
      prev.map((line, i) =>
        // Never below 1 — see the note in the file header.
        i === index ? { ...line, quantity: Math.max(1, line.quantity + delta) } : line
      )
    );
  };

  const handleSave = () => {
    if (!entry) {
      notify({ title: 'Order unavailable', text: 'This order is no longer in the queue.', type: 'error' });
      return;
    }

    setSaving(true);
    const edits = applyQueuedOrderEdits(entry, {
      customerName: customerName.trim() || 'anonymous',
      customerPhone: customerPhone.trim(),
      table: table.trim(),
      comment: comment.trim(),
      additionalCost: Number(additionalCost) || 0,
      lines,
    });

    const saved = onSave(entry.id, edits);
    setSaving(false);

    if (!saved) {
      notify({
        title: 'Could not save',
        text: 'This order is being sent right now. Try again once it has settled.',
        type: 'error',
      });
      return;
    }

    notify({ title: 'Order updated', text: 'Changes saved and queued for sending.', type: 'success' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!saving}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalBody className="gap-4">
              <div>
                <h2 className="text-lg font-semibold text-black">Update queued order</h2>
                <p className="text-sm text-grey500 mt-1">
                  This order has not reached the server yet, so changes are saved on this device
                  and sent automatically once you are back online.
                </p>
              </div>

              {order.status === 'sending' ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#fff7ed] p-4 text-[#92400e]">
                  <Spinner size="sm" color="warning" />
                  <p className="text-sm">
                    This order is being sent right now and cannot be edited until it settles.
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Customer name"
                  value={customerName}
                  onValueChange={setCustomerName}
                  placeholder="anonymous"
                  isDisabled={!order.canEdit}
                  variant="bordered"
                />
                <Input
                  label="Phone number"
                  value={customerPhone}
                  onValueChange={setCustomerPhone}
                  placeholder="Optional"
                  isDisabled={!order.canEdit}
                  variant="bordered"
                />
                <Input
                  label="Table / QR reference"
                  value={table}
                  onValueChange={setTable}
                  placeholder="e.g. T-04"
                  isDisabled={!order.canEdit}
                  variant="bordered"
                  className="sm:col-span-2"
                />
              </div>

              <Input
                label="Additional cost"
                type="number"
                min={0}
                value={additionalCost}
                onValueChange={setAdditionalCost}
                placeholder="0"
                isDisabled={!order.canEdit}
                variant="bordered"
                startContent={<span className="text-sm text-grey400">₦</span>}
                className="max-w-[220px]"
              />

              <div>
                <p className="text-sm font-semibold text-black mb-2">Items</p>
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div
                      key={line.itemID + index}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-black truncate">{line.itemName}</p>
                        <p className="text-xs text-grey500">
                          {line.isPacked ? 'Packed' : 'Unpacked'} · {line.unitPrice.toFixed(2)} each
                        </p>
                        {line.comment && (
                          <p className="text-xs text-grey500 italic truncate">Note: {line.comment}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.itemName}`}
                          onClick={() => changeQuantity(index, -1)}
                          disabled={!order.canEdit || line.quantity <= 1}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.itemName}`}
                          onClick={() => changeQuantity(index, 1)}
                          disabled={!order.canEdit}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="w-24 text-right text-sm font-semibold text-black shrink-0">
                        {(line.unitPrice * line.quantity +
                          (line.isPacked ? line.packingCost * line.quantity : 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Order note"
                value={comment}
                onValueChange={setComment}
                placeholder="Optional"
                isDisabled={!order.canEdit}
                variant="bordered"
              />

              <Divider />

              <div className="text-sm space-y-1">
                <div className="flex justify-between text-grey600">
                  <span>Subtotal</span>
                  <span>{preview.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-grey600">
                  <span>Additional cost</span>
                  <span>{(Number(additionalCost) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-black text-base">
                  <span>New total ({currency})</span>
                  <span>{preview.total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-grey500 pt-1">
                  VAT is recalculated from the menu's rate when the order is sent.
                </p>
              </div>
            </ModalBody>

            <ModalFooter className="gap-3">
              <button
                type="button"
                onClick={() => onCloseModal()}
                disabled={saving}
                className="px-5 h-11 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !order.canEdit}
                className="px-5 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #5F35D2, #7c5ce5)',
                  boxShadow: '0 4px 14px rgba(95,53,210,0.35)',
                }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default QueuedOrderEditor;