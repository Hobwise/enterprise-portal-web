"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { LuPackageCheck, LuCopy, LuXCircle, LuMail, LuSearch } from "react-icons/lu";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";
import { historyColumns } from "./data";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

interface PurchaseRequestHistoryTableProps {
  data: PurchaseRequest[];
  onViewRequest: (request: PurchaseRequest) => void;
  onReceiveRequest: (request: PurchaseRequest) => void;
  onDuplicateRequest: (request: PurchaseRequest) => void;
  onCancelRequest: (request: PurchaseRequest) => void;
  onSendMail: (request: PurchaseRequest) => void;
  // Server-side pagination
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<(requestId: string, e: React.MouseEvent<HTMLButtonElement>) => void>(() => {});

  toggleRef.current = (requestId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdown === requestId) {
      setOpenDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, left: rect.right });
    setOpenDropdown(requestId);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    if (!filterValue.trim()) return data;
    const query = filterValue.toLowerCase();
    return data.filter(
      (item) =>
        (item.reference || "").toLowerCase().includes(query) ||
        (item.supplierName || "").toLowerCase().includes(query) ||
        (item.companyName || "").toLowerCase().includes(query) ||
        (item.status || "").toLowerCase().includes(query)
    );
  }, [data, filterValue]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  // Find the active item for the portal dropdown
  const activeItem = openDropdown ? filteredData.find((item) => item.requestId === openDropdown) : null;

  const renderCell = useCallback((item: PurchaseRequest, columnKey: string) => {
    switch (columnKey) {
      case "reference":
        return <span className="text-sm font-medium text-gray-900">{item.reference || item.requestId}</span>;
      case "requestDate":
        return <span className="text-sm text-gray-500">{item.requestDate}</span>;
      case "requestId":
        return <span className="text-sm font-medium text-gray-900">{item.requestId}</span>;
      case "supplierName":
        return <span className="text-sm text-gray-500">{item.supplierName}</span>;
      case "companyName":
        return <span className="text-sm text-gray-500">{item.companyName}</span>;
      case "expectedDeliveryDate":
        return <span className="text-sm text-gray-500">{item.expectedDeliveryDate}</span>;
      case "numberOfItems":
        return <span className="text-sm text-gray-500">{item.numberOfItems}</span>;
      case "totalCost":
        return <span className="text-sm text-gray-500">{formatCurrency(item.totalCost)}</span>;
      case "status": {
        const colors = statusColorMap[item.status];
        return (
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: `${colors.bg} ${colors.text}`,
              content: "font-medium text-xs",
            }}
          >
            {item.status}
          </Chip>
        );
      }
      case "actions":
        return (
          <div
            className="relative flex justify-center items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              onClick={(e) => toggleRef.current(item.requestId, e)}
            >
              <HiOutlineDotsVertical className="text-[22px] text-gray-700" />
            </button>
          </div>
        );
      default:
        return null;
    }
  }, []);

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

      <div className="relative border border-primaryGrey rounded-lg overflow-hidden">
        {isActionLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Spinner size="lg" color="secondary" />
          </div>
        )}
        <Table
          radius="lg"
          isCompact
          removeWrapper
          aria-label="Purchase order history"
          classNames={{
            wrapper: ["max-h-[382px]"],
            th: [
              "text-default-500",
              "text-xs",
              "border-b",
              "border-divider",
              "py-4",
              "rounded-none",
              "bg-grey300",
            ],
            tr: "border-b border-divider rounded-none",
            td: ["py-3", "text-textGrey"],
          }}
          bottomContent={
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
          }
        >
          <TableHeader columns={historyColumns}>
            {(column) => (
              <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={filteredData} emptyContent="No purchase orders yet">
            {(item) => (
              <TableRow key={item.requestId} className="cursor-pointer hover:bg-gray-50">
                {(columnKey) => (
                  <TableCell>{renderCell(item, String(columnKey))}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dropdown portal — rendered outside the Table so state changes always take effect */}
      {activeItem && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-[200px] bg-white rounded-lg shadow-xl py-1"
          style={{ top: dropdownPos.top, left: dropdownPos.left, transform: "translateX(-100%)" }}
        >
          {activeItem.status === "Pending" && (
            <button
              className="w-full flex gap-3 items-center px-3 py-2 text-sm text-grey500 hover:bg-default-100 transition-colors whitespace-nowrap"
              onClick={() => { setOpenDropdown(null); onReceiveRequest(activeItem); }}
            >
              <LuPackageCheck className="text-[18px]" />
              <p>Receive PO</p>
            </button>
          )}
          <button
            className="w-full flex gap-3 items-center px-3 py-2 text-sm text-grey500 hover:bg-default-100 transition-colors whitespace-nowrap"
            onClick={() => { setOpenDropdown(null); onDuplicateRequest(activeItem); }}
          >
            <LuCopy className="text-[18px]" />
            <p>Duplicate PO</p>
          </button>
          {activeItem.status === "Pending" && (
            <button
              className="w-full flex gap-3 items-center px-3 py-2 text-sm text-danger-500 hover:bg-default-100 transition-colors whitespace-nowrap"
              onClick={() => { setOpenDropdown(null); onCancelRequest(activeItem); }}
            >
              <LuXCircle className="text-[18px]" />
              <p>Cancel</p>
            </button>
          )}
          {activeItem.status === "Pending" && (
            <button
              className="w-full flex gap-3 items-center px-3 py-2 text-sm text-grey500 hover:bg-default-100 transition-colors whitespace-nowrap"
              onClick={() => { setOpenDropdown(null); onSendMail(activeItem); }}
            >
              <LuMail className="text-[18px]" />
              <p>Send Mail to Supplier</p>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PurchaseRequestHistoryTable;
