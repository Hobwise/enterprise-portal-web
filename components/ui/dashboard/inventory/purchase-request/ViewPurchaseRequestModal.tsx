"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";

interface ViewPurchaseRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequest: PurchaseRequest | null;
}

const statusColorMap: Record<PurchaseRequestStatus, { bg: string; text: string }> = {
  Saved: { bg: "bg-gray-100", text: "text-gray-600" },
  Sent: { bg: "bg-purple-100", text: "text-purple-600" },
  Received: { bg: "bg-orange-100", text: "text-orange-600" },
  Stocked: { bg: "bg-green-100", text: "text-green-600" },
};

const ViewPurchaseRequestModal: React.FC<ViewPurchaseRequestModalProps> = ({
  isOpen,
  onOpenChange,
  purchaseRequest,
}) => {
  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  if (!purchaseRequest) return null;

  const subTotal = purchaseRequest.items.reduce((sum, item) => sum + item.cost, 0);
  const vat = subTotal * 0.075;
  const grandTotal = subTotal + vat;
  const colors = statusColorMap[purchaseRequest.status];

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
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#3D424A]">
                    {purchaseRequest.companyName}
                  </h2>
                  <p className="text-sm text-gray-400 font-normal">
                    {purchaseRequest.supplierName}
                  </p>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: `${colors.bg} ${colors.text}`,
                    content: "font-medium text-xs",
                  }}
                >
                  {purchaseRequest.status}
                </Chip>
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
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-left">COST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequest.items.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-700">{item.itemName}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{item.unitName}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency(item.costPerUnit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{item.requiredStock}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col border-t border-gray-100 pt-4">
              <div className="w-full flex flex-col items-end gap-1">
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
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewPurchaseRequestModal;
