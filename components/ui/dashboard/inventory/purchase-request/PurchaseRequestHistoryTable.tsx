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
} from "@nextui-org/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { PurchaseRequest, PurchaseRequestStatus } from "./types";
import { historyColumns } from "./data";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

interface PurchaseRequestHistoryTableProps {
  data: PurchaseRequest[];
  onViewRequest: (request: PurchaseRequest) => void;
  onDeleteRequest: (request: PurchaseRequest) => void;
  onReceiveRequest?: (request: PurchaseRequest) => void;
}

const statusColorMap: Record<PurchaseRequestStatus, { bg: string; text: string }> = {
  Saved: { bg: "bg-gray-100", text: "text-gray-600" },
  Sent: { bg: "bg-purple-100", text: "text-purple-600" },
  Received: { bg: "bg-orange-100", text: "text-orange-600" },
  Stocked: { bg: "bg-green-100", text: "text-green-600" },
};

const PurchaseRequestHistoryTable: React.FC<PurchaseRequestHistoryTableProps> = ({
  data,
  onViewRequest,
  onDeleteRequest,
  onReceiveRequest,
}) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const renderCell = (item: PurchaseRequest, columnKey: string) => {
    switch (columnKey) {
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
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button className="border-gray-200 border" isIconOnly size="sm" variant="light">
                  <HiOutlineDotsVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem className="text-gray-900" onClick={() => onViewRequest(item)}>
                  View Details
                </DropdownItem>
                {item.status === "Sent" && onReceiveRequest ? (
                  <DropdownItem className="text-gray-900" onClick={() => onReceiveRequest(item)}>
                    Mark as Received
                  </DropdownItem>
                ) : null}
                <DropdownItem className="text-danger" onClick={() => onDeleteRequest(item)}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#3D424A]">Purchase Request History</h3>
        <span className="text-sm text-gray-400">{data.length} requests</span>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table
          radius="lg"
          isCompact
          removeWrapper
          aria-label="Purchase request history"
          classNames={{
            wrapper: ["max-h-[400px]"],
            th: [
              "text-default-500",
              "text-xs",
              "border-b",
              "border-divider",
              "py-4",
              "rounded-none",
              "bg-gray-100",
            ],
            tr: "border-b border-divider last:border-none rounded-none",
            td: ["py-3", "text-gray-500"],
          }}
          bottomContent={
            <div className="flex w-full justify-center">
              <CustomPagination
                currentPage={page}
                totalPages={Math.ceil(data.length / rowsPerPage) || 1}
                hasNext={page < Math.ceil(data.length / rowsPerPage)}
                hasPrevious={page > 1}
                totalCount={data.length}
                pageSize={rowsPerPage}
                onPageChange={setPage}
                onNext={() =>
                  setPage((p) => (p < Math.ceil(data.length / rowsPerPage) ? p + 1 : p))
                }
                onPrevious={() => setPage((p) => (p > 1 ? p - 1 : p))}
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
          <TableBody items={paginatedData} emptyContent="No purchase requests yet">
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
