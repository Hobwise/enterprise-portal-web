import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getJsonItemFromLocalStorage } from "@/lib/utils";

export interface StockTransferDetails {
  id: string;
  reference: string;
  dateUpdated: string;
  expectedDate?: string;
  destinationBusinessName: string;
  sourceBusinessName: string;
  totalAmount?: number;
  orderDetails: {
    sourceInventoryItemName?: string;
    destinationInventoryItemName?: string;
    inventoryUnitName?: string;
    quantity?: number;
    itemCost?: number;
  }[];
}

/**
 * Generates a Stock Transfer PDF and returns it as a File object
 * suitable for email attachment.
 */
export function generateStockTransferPdfFile(transfer: StockTransferDetails): File {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const businessInfo = getJsonItemFromLocalStorage("business");
  const business = businessInfo?.[0];
  const businessName = business?.businessName || "My Business";

  const formatCurrency = (value: number) => {
    const formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `N${formatted}`;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Stock Transfer", margin, y);
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

  // Row 1: Reference, Date
  drawLabel("Reference", col1, y);
  drawLabel("Date", col2, y);
  y += 5;
  drawValue(transfer.reference || "N/A", col1, y);
  drawValue(
    transfer.dateUpdated ? new Date(transfer.dateUpdated).toLocaleDateString("en-GB") : "N/A",
    col2,
    y
  );
  y += 10;

  // FROM / TO table
  const halfWidth = (pageWidth - margin * 2 - 4) / 2;
  const fromX = col1;
  const toX = col1 + halfWidth + 4;

  // Header bars
  doc.setFillColor(95, 53, 210);
  doc.rect(fromX, y, halfWidth, 7, "F");
  doc.rect(toX, y, halfWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255);
  doc.text("FROM", fromX + 4, y + 5);
  doc.text("TO", toX + 4, y + 5);
  y += 10;

  // Details
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.setFontSize(9);
  
  const fromLines = [transfer.sourceBusinessName || businessName];
  fromLines.forEach((line) => {
    doc.text(line, fromX + 4, y);
  });

  const toLines = [transfer.destinationBusinessName || "N/A"];
  toLines.forEach((line) => {
    doc.text(line, toX + 4, y);
  });

  y += 10;

  // Items table
  const items = transfer.orderDetails || [];
  const tableBody = items.map((item, i) => [
    i + 1,
    item.sourceInventoryItemName || "N/A",
    item.inventoryUnitName || "N/A",
    item.quantity || 0,
    formatCurrency(item.itemCost || 0),
    formatCurrency((item.quantity || 0) * (item.itemCost || 0)),
  ]);

  const tableWidth = pageWidth - margin * 2;

  autoTable(doc, {
    startY: y,
    head: [["#", "Item Name", "Unit", "Quantity", "Cost/Unit", "Amount"]],
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
      3: { cellWidth: tableWidth * 0.16, halign: "center" },
      4: { cellWidth: tableWidth * 0.16, halign: "left" },
      5: { cellWidth: tableWidth * 0.16, halign: "left" },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Totals section — right-aligned
  const grandTotal = transfer.totalAmount ?? items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.itemCost || 0)), 0);

  const labelX = pageWidth - margin - 90;
  const valueX = pageWidth - margin;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("Grand Total", labelX, y);
  doc.text(formatCurrency(grandTotal), valueX, y, { align: "right" });

  // Return as File object
  const pdfBlob = doc.output("blob");
  const fileName = `${transfer.reference || "stock-transfer"}.pdf`;
  return new File([pdfBlob], fileName, { type: "application/pdf" });
}
