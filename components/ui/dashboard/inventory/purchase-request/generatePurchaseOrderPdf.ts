import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PurchaseRequest } from "./types";
import { getJsonItemFromLocalStorage } from "@/lib/utils";

/**
 * Generates a Purchase Order PDF and returns it as a File object
 * suitable for email attachment.
 */
export function generatePurchaseOrderPdfFile(order: PurchaseRequest): File {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInfo = getJsonItemFromLocalStorage("business");
  const business = businessInfo?.[0];
  const requestorName = userInformation
    ? `${userInformation.firstName || ""} ${userInformation.lastName || ""}`.trim()
    : "N/A";
  const businessName = business?.businessName || "My Business";
  const businessAddress = business?.businessAddress || "";
  const businessCity = business?.city || "";
  const businessState = business?.state || "";
  const businessPhone = business?.businessContactNumber || "";

  const formatCurrency = (value: number) => {
    const formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `N${formatted}`;
  };

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
  drawValue(order.requestId || "N/A", col1, y);
  drawValue(order.requestDate || "N/A", col2, y);
  drawValue(order.expectedDeliveryDate || "N/A", col3, y);
  y += 10;

  // VENDOR / SHIP TO table
  const halfWidth = (pageWidth - margin * 2 - 4) / 2;
  const vendorX = col1;
  const shipX = col1 + halfWidth + 4;

  // Header bars
  doc.setFillColor(95, 53, 210);
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
    order.supplierName || "N/A",
    order.companyName || "N/A",
    order.supplierAddress || "",
    order.supplierEmail || "",
    order.supplierPhone || "",
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
  drawValue(order.deliveryAddress || "N/A", col1, y);
  y += 10;

  // Items table
  const tableBody = order.items.map((item, i) => [
    i + 1,
    item.itemName,
    item.unitName,
    formatCurrency(item.costPerUnit),
    item.requiredStock,
    formatCurrency(item.cost),
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
  const subTotal =
    order.subTotalAmount ?? order.items.reduce((sum, item) => sum + item.cost, 0);
  const vatRate = order.vatRate ?? 0;
  const isVatApplied = order.isVatApplied ?? false;
  const vatAmount = order.vatAmount ?? 0;
  const additionalCost = order.additionalCost ?? 0;
  const additionalCostName = order.additionalCostName || "";
  const grandTotal = order.totalCost ?? subTotal + vatAmount + additionalCost;

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

  if (isVatApplied && vatRate > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`VAT (${vatRate}%)`, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(formatCurrency(vatAmount), valueX, y, { align: "right" });
    y += 7;
  }

  if (additionalCost > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(additionalCostName || "Additional Cost", labelX, y);
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

  // Return as File object
  const pdfBlob = doc.output("blob");
  const fileName = `${order.requestId || "purchase-order"}.pdf`;
  return new File([pdfBlob], fileName, { type: "application/pdf" });
}
