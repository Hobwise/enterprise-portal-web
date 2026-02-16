"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SupplierInventoryItem, PurchaseRequestItem } from "./types";
import { Supplier } from "@/components/ui/dashboard/inventory/suppliers/types";
import { getJsonItemFromLocalStorage, notify } from "@/lib/utils";

interface CustomizePurchaseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  selectedItems: SupplierInventoryItem[];
  onSend: (data: {
    items: PurchaseRequestItem[];
    deliveryAddress: string;
    expectedDate: string;
    vatPercent: number;
    vatAmount: number;
    additionalCostLabel: string;
    additionalCost: number;
    subTotal: number;
    grandTotal: number;
  }) => void;
  isLoading?: boolean;
}

const CustomizePurchaseModal: React.FC<CustomizePurchaseModalProps> = ({
  isOpen,
  onOpenChange,
  supplier,
  selectedItems,
  onSend,
  isLoading,
}) => {
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [vatPercent, setVatPercent] = useState(7.5);
  const [additionalCostLabel, setAdditionalCostLabel] = useState("");
  const [additionalCost, setAdditionalCost] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInfo = getJsonItemFromLocalStorage("business");
  const requestorName = userInformation
    ? `${userInformation.firstName || ""} ${userInformation.lastName || ""}`.trim()
    : "N/A";
  const requestorEmail = userInformation?.email || "";
  const businessName = businessInfo?.[0]?.businessName || "My Business";

  // Generate a pseudo request ID
  const requestId = useMemo(() => {
    const num = Math.floor(Math.random() * 9999) + 1;
    return `PR-${String(num).padStart(7, "0")}`;
  }, [isOpen]);

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
      setExpectedDate("");
      setVatPercent(7.5);
      setAdditionalCostLabel("");
      setAdditionalCost(0);
    }
  }, [isOpen, selectedItems, supplier?.address]);

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

  const subTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.cost, 0),
    [items]
  );
  const vat = useMemo(() => subTotal * (vatPercent / 100), [subTotal, vatPercent]);
  const grandTotal = useMemo(() => subTotal + vat + additionalCost, [subTotal, vat, additionalCost]);

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const handleDownloadPdf = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Purchase Requisition", margin, y);
    y += 10;

    // Divider line
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Info grid
    doc.setFontSize(9);
    const col1 = margin;
    const col2 = margin + 60;
    const col3 = margin + 120;

    const drawLabel = (label: string, x: number, yPos: number) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140);
      doc.text(label, x, yPos);
    };
    const drawValue = (value: string, x: number, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50);
      doc.text(value, x, yPos);
    };

    // Row 1
    drawLabel("Request ID", col1, y);
    drawLabel("Request Date", col2, y);
    drawLabel("Expected Delivery", col3, y);
    y += 5;
    drawValue(requestId, col1, y);
    drawValue(todayFormatted, col2, y);
    drawValue(expectedDate || "N/A", col3, y);
    y += 8;

    // Row 2
    drawLabel("Requestor", col1, y);
    drawLabel("Supplier", col2, y);
    drawLabel("Company", col3, y);
    y += 5;
    drawValue(requestorName, col1, y);
    drawValue(supplier?.companyName || "N/A", col2, y);
    drawValue(supplier?.companyName || businessName, col3, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140);
    doc.setFontSize(8);
    doc.text(requestorEmail, col1, y);
    doc.text(`${supplier?.name || ""} - ${supplier?.email || ""}`, col2, y);
    if (supplier?.address) doc.text(supplier.address, col3, y);
    y += 8;

    // Delivery address
    doc.setFontSize(9);
    drawLabel("Shipping / Delivery Address", col1, y);
    y += 5;
    drawValue(deliveryAddress || "N/A", col1, y);
    y += 10;

    // Items table
    const tableBody = items.map((item, i) => [
      i + 1,
      item.itemName,
      item.unitName,
      formatCurrency(item.costPerUnit),
      item.requiredStock,
      formatCurrency(item.cost),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["#", "Item Name", "Unit", "Cost/Unit", "Qty Required", "Amount"]],
      body: tableBody,
      theme: "striped",
      headStyles: {
        fillColor: [95, 53, 210],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 9, textColor: 60 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Totals section — right-aligned
    const labelX = pageWidth - margin - 90;
    const valueX = pageWidth - margin;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Sub Total", labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(formatCurrency(subTotal), valueX, y, { align: "right" });
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`VAT (${vatPercent}%)`, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(formatCurrency(vat), valueX, y, { align: "right" });
    y += 7;

    if (additionalCost > 0) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(additionalCostLabel || "Additional Cost", labelX, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50);
      doc.text(formatCurrency(additionalCost), valueX, y, { align: "right" });
      y += 7;
    }

    // Divider
    doc.setDrawColor(200);
    doc.line(labelX, y, valueX, y);
    y += 6;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text("Grand Total", labelX, y);
    doc.text(formatCurrency(grandTotal), valueX, y, { align: "right" });

    doc.save(`${requestId}.pdf`);
  }, [
    items, requestId, todayFormatted, expectedDate, requestorName,
    requestorEmail, supplier, businessName, deliveryAddress,
    subTotal, vat, vatPercent, additionalCost, additionalCostLabel,
    grandTotal, formatCurrency,
  ]);

  const handleSend = () => {
    if (items.length === 0) {
      notify({ title: "Error!", text: "Please add at least one item", type: "error" });
      return;
    }

    const itemsMissingQty = items.filter((item) => !item.requiredStock || item.requiredStock <= 0);
    if (itemsMissingQty.length > 0) {
      notify({ title: "Error!", text: "Please enter the required quantity for all items", type: "error" });
      return;
    }

    if (!expectedDate) {
      notify({ title: "Error!", text: "Please select an expected delivery date", type: "error" });
      return;
    }

    if (!deliveryAddress.trim()) {
      notify({ title: "Error!", text: "Please enter a delivery address", type: "error" });
      return;
    }

    onSend({
      items,
      deliveryAddress,
      expectedDate,
      vatPercent,
      vatAmount: vat,
      additionalCostLabel,
      additionalCost,
      subTotal,
      grandTotal,
    });
  };

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
            {/* <ModalHeader className="flex items-center justify-between pb-0 pt-6 px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#3D424A]">
                  Purchase Requisition
                </h2>
                <Chip size="sm" color="warning" variant="flat">
                  Draft
                </Chip>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose size={20} className="text-gray-500" />
              </button>
            </ModalHeader> */}

            <ModalBody className="px-4 py-4">
              {/* Header Info Section */}
              <div className="bg-gray-50 rounded-xl p-6 ">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                  {/* Row 1 */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Request ID
                    </p>
                    <p className="text-sm font-semibold text-[#3D424A]">
                      {requestId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Request Date
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {todayFormatted}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Expected Delivery
                    </p>
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      min={today}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white"
                    />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Requestor
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {requestorName}
                    </p>
                    <p className="text-xs text-gray-400">{requestorEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Supplier
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {supplier?.companyName || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {supplier?.name} &middot; {supplier?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Company
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {supplier?.companyName || businessName}
                    </p>
                    {supplier?.address && (
                      <p className="text-xs text-gray-400 mt-1">
                        {supplier.address}
                      </p>
                    )}
                  </div>
                </div>

                <Divider className="my-3" />

                {/* Shipping Address */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Shipping / Delivery Address
                  </p>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="border border-primaryGrey rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-grey300">
                      <tr>
                        <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">
                          ITEM NAME
                        </th>
                        <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-left">
                          UNIT
                        </th>
                        <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-right">
                          COST/UNIT
                        </th>
                        <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-center">
                          QTY REQUIRED
                        </th>
                        <th className="text-xs text-default-500 font-medium border-b border-divider py-4 px-4 text-right">
                          AMOUNT
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-divider hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="text-sm text-textGrey">
                              {item.itemName}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-textGrey">
                              {item.unitName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm text-textGrey">
                              {formatCurrency(item.costPerUnit)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                min={0}
                                value={item.requiredStock || ""}
                                onChange={(e) =>
                                  updateRequiredStock(
                                    index,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-20 px-3 py-1.5 border text-black border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm text-textGrey">
                              {formatCurrency(item.cost)}
                            </span>
                          </td>
                          <td className="py-3 px-1">
                            <button
                              onClick={() => removeItem(index)}
                              className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <IoClose size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-sm text-gray-400"
                          >
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col px-4 pb-3 pt-4 border-t border-gray-100">
              {/* Totals */}
              <div className="w-full flex justify-end mb-5">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sub Total</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(subTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>VAT (</span>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={vatPercent}
                        onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                      />
                      <span>%)</span>
                    </div>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(vat)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm gap-2">
                    <input
                      type="text"
                      value={additionalCostLabel}
                      onChange={(e) => setAdditionalCostLabel(e.target.value)}
                      placeholder="Additional Cost (e.g. Shipping)"
                      className="flex-1 px-2 py-0.5 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                    />
                    <input
                      type="number"
                      min={0}
                      value={additionalCost || ""}
                      onChange={(e) => setAdditionalCost(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-28 px-2 py-0.5 border border-gray-200 rounded text-sm text-right font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                    />
                  </div>
                  <Divider />
                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-semibold text-[#3D424A]">
                      Grand Total
                    </span>
                    <span className="font-bold text-[#3D424A] text-base">
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
                  onPress={handleDownloadPdf}
                  startContent={<Download size={16} />}
                >
                  Download PDF
                </Button>
                <Button
                  className="bg-primaryColor text-white font-medium rounded-lg px-6"
                  onPress={handleSend}
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Sending...
                    </>
                  ) : (
                    <>Send Request &rarr;</>
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

export default CustomizePurchaseModal;
