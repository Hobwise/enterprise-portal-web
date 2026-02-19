"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
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

  const renderCell = (item: PurchaseRequest, columnKey: string) => {
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
      case "actions": {
        const isPending = item.status === "Pending";
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button className="border-gray-300 border" isIconOnly size="sm" variant="light">
                  <HiOutlineDotsVertical className="text-gray-700" />
                </Button>
              </DropdownTrigger>
              {isPending ? (
                <DropdownMenu aria-label="Actions">
                  <DropdownItem key="receive" className="text-gray-900" startContent={<LuPackageCheck size={16} />} onPress={() => onReceiveRequest(item)}>
                    Receive PO
                  </DropdownItem>
                  <DropdownItem key="duplicate" className="text-gray-900" startContent={<LuCopy size={16} />} onPress={() => onDuplicateRequest(item)}>
                    Duplicate PO
                  </DropdownItem>
                  <DropdownItem key="cancel" className="text-danger" startContent={<LuXCircle size={16} />} onPress={() => onCancelRequest(item)}>
                    Cancel
                  </DropdownItem>
                  <DropdownItem key="sendmail" className="text-gray-900" startContent={<LuMail size={16} />} onPress={() => onSendMail(item)}>
                    Send Mail to Supplier
                  </DropdownItem>
                </DropdownMenu>
              ) : (
                <DropdownMenu aria-label="Actions">
                  <DropdownItem key="duplicate" className="text-gray-900" startContent={<LuCopy size={16} />} onPress={() => onDuplicateRequest(item)}>
                    Duplicate PO
                  </DropdownItem>
                </DropdownMenu>
              )}
            </Dropdown>
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
          <TableHeader>
            {historyColumns.map((col) => (
              <TableColumn key={col.uid} align={col.uid === "actions" ? "center" : "start"}>
                {col.name}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody items={filteredData} emptyContent="No purchase orders yet">
            {(item) => (
              <TableRow key={item.requestId} className="cursor-pointer hover:bg-gray-50">
                {historyColumns.map((col) => (
                  <TableCell key={col.uid}>{renderCell(item, col.uid)}</TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PurchaseRequestHistoryTable;
