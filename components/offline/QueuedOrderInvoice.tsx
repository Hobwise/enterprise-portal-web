'use client';

/**
 * Invoice for an order that has not reached the server yet.
 *
 * `InvoiceModal` (the normal one) needs `GET api/v1/Order`, which is exactly
 * what is unavailable when an order is still sitting in the offline queue. But
 * nothing in an invoice actually requires the server: the document is client-side
 * `html2pdf` over a React tree, and every value it prints — items, names, totals,
 * customer, table — is already on the device.
 *
 * So this renders the same document from the queue entry's local snapshot and
 * uses the same `saveAsPDF` / `printPDF` pipeline, giving staff a printable
 * receipt while the order is still queued.
 *
 * Differences from the server-backed invoice, all deliberate:
 *
 * - There is no server-assigned `reference` or `id` yet. The short queue id is
 *   printed instead, clearly marked `PENDING`, and it is the same id staff see
 *   in the queue list, so a printed slip can be matched to a queue row.
 * - The QR / bank-transfer page is **not** rendered. `initializePayment` needs a
 *   real `orderId`, which does not exist yet. Rendering an empty payment page
 *   would be worse than omitting it, so Pay Later / bank transfer is recorded
 *   and settled once the order syncs and has a normal invoice.
 */

import { useRef } from 'react';
import { Divider, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import moment from 'moment';
import { HiOutlineDownload } from 'react-icons/hi';
import { FiPrinter } from 'react-icons/fi';
import { formatPrice, getJsonItemFromLocalStorage, printPDF, saveAsPDF } from '@/lib/utils';
import type { QueuedOrderView } from '@/lib/queuedOrder';

/** Roll lines up the way the server-backed invoice does, so both match. */
const groupLines = (lines: QueuedOrderView['lines']) => {
  const grouped = new Map<string, {
    itemName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    isPacked: boolean;
    packingCost: number;
    comments: string[];
  }>();

  lines.forEach((line) => {
    const key = `${line.itemName}-${line.unitPrice}-${line.isPacked ? 'packed' : 'unpacked'}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += line.quantity;
      existing.totalPrice += line.unitPrice * line.quantity;
      if (line.isPacked) existing.packingCost += line.packingCost * line.quantity;
      // Two lines of the same item with different notes are separate kitchen
      // instructions, so they must not collapse into one row.
      if (line.comment && !existing.comments.includes(line.comment)) {
        existing.comments.push(line.comment);
      }
      return;
    }

    grouped.set(key, {
      itemName: line.itemName,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      totalPrice: line.unitPrice * line.quantity,
      isPacked: line.isPacked,
      packingCost: line.isPacked ? line.packingCost * line.quantity : 0,
      comments: line.comment ? [line.comment] : [],
    });
  });

  return Array.from(grouped.values());
};

const shortRef = (id: string): string => id.replace(/^q_/, '').slice(0, 12);

interface QueuedOrderInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  /** null once the entry has been discarded or synced out of the queue. */
  order: QueuedOrderView | null;
}

const QueuedOrderInvoice = ({ isOpen, onClose, order }: QueuedOrderInvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');
  const business = businessInformation?.[0];

  if (!order) return null;

  const currency = order.currency || 'NGN';
  const money = (value: number) => formatPrice(value, currency);
  const grouped = groupLines(order.lines);

  // Name/business come from the snapshot captured at checkout, not from
  // localStorage: staff can switch business between queueing and printing, and
  // the receipt must belong to the order it was taken for.
  const businessName = order.businessName || business?.businessName || '';
  const staffName =
    order.staffName ||
    `${userInformation?.firstName || ''} ${userInformation?.lastName || ''}`.trim() ||
    'Staff';

  /**
   * The .print-only payment page has nothing to show (see the file header), so
   * saving only needs one frame for React to commit the tree into the ref before
   * html2canvas rasterises it.
   */
  const withPaintedRef = (action: (ref: any) => void) => {
    requestAnimationFrame(() => {
      setTimeout(() => action(invoiceRef), 100);
    });
  };

  const handleSave = () => withPaintedRef((ref) => saveAsPDF(ref, `invoice-${shortRef(order.id)}.pdf`));
  const handlePrint = () => withPaintedRef((ref) => printPDF(ref, `invoice-${shortRef(order.id)}.pdf`));

  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        {() => (
          <>
            <ModalBody className="max-h-[65vh] overflow-y-auto">
              <div ref={invoiceRef} className="h-auto flex flex-col bg-white">
                {/* Header */}
                <h3 className="font-[600] text-center text-lg text-black mt-6">
                  {businessName}
                </h3>
                {order.businessAddress && (
                  <p className="text-center text-sm text-grey500 mb-4">{order.businessAddress}</p>
                )}

                {/* Draft banner — this receipt is not yet a server record. */}
                <div
                  style={{
                    margin: "0 0 16px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "#fef3c7",
                    color: "#92400e",
                    fontSize: "12px",
                    fontWeight: 700,
                    textAlign: "center",
                    letterSpacing: "0.04em",
                  }}
                >
                  PENDING — NOT YET SENT TO THE KITCHEN
                </div>

                {/* Metadata */}
                <div className="text-sm mb-2">
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Customer</span>
                    <span className="text-black">{order.customerName}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-black">Phone</span>
                      <span className="text-black">{order.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Table / QR</span>
                    <span className="text-black">{order.table || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Items</span>
                    <span className="text-black">
                      {grouped.length} lines / {order.itemCount} units
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Offline Ref</span>
                    <span className="text-black">{shortRef(order.id)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Taken</span>
                    <span className="text-black">
                      {moment(order.createdAt).format('MMM. D, YYYY, h:mma')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Printed</span>
                    <span className="text-black">{moment().format('MMM. D, YYYY, h:mma')}</span>
                  </div>
                </div>

                {order.attempts > 0 && (
                  <div
                    style={{
                      marginBottom: "12px",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: order.status === 'failed' ? "#fee2e2" : "#f1f5f9",
                      color: order.status === 'failed' ? "#991b1b" : "#334155",
                      fontSize: "12px",
                    }}
                  >
                    {order.status === 'failed'
                      ? `Sync failed after ${order.attempts} attempt${order.attempts === 1 ? '' : 's'}. ${order.lastError ?? ''}`.trim()
                      : `Send attempt ${order.attempts + 1} pending — will retry automatically.`}
                  </div>
                )}

                <Divider className="my-2" />

                <div className="flex justify-between text-sm py-1">
                  <span className="font-semibold text-black">Served By</span>
                  <span className="text-black">{staffName}</span>
                </div>

                <Divider className="my-2" />

                {/* Lines */}
                <div className="flex gap-3 text-sm font-semibold text-black mb-2">
                  <div className="w-12">Qty</div>
                  <div className="flex-1">Description</div>
                  <div className="w-24 text-right">Amount</div>
                </div>

                <div className="space-y-3">
                  {grouped.map((item, index) => (
                    <div key={index} className="flex gap-3 border-b pb-1 text-sm text-black">
                      <div className="w-12 text-black">{item.quantity}</div>
                      <div className="flex-1">
                        <div className="text-black font-medium">{item.itemName}</div>
                        {item.isPacked && item.packingCost > 0 && (
                          <div className="text-xs text-grey500 mt-0.5">
                            Packing {money(item.packingCost)}
                          </div>
                        )}
                        {item.comments.map((comment, ci) => (
                          <div key={ci} className="text-xs text-grey500 italic mt-0.5">
                            Note: {comment}
                          </div>
                        ))}
                        <div className="text-grey500 text-xs ml-1">
                          ({money(item.unitPrice)})
                        </div>
                      </div>
                      <div className="w-24 text-right font-semibold text-black">
                        {money(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="text-sm mt-2">
                  {order.additionalCost > 0 && (
                    <div className="flex justify-between gap-3 text-black">
                      <span className="font-medium">
                        Additional cost
                        {order.additionalCostName && (
                          <span className="text-grey600 text-xs">
                            {' '}
                            ({order.additionalCostName.toLowerCase()})
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-gray-600">{money(order.additionalCost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-3 text-gray-600 font-semibold">
                    <span>Total</span>
                    <span>{money(order.subTotalAmount)}</span>
                  </div>

                  {order.isVatApplied && order.vatAmount > 0 && (
                    <div className="flex justify-between gap-3 text-gray-600">
                      <span className="font-medium">VAT</span>
                      <span className="font-semibold">{money(order.vatAmount)}</span>
                    </div>
                  )}

                  <Divider className="my-2" />

                  <div className="flex justify-center mt-3 mb-2">
                    <div className="text-center">
                      <p className="text-grey500 text-xs mb-1">Grand Total</p>
                      <p className="text-xl font-bold text-gray-600">{money(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {order.comment && (
                  <>
                    <Divider className="my-3" />
                    <div className="text-sm">
                      <span className="font-semibold text-black">Order note: </span>
                      <span className="text-black">{order.comment}</span>
                    </div>
                  </>
                )}

                <p
                  style={{
                    marginTop: "20px",
                    fontSize: "10px",
                    color: "#9ca3af",
                    textAlign: "center",
                    maxWidth: "360px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  This order is stored on the device and will be sent automatically once
                  connectivity returns. Reference {shortRef(order.id)}.
                </p>
              </div>
            </ModalBody>

            <div className="w-full flex gap-4 px-5 pb-5 pt-2">
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <HiOutlineDownload style={{ fontSize: 18 }} />
                Save as PDF
              </button>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #5F35D2, #7c5ce5)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(95,53,210,0.35)',
                }}
              >
                <FiPrinter style={{ fontSize: 18 }} />
                Print
              </button>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default QueuedOrderInvoice;