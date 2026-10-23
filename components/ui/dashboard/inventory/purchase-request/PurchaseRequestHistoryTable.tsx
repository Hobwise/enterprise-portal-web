"use client";

import React, { useState, useMemo } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  LuPackageCheck,
  LuCopy,
  LuMail,
  LuSearch,
  LuEye,
} from "react-icons/lu";
import { XCircle } from "lucide-react";
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";
import { historyColumns } from "./data";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";
import useMobile from "@/hooks/useMobile";

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

const statusColorMap: Record<
  PurchaseRequestStatus,
  "warning" | "danger" | "default" | "success"
> = {
  Pending: "warning",
  Cancelled: "danger",
  Closed: "default",
  Received: "success",
};

const PurchaseRequestHistoryTable: React.FC<
  PurchaseRequestHistoryTableProps
> = ({
  data,
  onViewRequest,
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
  const isMobile = useMobile();

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!filterValue.trim()) return data;
    const query = filterValue.toLowerCase();
    return data.filter(
      (item) =>
        item &&
        ((item.reference || "").toLowerCase().includes(query) ||
          (item.supplierName || "").toLowerCase().includes(query) ||
          (item.status || "").toLowerCase().includes(query)),
    );
  }, [data, filterValue]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatCurrency = (value: number) => {
    const num = typeof value === "number" && !isNaN(value) ? value : 0;
    return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const renderCell = (item: PurchaseRequest, columnKey: string) => {
    if (!item) return null;
    const isPending = item.status === "Pending";

    switch (columnKey) {
      case "reference":
        return (
          <span className="text-sm font-medium text-gray-900">
            {item.reference || item.requestId}
          </span>
        );
      case "requestDate":
        return (
          <span className="text-sm text-gray-500">{item.requestDate}</span>
        );
      case "requestId":
        return (
          <span className="text-sm font-medium text-gray-900">
            {item.requestId}
          </span>
        );
      case "supplierName":
        return (
          <span className="text-sm text-gray-500">{item.supplierName}</span>
        );
      case "expectedDeliveryDate":
        return (
          <span className="text-sm text-gray-500">
            {item.expectedDeliveryDate}
          </span>
        );
      case "numberOfItems":
        return (
          <span className="text-sm text-gray-500">{item.numberOfItems}</span>
        );
      case "totalCost":
        return (
          <span className="text-sm text-gray-500">
            {formatCurrency(item.totalCost)}
          </span>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[item.status] || "warning"}
            size="sm"
            variant="bordered"
          >
            {item.status || "Unknown"}
          </Chip>
        );
      case "actions":
        return (
          <div
            className="relative flex justify-center items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown>
              <DropdownTrigger>
                <button
                  type="button"
                  aria-label="actions"
                  className="cursor-pointer flex items-center gap-0.5 text-gray-500 hover:text-black transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                >
                  <HiOutlineDotsVertical />
                </button>
              </DropdownTrigger>
              <DropdownMenu className="text-black">
                <DropdownSection>{renderActions(item)}</DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActions = (item: PurchaseRequest) => {
    const isPending = item.status === "Pending";
    return [
      <DropdownItem key="view" onClick={() => onViewRequest?.(item)}>
        <div className="flex gap-3 items-center">
          <LuEye size={16} />
          <p>View PO</p>
        </div>
      </DropdownItem>,
      <DropdownItem key="duplicate" onClick={() => onDuplicateRequest(item)}>
        <div className="flex gap-3 items-center">
          <LuCopy size={16} />
          <p>Duplicate PO</p>
        </div>
      </DropdownItem>,
      ...(isPending
        ? [
            <DropdownItem key="receive" onClick={() => onReceiveRequest(item)}>
              <div className="flex gap-3 items-center">
                <LuPackageCheck size={16} />
                <p>Receive PO</p>
              </div>
            </DropdownItem>,
            <DropdownItem key="sendmail" onClick={() => onSendMail(item)}>
              <div className="flex gap-3 items-center">
                <LuMail size={16} />
                <p>Send Mail to Supplier</p>
              </div>
            </DropdownItem>,
            <DropdownItem
              key="cancel"
              className="text-danger"
              color="danger"
              onClick={() => onCancelRequest(item)}
            >
              <div className="flex gap-3 items-center">
                <XCircle size={16} />
                <p>Cancel</p>
              </div>
            </DropdownItem>,
          ]
        : []),
    ];
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="relative">
          <LuSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] w-64 max-w-full"
          />
        </div>
      </div>

      <div className="relative border border-primaryGrey rounded-lg overflow-visible">
        {isActionLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#5F35D2]" />
          </div>
        )}
        {isMobile ? (
          <div className="divide-y divide-primaryGrey">
            {filteredData.length === 0 && (
              <div className="flex justify-center items-center py-16 text-sm text-textGrey">
                No purchase orders yet
              </div>
            )}
            {filteredData.map((item) => (
              <article
                key={item.purchaseOrderId || item.requestId}
                className="p-4 hover:bg-gray-50 transition-colors"
                onClick={() => onViewRequest?.(item)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-[15px] font-semibold text-black truncate">
                      {item.supplierName || item.companyName || "Supplier"}
                    </div>
                    <div className="text-textGrey text-[12px] mt-0.5">
                      {item.reference || item.requestId}
                    </div>
                  </div>
                  {renderCell(item, "status")}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-textGrey uppercase mb-1">
                      Request Date
                    </div>
                    <div className="text-[13px] text-black font-medium">
                      {item.requestDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-textGrey uppercase mb-1">
                      Expected Delivery
                    </div>
                    <div className="text-[13px] text-black font-medium">
                      {item.expectedDeliveryDate || "\u2014"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-textGrey uppercase mb-1">
                      Items
                    </div>
                    <div className="text-[13px] text-black font-medium">
                      {item.numberOfItems}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-textGrey uppercase mb-1">
                      Total Cost
                    </div>
                    <div className="text-[13px] text-black font-semibold">
                      {formatCurrency(item.totalCost)}
                    </div>
                  </div>
                </div>

                {item.status === "Pending" && (
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReceiveRequest(item);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5F35D2] text-white text-sm font-medium"
                    >
                      <LuPackageCheck size={16} />
                      Receive PO
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="max-h-[382px] overflow-auto">
            <Table
            radius="lg"
            isCompact
            removeWrapper
            aria-label="Purchase order history"
            classNames={{
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
              td: [
                "py-3",
                "text-textGrey",
                "group-data-[first=true]:first:before:rounded-none",
                "group-data-[first=true]:last:before:rounded-none",
                "group-data-[middle=true]:before:rounded-none",
                "group-data-[last=true]:first:before:rounded-none",
                "group-data-[last=true]:last:before:rounded-none",
              ],
            }}
          >
            <TableHeader columns={historyColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredData}
              emptyContent="No purchase orders yet"
            >
              {(item) => (
                <TableRow key={item.purchaseOrderId || item.requestId}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, String(columnKey))}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        )}
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
