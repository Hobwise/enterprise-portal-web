"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Chip,
  Divider,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";

interface ViewPurchaseRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequest: PurchaseRequest | null;
}

const statusColorMap: Record<PurchaseRequestStatus, { bg: string; text: string }> = {
  Pending:   { bg: "bg-yellow-100", text: "text-yellow-600" },
  Cancelled: { bg: "bg-red-100",    text: "text-red-600" },
  Closed:    { bg: "bg-gray-100",   text: "text-gray-600" },
  Received:  { bg: "bg-green-100",  text: "text-green-600" },
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

  const subTotal = purchaseRequest.subTotalAmount ?? purchaseRequest.items.reduce((sum, item) => sum + item.cost, 0);
  const vatRate = purchaseRequest.vatRate ?? 0;
  const vat = purchaseRequest.vatAmount ?? 0;
  const additionalCost = purchaseRequest.additionalCost ?? 0;
  const additionalCostName = purchaseRequest.additionalCostName || 'Additional Cost';
  const grandTotal = purchaseRequest.totalCost;
  const colors = statusColorMap[purchaseRequest.status];

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
                      base: `${colors.bg} ${colors.text}`,
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
                      <th className="text-[10px] text-default-500 font-medium border-b border-divider py-2 px-3 text-right">
                        AMOUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequest.items.map((item, index) => (
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
                        <td className="py-2 px-3 text-right">
                          <span className="text-xs text-textGrey">
                            {formatCurrency(item.cost)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col px-4 pb-3 pt-3 border-t border-gray-100">
              <div className="w-full flex justify-end">
                <div className="w-72 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sub Total</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(subTotal)}
                    </span>
                  </div>
                  {purchaseRequest.isVatApplied && vat > 0 && (
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
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewPurchaseRequestModal;
