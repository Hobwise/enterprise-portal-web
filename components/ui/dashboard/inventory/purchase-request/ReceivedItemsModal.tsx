"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";

interface ReceivedItemsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequest: PurchaseRequest | null;
  onUpdateStock: (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => void;
  onReceivedStock: (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => void;
  isLoading?: boolean;
}

const statusColorMap: Record<PurchaseRequestStatus, { bg: string; text: string }> = {
  Pending:   { bg: "bg-yellow-100", text: "text-yellow-600" },
  Cancelled: { bg: "bg-red-100",    text: "text-red-600" },
  Closed:    { bg: "bg-gray-100",   text: "text-gray-600" },
  Received:  { bg: "bg-green-100",  text: "text-green-600" },
};

const ReceivedItemsModal: React.FC<ReceivedItemsModalProps> = ({
  isOpen,
  onOpenChange,
  purchaseRequest,
  onUpdateStock,
  onReceivedStock,
  isLoading,
}) => {
  const [receivedQuantities, setReceivedQuantities] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && purchaseRequest) {
     setReceivedQuantities(purchaseRequest.items.map(() => 0));
    }
  }, [isOpen, purchaseRequest]);

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const items = purchaseRequest?.items || [];

  const vatRate = purchaseRequest?.vatRate ?? 0;
  const isVatApplied = purchaseRequest?.isVatApplied ?? false;
  const additionalCost = purchaseRequest?.additionalCost ?? 0;
  const additionalCostName = purchaseRequest?.additionalCostName || 'Additional Cost';

  const subTotal = useMemo(
    () =>
      items.reduce((sum, item, index) => {
        const received = receivedQuantities[index] || 0;
        return sum + received * item.costPerUnit;
      }, 0),
    [items, receivedQuantities]
  );
  const vat = useMemo(() => (isVatApplied ? subTotal * (vatRate / 100) : 0), [subTotal, isVatApplied, vatRate]);
  const grandTotal = useMemo(() => subTotal + vat + additionalCost, [subTotal, vat, additionalCost]);

  const getReceivedItems = () =>
    items.map((item, index) => ({
      id: item.id,
      stockReceived: receivedQuantities[index] || 0,
    }));

  if (!purchaseRequest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="px-4 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#3D424A]">
                      {purchaseRequest.companyName}
                    </h2>
                    <p className="text-xs text-gray-400 font-normal">
                      {purchaseRequest.supplierName}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    classNames={{
                      base: `${statusColorMap[purchaseRequest.status].bg} ${statusColorMap[purchaseRequest.status].text}`,
                      content: "font-medium text-xs",
                    }}
                  >
                    {purchaseRequest.status}
                  </Chip>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoClose size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Info section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Reference</p>
                    <p className="text-xs font-medium text-gray-700">{purchaseRequest.reference || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Order Date</p>
                    <p className="text-xs font-medium text-gray-700">{purchaseRequest.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Expected Delivery</p>
                    <p className="text-xs font-medium text-gray-700">{purchaseRequest.expectedDeliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Total Cost</p>
                    <p className="text-xs font-medium text-gray-700">{formatCurrency(purchaseRequest.totalCost)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* VENDOR column */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-primaryColor px-3 py-1.5">
                      <p className="text-[10px] font-semibold text-white uppercase tracking-wide">Vendor</p>
                    </div>
                    <div className="px-3 py-2 space-y-0.5">
                      <p className="text-xs font-medium text-gray-700">{purchaseRequest.supplierName}</p>
                      <p className="text-xs text-gray-600">{purchaseRequest.companyName}</p>
                      {purchaseRequest.supplierAddress && (
                        <p className="text-xs text-gray-500">{purchaseRequest.supplierAddress}</p>
                      )}
                      {purchaseRequest.supplierEmail && (
                        <p className="text-xs text-gray-500">{purchaseRequest.supplierEmail}</p>
                      )}
                      {purchaseRequest.supplierPhone && (
                        <p className="text-xs text-gray-500">{purchaseRequest.supplierPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* SHIP TO column */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-primaryColor px-3 py-1.5">
                      <p className="text-[10px] font-semibold text-white uppercase tracking-wide">Ship To</p>
                    </div>
                    <div className="px-3 py-2 space-y-0.5">
                      {purchaseRequest.contactName && (
                        <p className="text-xs font-medium text-gray-700">{purchaseRequest.contactName}</p>
                      )}
                      <p className="text-xs text-gray-600">
                        {purchaseRequest.deliveryAddress || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-primaryGrey rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-grey300">
                    <tr>
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-left">
                        ITEM NAME
                      </th>
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-left">
                        UNIT
                      </th>
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-right">
                        COST/UNIT
                      </th>
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-center">
                        QTY REQUIRED
                      </th>
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-center">
                        STOCK RECEIVED
                      </th>
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-right">
                        AMOUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-divider hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <span className="text-xs text-textGrey">{item.itemName}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-xs text-textGrey">{item.unitName}</span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-xs text-textGrey">
                            {formatCurrency(item.costPerUnit)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-xs text-textGrey">{item.requiredStock}</span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min={0}
                              value={receivedQuantities[index] || ""}
                              onChange={(e) =>
                                setReceivedQuantities((prev) => {
                                  const next = [...prev];
                                  next[index] = parseInt(e.target.value) || 0;
                                  return next;
                                })
                              }
                              className="w-16 px-2 py-1 border text-black border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-xs text-textGrey">
                            {formatCurrency((receivedQuantities[index] || 0) * item.costPerUnit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col px-4 pb-3 pt-3 border-t border-gray-100">
              {/* Totals */}
              <div className="w-full flex justify-end mb-3">
                <div className="w-72 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sub Total</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(subTotal)}
                    </span>
                  </div>
                  {isVatApplied && vatRate > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">VAT ({vatRate}%)</span>
                      <span className="font-medium text-gray-700">
                        {formatCurrency(vat)}
                      </span>
                    </div>
                  )}
                  {additionalCost > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{additionalCostName}</span>
                      <span className="font-medium text-gray-700">
                        {formatCurrency(additionalCost)}
                      </span>
                    </div>
                  )}
                  <Divider />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="font-semibold text-[#3D424A]">
                      Grand Total
                    </span>
                    <span className="font-bold text-[#3D424A] text-sm">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="bordered"
                  className="border-primaryColor text-primaryColor font-medium rounded-lg px-6"
                  onPress={() => onUpdateStock(purchaseRequest.requestId, getReceivedItems())}
                  isDisabled={isLoading}
                >
                  Update Stock Count
                </Button>
                <Button
                  className="bg-primaryColor text-white font-medium rounded-lg px-6"
                  onPress={() => onReceivedStock(purchaseRequest.requestId, getReceivedItems())}
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Receiving...
                    </>
                  ) : (
                    <>Received Stock Items &rarr;</>
                  )}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReceivedItemsModal;
