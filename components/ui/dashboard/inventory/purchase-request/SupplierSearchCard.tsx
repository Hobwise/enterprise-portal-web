"use client";

import React from "react";
import { Select, SelectItem } from "@nextui-org/react";
import { Supplier } from "@/components/ui/dashboard/inventory/suppliers/types";

interface SupplierSearchCardProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  isLoading: boolean;
}

const SupplierSearchCard: React.FC<SupplierSearchCardProps> = ({
  suppliers,
  selectedSupplierId,
  onSupplierSelect,
  isLoading,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Supplier
      </label>
      <Select
        placeholder="Select a supplier"
        selectedKeys={selectedSupplierId ? [selectedSupplierId] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          onSupplierSelect(selected || "");
        }}
        isLoading={isLoading}
        classNames={{
          trigger: "border border-gray-200 rounded-xl bg-gray-50 hover:bg-white h-[48px]",
          value: "text-gray-700",
        }}
        variant="bordered"
        aria-label="Select supplier"
      >
        {suppliers.map((supplier) => (
          <SelectItem key={supplier.supplierId} textValue={supplier.companyName}>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{supplier.companyName}</span>
              <span className="text-xs text-gray-400">{supplier.name}</span>
            </div>
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default SupplierSearchCard;
