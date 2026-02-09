"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { PurchaseRequest } from "./types";

interface ReceivedItemsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequest: PurchaseRequest | null;
  onUpdateStock: (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => void;
  onReceivedStock: (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => void;
}

const ReceivedItemsModal: React.FC<ReceivedItemsModalProps> = ({
  isOpen,
  onOpenChange,
  purchaseRequest,
  onUpdateStock,
  onReceivedStock,
}) => {
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen && purchaseRequest) {
      const initial: Record<string, number> = {};
      purchaseRequest.items.forEach((item) => {
        initial[item.id] = 0;
      });
      setReceivedQuantities(initial);
    }
  }, [isOpen, purchaseRequest]);

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const items = purchaseRequest?.items || [];

  const subTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const received = receivedQuantities[item.id] || 0;
        return sum + received * item.costPerUnit;
      }, 0),
    [items, receivedQuantities]
  );
  const vat = useMemo(() => subTotal * 0.075, [subTotal]);
  const grandTotal = useMemo(() => subTotal + vat, [subTotal, vat]);

  const getReceivedItems = () =>
    items.map((item) => ({
      id: item.id,
      stockReceived: receivedQuantities[item.id] || 0,
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
                  <p className="text-xs text-gray-400">Request ID</p>
                  <p className="text-sm font-medium text-gray-700">{purchaseRequest.requestId}</p>
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
                  <p className="text-xs text-gray-400">Contact Name</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.contactName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.supplierPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-700">
                    {purchaseRequest.deliveryAddress}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Request Date</p>
                  <p className="text-sm font-medium text-gray-700">{purchaseRequest.requestDate}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">ITEM NAME</th>
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">ITEM UNIT</th>
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">COST/UNIT</th>
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">REQUIRED STOCK</th>
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">STOCK RECEIVED</th>
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">COST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-700">{item.itemName}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{item.unitName}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency(item.costPerUnit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{item.requiredStock}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={0}
                            value={receivedQuantities[item.id] || ""}
                            onChange={(e) =>
                              setReceivedQuantities((prev) => ({
                                ...prev,
                                [item.id]: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency((receivedQuantities[item.id] || 0) * item.costPerUnit)}
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
                <div className="flex items-center gap-8 text-sm">
                  <span className="text-gray-500">VAT (7.5%):</span>
                  <span className="font-medium text-gray-900 w-32 text-right">
                    {formatCurrency(vat)}
                  </span>
                </div>
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
                >
                  Update Stock Count
                </Button>
                <Button
                  className="bg-primaryColor text-white font-medium rounded-lg"
                  onPress={() => onReceivedStock(purchaseRequest.requestId, getReceivedItems())}
                >
                  Received Stock Items &rarr;
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
