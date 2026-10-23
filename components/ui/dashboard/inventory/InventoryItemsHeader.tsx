'use client';

import React from 'react';
import { Search, Plus, X } from 'lucide-react';

interface InventoryItemsHeaderProps {
  totalItems: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  itemTypeFilter: string;
  onItemTypeFilterChange: (value: string) => void;
  stockLevelFilter: string;
  onStockLevelFilterChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
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
  hasActiveFilters,
  onClearFilters,
  onAddItem,
}) => {
  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Row 1: Items Count and Add button share a row on every breakpoint */}
      <div className="flex items-center justify-between gap-3">
        {/* Items Count */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-[#5F35D2]/10 rounded-full flex items-center justify-center">
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
          <span className="text-sm font-medium text-gray-700 truncate">
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {/* Add Item — icon only on mobile to keep the count visible */}
        <button
          onClick={onAddItem}
          aria-label="Add new item"
          className="shrink-0 flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-medium transition-all duration-200 active:scale-[0.97]"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New Item</span>
        </button>
      </div>

      {/* Row 2: Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or item ID"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200"
          />
        </div>

        {/* Filters share a row on mobile so they don't push the list off-screen */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          {/* Item Type Filter */}
          <select
            aria-label="Filter by item type"
            value={itemTypeFilter}
            onChange={(e) => onItemTypeFilterChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm sm:text-base text-gray-700 bg-white transition-colors duration-200 appearance-none sm:min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="0">Direct</option>
            <option value="1">Ingredient</option>
            <option value="2">Produced</option>
          </select>

          {/* Stock Level Filter */}
          <select
            aria-label="Filter by stock level"
            value={stockLevelFilter}
            onChange={(e) => onStockLevelFilterChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm sm:text-base text-gray-700 bg-white transition-colors duration-200 appearance-none sm:min-w-[150px]"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1 px-3 py-2.5 sm:py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default InventoryItemsHeader;
