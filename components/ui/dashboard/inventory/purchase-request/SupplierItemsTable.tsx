"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Selection,
} from "@nextui-org/react";
import { CustomButton } from "@/components/customButton";
import { FaArrowRight } from "react-icons/fa6";
import { IoSearchOutline, IoCloseCircle } from "react-icons/io5";
import { SupplierInventoryItem } from "./types";
import { supplierItemColumns } from "./data";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";
import useMobile from "@/hooks/useMobile";
import { Checkbox } from "@nextui-org/react";

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
  const isMobile = useMobile();

  const filteredItems = useMemo(() => {
    if (!filterValue.trim()) return items;
    const query = filterValue.toLowerCase();
    return items.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(query) ||
        (item.itemType || '').toLowerCase().includes(query) ||
        (item.status || '').toLowerCase().includes(query)
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
      case "name":
        return (
          <span className="text-sm font-semibold text-gray-900">
            {item.name}
          </span>
        );
      case "itemType":
        return <span className="text-sm text-gray-500">{item.itemType}</span>;
      case "costPerUnit":
        return (
          <span className="text-sm text-gray-500">
            {formatCurrency(item.costPerUnit)}
          </span>
        );
      case "status":
        return (
          <span
            className={`text-sm font-medium ${
              item.status === "Active" ? "text-green-500" : "text-red-500"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
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
        <div className="flex md:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
            />
            {filterValue && (
              <button
                onClick={() => handleFilterChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <IoCloseCircle size={16} />
              </button>
            )}
          </div>
          <span className="text-sm text-gray-400">
            {filteredItems.length} items
          </span>
        </div>
      </div>

      <div className="border border-primaryGrey rounded-lg overflow-hidden">
        {isMobile ? (
          <div className="divide-y divide-primaryGrey">
            {paginatedItems.length === 0 && (
              <div className="flex justify-center items-center py-16 text-sm text-textGrey">
                No items found for this supplier
              </div>
            )}
            {paginatedItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    isSelected={isSelected}
                    onValueChange={(checked) => {
                      const next = new Set(selectedItems);
                      if (checked) {
                        next.add(item.id);
                      } else {
                        next.delete(item.id);
                      }
                      onSelectionChange(next);
                    }}
                    color="secondary"
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {item.name}
                      </span>
                      <span
                        className={`text-xs font-medium shrink-0 ${
                          item.status === "Active"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <div className="text-[11px] text-textGrey uppercase">
                          Item Type
                        </div>
                        <div className="text-[13px] text-gray-700">
                          {item.itemType}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-textGrey uppercase">
                          Unit
                        </div>
                        <div className="text-[13px] text-gray-700">
                          {item.unitName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-textGrey uppercase">
                          Cost / Unit
                        </div>
                        <div className="text-[13px] text-gray-700 font-medium">
                          {formatCurrency(item.costPerUnit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
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
)}
      </div>

      {totalPages > 1 && (
        <div className="flex w-full justify-center mt-4">
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
      )}

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
