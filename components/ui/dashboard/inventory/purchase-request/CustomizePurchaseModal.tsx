"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { Download, ChevronDown } from "lucide-react";
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
  const [vatEnabled, setVatEnabled] = useState(false);
  const [vatPercent, setVatPercent] = useState(0);
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
  const business = businessInfo?.[0];
  const requestorName = userInformation
    ? `${userInformation.firstName || ""} ${userInformation.lastName || ""}`.trim()
    : "N/A";
  const requestorEmail = userInformation?.email || "";
  const businessName = business?.businessName || "My Business";
  const businessAddress = business?.businessAddress || "";
  const businessCity = business?.city || "";
  const businessState = business?.state || "";
  const businessPhone = business?.businessContactNumber || "";

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
      // Pre-populate delivery address from business location
      const parts = [businessAddress, businessCity, businessState].filter(Boolean);
      setDeliveryAddress(parts.join(", "));
      setExpectedDate("");
      setVatEnabled(false);
      setVatPercent(0);
      setAdditionalCostLabel("");
      setAdditionalCost(0);
    }
  }, [isOpen, selectedItems, businessAddress, businessCity, businessState]);

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
  const vat = useMemo(() => vatEnabled ? subTotal * (vatPercent / 100) : 0, [subTotal, vatPercent, vatEnabled]);
  const grandTotal = useMemo(() => subTotal + vat + additionalCost, [subTotal, vat, additionalCost]);

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const formatCurrencyPdf = (value: number) => {
    const formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `N${formatted}`;
  };

  const handleDownloadPdf = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Purchase Order", margin, y);
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

    // Row 1: Order ID, Date, Expected Delivery
    drawLabel("Order ID", col1, y);
    drawLabel("Order Date", col2, y);
    drawLabel("Expected Delivery", col3, y);
    y += 5;
    drawValue(requestId, col1, y);
    drawValue(todayFormatted, col2, y);
    drawValue(expectedDate || "N/A", col3, y);
    y += 10;

    // VENDOR / SHIP TO table
    const halfWidth = (pageWidth - margin * 2 - 4) / 2;
    const vendorX = col1;
    const shipX = col1 + halfWidth + 4;

    // Header bars
    doc.setFillColor(61, 66, 74);
    doc.rect(vendorX, y, halfWidth, 7, "F");
    doc.rect(shipX, y, halfWidth, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255);
    doc.text("VENDOR", vendorX + 4, y + 5);
    doc.text("SHIP TO", shipX + 4, y + 5);
    y += 10;

    // Vendor details
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.setFontSize(9);
    const vendorLines = [
      supplier?.name || "N/A",
      supplier?.companyName || "N/A",
      supplier?.address || "",
      supplier?.email || "",
      supplier?.phoneNumber || "",
    ].filter(Boolean);
    vendorLines.forEach((line) => {
      doc.text(line, vendorX + 4, y);
      y += 5;
    });

    // Ship To details (reset y for right column)
    let shipY = y - vendorLines.length * 5;
    const shipLines = [
      requestorName,
      businessName,
      businessAddress,
      [businessCity, businessState].filter(Boolean).join(", "),
      businessPhone,
    ].filter(Boolean);
    shipLines.forEach((line) => {
      doc.text(line, shipX + 4, shipY);
      shipY += 5;
    });

    y = Math.max(y, shipY) + 5;

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
      formatCurrencyPdf(item.costPerUnit),
      item.requiredStock,
      formatCurrencyPdf(item.cost),
    ]);

    const tableWidth = pageWidth - margin * 2;

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
        0: { cellWidth: tableWidth * 0.06, halign: "center" },
        1: { cellWidth: tableWidth * 0.34 },
        2: { cellWidth: tableWidth * 0.12 },
        3: { cellWidth: tableWidth * 0.16, halign: "left" },
        4: { cellWidth: tableWidth * 0.16, halign: "center" },
        5: { cellWidth: tableWidth * 0.16, halign: "left" },
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
    doc.text(formatCurrencyPdf(subTotal), valueX, y, { align: "right" });
    y += 7;

    if (vatEnabled && vatPercent > 0) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`VAT (${vatPercent}%)`, labelX, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50);
      doc.text(formatCurrencyPdf(vat), valueX, y, { align: "right" });
      y += 7;
    }

    if (additionalCost > 0) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(additionalCostLabel || "Additional Cost", labelX, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50);
      doc.text(formatCurrencyPdf(additionalCost), valueX, y, { align: "right" });
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
    doc.text(formatCurrencyPdf(grandTotal), valueX, y, { align: "right" });

    doc.save(`${requestId}.pdf`);
  }, [
    items, requestId, todayFormatted, expectedDate, requestorName,
    requestorEmail, supplier, businessName, businessAddress,
    businessCity, businessState, businessPhone, deliveryAddress,
    subTotal, vat, vatPercent, vatEnabled, additionalCost,
    additionalCostLabel, grandTotal,
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

    onSend({
      items,
      deliveryAddress,
      expectedDate,
      vatPercent: vatEnabled ? vatPercent : 0,
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
            <ModalBody className="px-4 py-4">
              {/* Top row: Date, Expected Delivery */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-6 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                      Request Date
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      {todayFormatted}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                      Expected Delivery
                    </p>
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      min={today}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-xs text-gray-700 bg-white"
                    />
                  </div>
                </div>

                {/* VENDOR / SHIP TO two-column layout */}
                <div className="grid grid-cols-2 gap-3">
                  {/* VENDOR column */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-[#3D424A] px-3 py-1.5">
                      <p className="text-[10px] font-semibold text-white uppercase tracking-wide">
                        Vendor
                      </p>
                    </div>
                    <div className="px-3 py-2 space-y-0.5">
                      <p className="text-xs font-medium text-gray-700">
                        {supplier?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {supplier?.companyName || "N/A"}
                      </p>
                      {supplier?.address && (
                        <p className="text-xs text-gray-500">{supplier.address}</p>
                      )}
                      {supplier?.email && (
                        <p className="text-xs text-gray-500">{supplier.email}</p>
                      )}
                      {supplier?.phoneNumber && (
                        <p className="text-xs text-gray-500">{supplier.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* SHIP TO column */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-[#3D424A] px-3 py-1.5">
                      <p className="text-[10px] font-semibold text-white uppercase tracking-wide">
                        Ship To
                      </p>
                    </div>
                    <div className="px-3 py-2 space-y-0.5">
                      <p className="text-xs font-medium text-gray-700">
                        {requestorName}
                      </p>
                      <p className="text-xs text-gray-600">{businessName}</p>
                      {(businessCity || businessState) && (
                        <p className="text-xs text-gray-500">
                          {[businessCity, businessState].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="flex items-center justify-center gap-1.5 text-gray-400 py-1">
                <ChevronDown size={14} className="animate-bounce" />
                <span className="text-[10px] uppercase tracking-wider">Scroll to view items & totals</span>
                <ChevronDown size={14} className="animate-bounce" />
              </div>

              {/* Items Table */}
              <div>
                <div className="border border-primaryGrey rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-grey300">
                      <tr>
                        <th className="text-[10px] text-default-500 text-left px-2 font-medium border-b border-divider py-2 ">
                          ITEM NAME
                        </th>
                        <th className="text-[10px] text-default-500 text-left px-2 font-medium border-b border-divider py-2 ">
                          UNIT
                        </th>
                        <th className="text-[10px] text-default-500 text-left px-2 font-medium border-b border-divider py-2 ">
                          COST/UNIT
                        </th>
                        <th className="text-[10px] text-default-500 text-left px-2 font-medium border-b border-divider py-2 ">
                          QTY REQUIRED
                        </th>
                        <th className="text-[10px] text-default-500 text-left px-2 font-medium border-b border-divider py-2 ">
                          AMOUNT
                        </th>
                        <th className="border-b border-divider "></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-divider hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <span className="text-xs text-textGrey">
                              {item.itemName}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-xs text-textGrey">
                              {item.unitName}
                            </span>
                          </td>
                          <td className="py-2 px-3 ">
                            <span className="text-xs text-textGrey">
                              {formatCurrency(item.costPerUnit)}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex ">
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
                                className="w-16 px-2 py-1 border text-black border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 ">
                            <span className="text-xs text-textGrey">
                              {formatCurrency(item.cost)}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => removeItem(index)}
                              className="p-0.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <IoClose size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-6 text-center text-xs text-gray-400"
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
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        size="sm"
                        isSelected={vatEnabled}
                        onValueChange={(checked) => {
                          setVatEnabled(checked);
                          if (!checked) setVatPercent(0);
                        }}
                        classNames={{
                          wrapper: "after:bg-[#5F35D2]",
                        }}
                      />
                      {vatEnabled ? (
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
                      ) : (
                        <span className="text-gray-400">Enable VAT</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(vat)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs gap-2">
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
                      className="w-28 px-2 py-0.5 border border-gray-200 rounded text-sm  font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                    />
                  </div>
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
