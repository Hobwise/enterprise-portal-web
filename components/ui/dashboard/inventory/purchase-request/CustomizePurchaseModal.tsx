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
import { SupplierInventoryItem, PurchaseRequestItem } from "./types";
import { Supplier } from "@/components/ui/dashboard/inventory/suppliers/types";

interface CustomizePurchaseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  selectedItems: SupplierInventoryItem[];
  onSave: (items: PurchaseRequestItem[], deliveryAddress: string, expectedDate: string) => void;
  onSend: (items: PurchaseRequestItem[], deliveryAddress: string, expectedDate: string) => void;
}

const CustomizePurchaseModal: React.FC<CustomizePurchaseModalProps> = ({
  isOpen,
  onOpenChange,
  supplier,
  selectedItems,
  onSave,
  onSend,
}) => {
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expectedDate, setExpectedDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      setItems(
        selectedItems.map((item) => ({
          id: item.id,
          itemName: item.name,
          unitName: item.unitName,
          costPerUnit: item.costPerUnit,
          requiredStock: 0,
          cost: 0,
        }))
      );
      setDeliveryAddress("");
      setExpectedDate("");
    }
  }, [isOpen, selectedItems]);

  const updateRequiredStock = (index: number, value: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, requiredStock: value, cost: value * item.costPerUnit }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subTotal = useMemo(() => items.reduce((sum, item) => sum + item.cost, 0), [items]);
  const vat = useMemo(() => subTotal * 0.075, [subTotal]);
  const grandTotal = useMemo(() => subTotal + vat, [subTotal, vat]);

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const handleSave = () => {
    onSave(items, deliveryAddress, expectedDate);
  };

  const handleSend = () => {
    onSend(items, deliveryAddress, expectedDate);
  };

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
                  {supplier?.companyName || "Supplier"}
                </h2>
                <p className="text-sm text-gray-400 font-normal">{supplier?.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose size={20} className="text-gray-500" />
              </button>
            </ModalHeader>

            <ModalBody className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Date
                  </label>
                  <input
                    type="date"
                    value={today}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white text-sm"
                />
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
                      <th className="text-xs text-gray-500 font-medium py-3 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-700">{item.itemName}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{item.unitName}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency(item.costPerUnit)}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={0}
                            value={item.requiredStock || ""}
                            onChange={(e) =>
                              updateRequiredStock(index, parseInt(e.target.value) || 0)
                            }
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatCurrency(item.cost)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <IoClose size={18} />
                          </button>
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
                  onPress={handleSave}
                >
                  Save Purchase Request
                </Button>
                <Button
                  className="bg-primaryColor text-white font-medium rounded-lg"
                  onPress={handleSend}
                >
                  Send Purchase Request &rarr;
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CustomizePurchaseModal;
