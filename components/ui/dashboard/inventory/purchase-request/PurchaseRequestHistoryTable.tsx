"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { MoreHorizontal } from "lucide-react";
import { LuPackageCheck, LuCopy, LuXCircle, LuMail, LuSearch } from "react-icons/lu";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";
import { historyColumns } from "./data";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

interface PurchaseRequestHistoryTableProps {
  data: PurchaseRequest[];
  onViewRequest?: (request: PurchaseRequest) => void;
  onReceiveRequest: (request: PurchaseRequest) => void;
  onDuplicateRequest: (request: PurchaseRequest) => void;
  onCancelRequest: (request: PurchaseRequest) => void;
  onSendMail: (request: PurchaseRequest) => void;
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isActionLoading?: boolean;
}

const statusColorMap: Record<PurchaseRequestStatus, { bg: string; text: string }> = {
  Pending:   { bg: "bg-yellow-100", text: "text-yellow-600" },
  Cancelled: { bg: "bg-red-100",    text: "text-red-600" },
  Closed:    { bg: "bg-gray-100",   text: "text-gray-600" },
  Received:  { bg: "bg-green-100",  text: "text-green-600" },
};

const defaultColors = { bg: "bg-yellow-100", text: "text-yellow-600" };

const PurchaseRequestHistoryTable: React.FC<PurchaseRequestHistoryTableProps> = ({
  data,
  onReceiveRequest,
  onDuplicateRequest,
  onCancelRequest,
  onSendMail,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  isActionLoading,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close dropdown on any outside click — no ref needed
  useEffect(() => {
    if (!openMenuId) return;
    const handleClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.('[data-menu-container]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, [openMenuId]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!filterValue.trim()) return data;
    const query = filterValue.toLowerCase();
    return data.filter(
      (item) =>
        item &&
        ((item.reference || "").toLowerCase().includes(query) ||
        (item.supplierName || "").toLowerCase().includes(query) ||
        (item.status || "").toLowerCase().includes(query))
    );
  }, [data, filterValue]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatCurrency = (value: number) => {
    const num = typeof value === "number" && !isNaN(value) ? value : 0;
    return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const toggleMenu = useCallback((requestId: string) => {
    setOpenMenuId((prev) => (prev === requestId ? null : requestId));
  }, []);

  const renderCell = (item: PurchaseRequest, columnKey: string) => {
    if (!item) return null;
    const isPending = item.status === "Pending";

    switch (columnKey) {
      case "reference":
        return <span className="text-sm font-medium text-gray-900">{item.reference || item.requestId}</span>;
      case "requestDate":
        return <span className="text-sm text-gray-500">{item.requestDate}</span>;
      case "requestId":
        return <span className="text-sm font-medium text-gray-900">{item.requestId}</span>;
      case "supplierName":
        return <span className="text-sm text-gray-500">{item.supplierName}</span>;
      case "expectedDeliveryDate":
        return <span className="text-sm text-gray-500">{item.expectedDeliveryDate}</span>;
      case "numberOfItems":
        return <span className="text-sm text-gray-500">{item.numberOfItems}</span>;
      case "totalCost":
        return <span className="text-sm text-gray-500">{formatCurrency(item.totalCost)}</span>;
      case "status": {
        const colors = statusColorMap[item.status] || defaultColors;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs ${colors.bg} ${colors.text}`}>
            {item.status || "Unknown"}
          </span>
        );
      }
      case "actions": {
        const isOpen = openMenuId === item.purchaseOrderId;
        return (
          <div
            className="relative flex justify-center items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div data-menu-container>
              <button
                type="button"
                aria-label="actions"
                className="cursor-pointer flex items-center gap-0.5 text-gray-500 hover:text-black transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                onClick={() => toggleMenu(item.purchaseOrderId)}
              >
                <MoreHorizontal size={18} />
              </button>
              {isOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => { setOpenMenuId(null); onDuplicateRequest(item); }}
                  >
                    <LuCopy size={16} />
                    Duplicate PO
                  </button>
                  {isPending && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => { setOpenMenuId(null); onReceiveRequest(item); }}
                    >
                      <LuPackageCheck size={16} />
                      Receive PO
                    </button>
                  )}
                  {isPending && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => { setOpenMenuId(null); onSendMail(item); }}
                    >
                      <LuMail size={16} />
                      Send Mail to Supplier
                    </button>
                  )}
                  {isPending && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => { setOpenMenuId(null); onCancelRequest(item); }}
                    >
                      <LuXCircle size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#3D424A]">Purchase Order History</h3>
        <div className="relative">
          <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] w-64"
          />
        </div>
      </div>

      <div className="relative border border-primaryGrey rounded-lg overflow-visible">
        {isActionLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#5F35D2]" />
          </div>
        )}
        <div className="max-h-[382px] overflow-auto">
          <table className="w-full" aria-label="Purchase order history">
            <thead>
              <tr className="border-b border-divider">
                {historyColumns.map((column) => (
                  <th
                    key={column.uid}
                    className={`text-default-500 text-xs border-b border-divider py-4 px-3 bg-grey300 font-medium ${
                      column.uid === "actions" ? "text-center" : "text-left"
                    }`}
                  >
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={historyColumns.length} className="text-center py-8 text-gray-400 text-sm">
                    No purchase orders yet
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item?.requestId || index}
                    className="border-b border-divider cursor-pointer hover:bg-gray-50"
                  >
                    {historyColumns.map((column) => (
                      <td key={column.uid} className="py-3 px-3 text-textGrey">
                        {renderCell(item, column.uid)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex w-full justify-center">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={currentPage < totalPages}
            hasPrevious={currentPage > 1}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onNext={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            onPrevious={() => onPageChange(Math.max(currentPage - 1, 1))}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestHistoryTable;
