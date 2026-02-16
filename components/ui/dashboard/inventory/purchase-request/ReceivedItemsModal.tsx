"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { PurchaseRequest } from "./types";

interface ReceivedItemsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequest: PurchaseRequest | null;
  onUpdateStock: (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => void;
  onReceivedStock: (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => void;
  isLoading?: boolean;
}

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
      size="3xl"
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#3D424A]">
                  {purchaseRequest.companyName}
                </h2>
                <p className="text-sm text-gray-400 font-normal">
                  {purchaseRequest.supplierName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose size={20} className="text-gray-500" />
              </button>
            </ModalHeader>

            <ModalBody className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Reference</p>
                  <p className="text-sm font-medium text-gray-700">{purchaseRequest.reference || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Supplier Name</p>
                  <p className="text-sm font-medium text-gray-700">{purchaseRequest.supplierName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Cost</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatCurrency(purchaseRequest.totalCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expected Delivery</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.expectedDeliveryDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.supplierEmail || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.supplierPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.supplierAddress || purchaseRequest.deliveryAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Request Date</p>
                  <p className="text-sm font-medium text-gray-700">{purchaseRequest.requestDate}</p>
                </div>
              </div>

              <div className="border border-primaryGrey rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-grey300">
                    <tr>
                      <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">ITEM NAME</th>
                      <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">ITEM UNIT</th>
                      <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">COST/UNIT</th>
                      <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">REQUIRED STOCK</th>
                      <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">STOCK RECEIVED</th>
                      <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">COST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-divider">
                        <td className="py-3 px-4 text-sm text-textGrey">{item.itemName}</td>
                        <td className="py-3 px-4 text-sm text-textGrey">{item.unitName}</td>
                        <td className="py-3 px-4 text-sm text-textGrey">
                          {formatCurrency(item.costPerUnit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-textGrey">{item.requiredStock}</td>
                        <td className="py-3 px-4">
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
                            className="w-24 px-3 py-2 border text-black border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-textGrey">
                          {formatCurrency((receivedQuantities[index] || 0) * item.costPerUnit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col border-t border-gray-100 pt-4">
              <div className="w-full flex flex-col items-end gap-1 mb-4">
                <div className="flex items-center gap-8 text-sm">
                  <span className="text-gray-500">Sub Total:</span>
                  <span className="font-medium text-gray-900 w-32 text-right">
                    {formatCurrency(subTotal)}
                  </span>
                </div>
                {isVatApplied && vatRate > 0 && (
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-gray-500">VAT ({vatRate}%):</span>
                    <span className="font-medium text-gray-900 w-32 text-right">
                      {formatCurrency(vat)}
                    </span>
                  </div>
                )}
                {additionalCost > 0 && (
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-gray-500">{additionalCostName}:</span>
                    <span className="font-medium text-gray-900 w-32 text-right">
                      {formatCurrency(additionalCost)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-8 text-sm border-t border-gray-200 pt-2 mt-1">
                  <span className="text-gray-700 font-semibold">Grand Total:</span>
                  <span className="font-bold text-gray-900 w-32 text-right">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="bordered"
                  className="border-primaryColor text-primaryColor font-medium rounded-lg"
                  onPress={() => onUpdateStock(purchaseRequest.requestId, getReceivedItems())}
                  isDisabled={isLoading}
                >
                  Update Stock Count
                </Button>
                <Button
                  className="bg-primaryColor text-white font-medium rounded-lg"
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
