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
  onCustomizeMeasurements?: () => void;
  syncItemsCount?: number;
  onSyncItems?: () => void;
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
  onCustomizeMeasurements,
  syncItemsCount = 0,
  onSyncItems,
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

        {/* Action Buttons with Wizard Hat */}
        <div className="flex items-center gap-3">
          {/* Wizard Hat Decoration */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/witch-hat.png"
            alt="Decoration"
            width={48}
            height={48}
            className="object-contain hidden lg:block"
          />

          {onCustomizeMeasurements && (
            <button
              onClick={onCustomizeMeasurements}
              className="flex items-center gap-2 px-5 py-3 border border-[#5F35D2] text-[#5F35D2] rounded-xl hover:bg-[#5F35D2]/5 font-medium transition-all duration-200"
            >
              <span>Customize Measurements</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 px-5 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-medium transition-all duration-200"
          >
            <span>Add New Item</span>
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Row 2: Sync Items, Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Sync Items Link */}
        {onSyncItems && syncItemsCount > 0 && (
          <button
            onClick={onSyncItems}
            className="flex items-center gap-2 text-[#5F35D2] font-medium hover:underline"
          >
            <span>Sync Items</span>
            <span className="bg-[#5F35D2] text-white text-xs rounded-full px-2 py-0.5 min-w-[24px]">
              {syncItemsCount}
            </span>
          </button>
        )}

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
