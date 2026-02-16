"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  Selection,
} from "@nextui-org/react";
import { CustomButton } from "@/components/customButton";
import { FaArrowRight } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { SupplierInventoryItem } from "./types";
import { supplierItemColumns } from "./data";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

interface SupplierItemsTableProps {
  items: SupplierInventoryItem[];
  selectedItems: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  onCustomize: () => void;
}

const SupplierItemsTable: React.FC<SupplierItemsTableProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  onCustomize,
}) => {
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const rowsPerPage = 10;

  const filteredItems = useMemo(() => {
    if (!filterValue.trim()) return items;
    const query = filterValue.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.unitName.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
  }, [items, filterValue]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") {
      onSelectionChange(new Set(filteredItems.map((i) => i.id)));
    } else {
      onSelectionChange(new Set(keys as Set<string>));
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    setPage(1);
  };

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const renderCell = (item: SupplierInventoryItem, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return (
          <span className="text-sm text-gray-500">{item.id.slice(0, 8)}</span>
        );
      case "name":
        return (
          <span className="text-sm font-semibold text-gray-900">
            {item.name}
          </span>
        );
      case "unitName":
        return <span className="text-sm text-gray-500">{item.unitName}</span>;
      case "costPerUnit":
        return (
          <span className="text-sm text-gray-500">
            {formatCurrency(item.costPerUnit)}
          </span>
        );
      case "optimumStock":
        return (
          <span className="text-sm text-gray-500">{item.optimumStock}</span>
        );
      case "currentStock":
        return (
          <span className="text-sm text-gray-500">{item.currentStock}</span>
        );
      case "status":
        return (
          <span
            className={`text-sm font-medium ${
              item.status === "Low" ? "text-red-500" : "text-green-500"
            }`}
          >
            {item.status}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#3D424A]">
            Supplier Items
          </h3>
          {selectedItems.size > 0 && (
            <Chip size="sm" color="secondary" variant="flat">
              {selectedItems.size} selected
            </Chip>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Input
            isClearable
            className="w-64"
            placeholder="Search items..."
            startContent={<IoSearchOutline className="text-default-400" />}
            size="sm"
            value={filterValue}
            onValueChange={handleFilterChange}
            onClear={() => handleFilterChange("")}
          />
          <span className="text-sm text-gray-400">
            {filteredItems.length} items
          </span>
        </div>
      </div>

      <div className="border border-primaryGrey rounded-lg overflow-hidden">
        <Table
          radius="lg"
          isCompact
          removeWrapper
          aria-label="Supplier inventory items"
          selectionMode="multiple"
          selectedKeys={selectedItems}
          onSelectionChange={handleSelectionChange}
          color="secondary"
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
                currentPage={page}
                totalPages={totalPages}
                hasNext={page < totalPages}
                hasPrevious={page > 1}
                totalCount={filteredItems.length}
                pageSize={rowsPerPage}
                onPageChange={setPage}
                onNext={() =>
                  setPage((p) => (p < totalPages ? p + 1 : p))
                }
                onPrevious={() => setPage((p) => (p > 1 ? p - 1 : p))}
              />
            </div>
          }
        >
          <TableHeader columns={supplierItemColumns}>
            {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
          </TableHeader>
          <TableBody
            items={paginatedItems}
            emptyContent="No items found for this supplier"
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {renderCell(item, columnKey as string)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mt-4">
        <CustomButton
          onClick={onCustomize}
          className="text-white h-[48px] px-8"
          backgroundColor="bg-primaryColor"
          disabled={selectedItems.size === 0}
        >
          <div className="flex items-center gap-2">
            <span>Customize</span>
            <FaArrowRight />
          </div>
        </CustomButton>
      </div>
    </div>
  );
};

export default SupplierItemsTable;
