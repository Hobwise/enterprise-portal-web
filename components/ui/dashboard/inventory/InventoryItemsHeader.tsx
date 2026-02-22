'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';

interface InventoryItemsHeaderProps {
  totalItems: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  itemTypeFilter: string;
  onItemTypeFilterChange: (value: string) => void;
  stockLevelFilter: string;
  onStockLevelFilterChange: (value: string) => void;
  onAddItem: () => void;
}

const InventoryItemsHeader: React.FC<InventoryItemsHeaderProps> = ({
  totalItems,
  searchQuery,
  onSearchChange,
  itemTypeFilter,
  onItemTypeFilterChange,
  stockLevelFilter,
  onStockLevelFilterChange,
  onAddItem,
}) => {
  return (
    <div className="space-y-6">
      {/* Row 1: Items Count, Wizard Hat, and Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Items Count Card */}
        <div className="flex items-center gap-3  px-4 py-2">
          <div className="w-8 h-8 bg-[#5F35D2]/10 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#5F35D2]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {totalItems} Items
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 px-5 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-medium transition-all duration-200"
          >
            <span>Add New Item</span>
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Row 2: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search here item by name or item ID"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200"
          />
        </div>

        {/* Item Type Filter */}
        <select
          value={itemTypeFilter}
          onChange={(e) => onItemTypeFilterChange(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 appearance-none min-w-[150px]"
        >
          <option value="all">All Types</option>
          <option value="0">Direct</option>
          <option value="1">Ingredient</option>
          <option value="2">Produced</option>
        </select>

        {/* Stock Level Filter */}
        <select
          value={stockLevelFilter}
          onChange={(e) => onStockLevelFilterChange(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 appearance-none min-w-[150px]"
        >
          <option value="all">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>
    </div>
  );
};

export default InventoryItemsHeader;
