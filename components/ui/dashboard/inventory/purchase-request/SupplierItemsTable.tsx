"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
} from "@nextui-org/react";
import { CustomButton } from "@/components/customButton";
import { FaArrowRight } from "react-icons/fa6";
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
  const rowsPerPage = 10;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [items, page]);

  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map((i) => i.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const formatCurrency = (value: number) => {
    return `\u20A6${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const renderCell = (item: SupplierInventoryItem, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              isSelected={selectedItems.has(item.id)}
              onValueChange={() => handleSelectItem(item.id)}
              size="sm"
              color="secondary"
            />
            <span className="text-sm text-gray-500">{item.id.slice(0, 8)}</span>
          </div>
        );
      case "name":
        return <span className="text-sm font-semibold text-gray-900">{item.name}</span>;
      case "unitName":
        return <span className="text-sm text-gray-500">{item.unitName}</span>;
      case "costPerUnit":
        return <span className="text-sm text-gray-500">{formatCurrency(item.costPerUnit)}</span>;
      case "optimumStock":
        return <span className="text-sm text-gray-500">{item.optimumStock}</span>;
      case "currentStock":
        return <span className="text-sm text-gray-500">{item.currentStock}</span>;
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
        <h3 className="text-lg font-semibold text-[#3D424A]">Supplier Items</h3>
        <span className="text-sm text-gray-400">{items.length} items</span>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table
          radius="lg"
          isCompact
          removeWrapper
          aria-label="Supplier inventory items"
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
                totalPages={Math.ceil(items.length / rowsPerPage) || 1}
                hasNext={page < Math.ceil(items.length / rowsPerPage)}
                hasPrevious={page > 1}
                totalCount={items.length}
                pageSize={rowsPerPage}
                onPageChange={setPage}
                onNext={() =>
                  setPage((p) =>
                    p < Math.ceil(items.length / rowsPerPage) ? p + 1 : p
                  )
                }
                onPrevious={() => setPage((p) => (p > 1 ? p - 1 : p))}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn>
              <Checkbox
                isSelected={allSelected}
                isIndeterminate={someSelected}
                onValueChange={handleSelectAll}
                size="sm"
                color="secondary"
              />
            </TableColumn>
            {supplierItemColumns.map((col) => (
              <TableColumn key={col.uid}>{col.name}</TableColumn>
            ))}
          </TableHeader>
          <TableBody items={paginatedItems} emptyContent="No items found for this supplier">
            {(item) => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    isSelected={selectedItems.has(item.id)}
                    onValueChange={() => handleSelectItem(item.id)}
                    size="sm"
                    color="secondary"
                  />
                </TableCell>
                {supplierItemColumns.map((col) => (
                  <TableCell key={col.uid}>{renderCell(item, col.uid)}</TableCell>
                ))}
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
