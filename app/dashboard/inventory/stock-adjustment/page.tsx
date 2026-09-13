"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
} from "@nextui-org/react";
import { Search, ArrowRight, X } from "lucide-react";
import { LuHistory, LuSearch } from "react-icons/lu";
import { StockAdjustmentIcon } from "@/public/assets/svg";
import { cn, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import useInventoryItems from "@/hooks/cachedEndpoints/useInventoryItems";
import useStockAdjustment from "@/hooks/cachedEndpoints/useStockAdjustment";
import {
  InventoryItem,
  StockAdjustmentReason,
  StockAdjustmentHistoryItem,
} from "@/app/api/controllers/dashboard/inventory";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

type MainTab = "adjustment" | "history";

/** Convert PascalCase/camelCase joined words to spaced words for display (e.g. "DamagedGoods" → "Damaged Goods") */
const formatReasonLabel = (name: string): string =>
  name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

interface AdjustmentItem {
  id: string;
  name: string;
  unit: string;
  oldStock: number;
  adjustmentQty: number;
  reason: string;
  reasonText: string;
  reasonValue: number;
  movement: number;
  selected: boolean;
  date: string;
}

export default function StockAdjustmentPage() {
  const [mainTab, setMainTab] = useState<MainTab>("adjustment");
  const [isMultiMode, setIsMultiMode] = useState(false);

  // Quick adjustment state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [selectedReason, setSelectedReason] =
    useState<StockAdjustmentReason | null>(null);
  const [reasonText, setReasonText] = useState("");

  // Multi-adjustment state
  const [multiSearchQuery, setMultiSearchQuery] = useState("");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentItem[]>([]);

  // Search state for quick adjustment dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessName = businessInformation?.[0]?.businessName || "Maryland";

  // Read fresh IDs for submission payloads to avoid stale closures
  const getFreshIds = () => {
    const biz = getJsonItemFromLocalStorage("business");
    const user = getJsonItemFromLocalStorage("userInformation");
    return {
      businessID: biz?.[0]?.businessId || "",
      cooperateID: user?.cooperateID || "",
    };
  };

  // Stock adjustment hook
  const {
    history,
    totalCount,
    totalPages,
    currentPage,
    hasNext,
    hasPrevious,
    isLoadingHistory,
    refetchHistory,
    reasons,
    isLoadingReasons,
    submitAdjustment,
    isSubmitting,
    page: historyPage,
    setPage: setHistoryPage,
    search: historySearch,
    setSearch: setHistorySearch,
    pageSize: historyPageSize,
  } = useStockAdjustment();

  // Fetch inventory items for search
  const { data: inventoryItems, isLoading: itemsLoading } = useInventoryItems({
    page: 1,
    pageSize: 50,
    search: debouncedSearch,
  });

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Debounce multi search for adding items
  const [debouncedMultiSearch, setDebouncedMultiSearch] = useState("");
  const [showMultiDropdown, setShowMultiDropdown] = useState(false);

  const { data: multiSearchItems } = useInventoryItems({
    page: 1,
    pageSize: 20,
    search: debouncedMultiSearch,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedMultiSearch(multiSearchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [multiSearchQuery]);

  // Debounce activity log search
  const [activitySearchInput, setActivitySearchInput] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHistorySearch(activitySearchInput);
      setHistoryPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [activitySearchInput]);

  const computedNewStock = useMemo(() => {
    if (!selectedItem || !adjustmentQty || !selectedReason) return null;
    const qty = Number(adjustmentQty);
    if (isNaN(qty) || qty <= 0) return null;
    const oldStock = selectedItem.stockLevel || 0;
    return selectedReason.movement === 1 ? oldStock - qty : oldStock + qty;
  }, [selectedItem, adjustmentQty, selectedReason]);

  const signedDelta = useMemo(() => {
    if (!adjustmentQty || !selectedReason) return 0;
    const qty = Number(adjustmentQty);
    return selectedReason.movement === 1 ? -qty : qty;
  }, [adjustmentQty, selectedReason]);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setSearchQuery(item.name);
    setShowDropdown(false);
    setAdjustmentQty("");
    setSelectedReason(null);
    setReasonText("");
  };

  const handleAddMultiItem = (item: InventoryItem) => {
    const alreadyAdded = adjustmentItems.some((ai) => ai.id === item.id);
    if (alreadyAdded) {
      notify({
        title: "Item already added",
        text: "This item is already in the adjustment list",
        type: "warning",
      });
      return;
    }

    setAdjustmentItems((prev) => [
      ...prev,
      {
        id: item.id,
        name: item.name,
        unit: item.unitCode || item.unitName || "Unit",
        oldStock: item.stockLevel || 0,
        adjustmentQty: 0,
        reason: "",
        reasonText: "",
        reasonValue: 0,
        movement: 0,
        selected: false,
        date: new Date().toLocaleDateString("en-GB"),
      },
    ]);
    setMultiSearchQuery("");
    setShowMultiDropdown(false);
  };

  const handleUpdateMultiItem = (
    id: string,
    field: keyof AdjustmentItem,
    value: any,
  ) => {
    setAdjustmentItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      }),
    );
  };

  const handleUpdateMultiItemReason = (
    id: string,
    reason: StockAdjustmentReason,
  ) => {
    setAdjustmentItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reason: reason.name,
              reasonValue: reason.value,
              movement: reason.movement,
            }
          : item,
      ),
    );
  };

  const handleRemoveSelected = () => {
    setAdjustmentItems((prev) => prev.filter((item) => !item.selected));
  };

  const handleToggleSelect = (id: string) => {
    handleUpdateMultiItem(
      id,
      "selected",
      !adjustmentItems.find((i) => i.id === id)?.selected,
    );
  };

  const selectedCount = adjustmentItems.filter((i) => i.selected).length;

  const handleAdjustStock = () => {
    if (!selectedItem) {
      notify({
        title: "No item selected",
        text: "Please select an item to adjust",
        type: "error",
      });
      return;
    }
    if (!selectedReason) {
      notify({
        title: "Select reason",
        text: "Please select a reason for adjustment",
        type: "error",
      });
      return;
    }
    if (!reasonText.trim()) {
      notify({
        title: "Enter reason",
        text: "Please enter a reason for the adjustment",
        type: "error",
      });
      return;
    }
    if (!adjustmentQty || Number(adjustmentQty) <= 0) {
      notify({
        title: "Enter quantity",
        text: "Please enter an adjustment quantity greater than 0",
        type: "error",
      });
      return;
    }

    const qty = Number(adjustmentQty);
    const oldStock = selectedItem.stockLevel || 0;

    if (selectedReason.movement === 1 && qty > oldStock) {
      notify({
        title: "Invalid quantity",
        text: `Cannot decrease by ${qty}. Current stock is only ${oldStock}.`,
        type: "error",
      });
      return;
    }

    const signedQuantity = selectedReason.movement === 1 ? -qty : qty;

    const { businessID, cooperateID } = getFreshIds();

    submitAdjustment(
      {
        adjustments: [
          {
            inventoryItemId: selectedItem.id,
            quantity: signedQuantity,
            adjustmentType: selectedReason.value,
            movementType: selectedReason.movement,
            reason: reasonText.trim(),
          },
        ],
        cooperateID,
        businessID,
      },
      {
        onSuccess: (response: any) => {
          if (response?.data?.isSuccessful) {
            setSelectedItem(null);
            setSearchQuery("");
            setAdjustmentQty("");
            setSelectedReason(null);
            setReasonText("");
          }
        },
      },
    );
  };

  const handleAdjustMultipleStocks = () => {
    if (adjustmentItems.length === 0) {
      notify({
        title: "No items",
        text: "Please add items to adjust",
        type: "error",
      });
      return;
    }

    const invalidItems = adjustmentItems.filter(
      (item) =>
        !item.reason || !item.reasonText.trim() || item.adjustmentQty <= 0,
    );
    if (invalidItems.length > 0) {
      notify({
        title: "Incomplete items",
        text: "Ensure all items have a reason, a reason description, and an adjustment quantity greater than 0",
        type: "warning",
      });
      return;
    }

    const overdrawnItems = adjustmentItems.filter(
      (item) => item.movement === 1 && item.adjustmentQty > item.oldStock,
    );
    if (overdrawnItems.length > 0) {
      notify({
        title: "Invalid quantities",
        text: `${overdrawnItems.map((i) => i.name).join(", ")} would result in negative stock`,
        type: "error",
      });
      return;
    }

    const adjustments = adjustmentItems.map((item) => ({
      inventoryItemId: item.id,
      quantity: item.movement === 1 ? -item.adjustmentQty : item.adjustmentQty,
      adjustmentType: item.reasonValue,
      movementType: item.movement,
      reason: item.reasonText.trim(),
    }));

    const { businessID, cooperateID } = getFreshIds();

    submitAdjustment(
      { adjustments, cooperateID, businessID },
      {
        onSuccess: (response: any) => {
          if (response?.data?.isSuccessful) {
            setAdjustmentItems([]);
          }
        },
      },
    );
  };

  const filteredMultiSearchItems = useMemo(() => {
    if (!multiSearchItems) return [];
    const existingIds = new Set(adjustmentItems.map((i) => i.id));
    return multiSearchItems.filter((item) => !existingIds.has(item.id));
  }, [multiSearchItems, adjustmentItems]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Top Tabs + Current Store */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-1">
          {/* Stock Adjustment Tab */}
          <button
            onClick={() => {
              setMainTab("adjustment");
              setIsMultiMode(false);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mainTab === "adjustment"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]",
            )}
          >
            <StockAdjustmentIcon className="w-4 h-4" />
            Stock Adjustment
          </button>

          {/* History Tab */}
          <button
            onClick={() => {
              setMainTab("history");
              setIsMultiMode(false);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mainTab === "history"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]",
            )}
          >
          <LuHistory size={16} /> 
            History
          </button>
        </div>


      </div>

      {/* Page Title & Subtitle */}
      <div className="px-6 pt-4 mb-2">
        <h1 className="text-2xl font-bold text-[#101828]">
          Stock Adjustment
        </h1>
        <p className="text-sm text-[#667085] mt-1">
          Manage adjustment of individual and multiple stocks here
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* Quick Adjustment View */}
        {mainTab === "adjustment" && !isMultiMode && (
          <div>
            {/* Quick Adjustment Card */}

            {/* Quick Adjustment Card */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white mb-4 max-w-[750px] mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F0ECFB] flex items-center justify-center">
                  <StockAdjustmentIcon className="w-5 h-5 text-[#5F35D2]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#101828]">
                    Quick Adjustment
                  </h3>
                  <p className="text-sm text-[#667085]">
                    Select item you wish to Adjust
                  </p>
                </div>
              </div>

              {/* Item Search */}
              <div className="relative">
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (searchQuery) setShowDropdown(true);
                  }}
                  variant="bordered"
                  endContent={<Search className="w-4 h-4 text-[#98A2B3]" />}
                  classNames={{
                    inputWrapper:
                      "bg-white border-[#E4E7EC] rounded-lg shadow-none h-[48px]",
                    input: "text-sm text-[#101828]",
                  }}
                />
                {showDropdown && searchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E4E7EC] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {itemsLoading ? (
                      <div className="p-3 text-sm text-[#667085]">
                        Searching...
                      </div>
                    ) : inventoryItems.length === 0 ? (
                      <div className="p-3 text-sm text-[#667085]">
                        No items found
                      </div>
                    ) : (
                      inventoryItems.map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] text-sm border-b border-[#F2F4F7] last:border-0"
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="font-medium text-[#101828]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#667085] mt-0.5">
                            Stock: {item.stockLevel}{" "}
                            {item.unitCode || item.unitName}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reason Row */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white mb-4 max-w-[750px] mx-auto">
              <div className="mb-4">
                <label className="text-xs text-[#667085] font-medium mb-2 block">
                  Adjustment Type
                </label>
                <Select
                  placeholder={
                    isLoadingReasons
                      ? "Loading reasons..."
                      : "Select adjustment type"
                  }
                  selectedKeys={
                    selectedReason ? [String(selectedReason.value)] : []
                  }
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    const found = reasons.find((r) => String(r.value) === val);
                    setSelectedReason(found || null);
                  }}
                  variant="bordered"
                  isDisabled={isLoadingReasons || !selectedItem}
                  classNames={{
                    trigger:
                      "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                    value: "text-sm text-[#101828]",
                    listboxWrapper: "max-h-[300px]",
                  }}
                >
                  {reasons.map((r) => (
                    <SelectItem
                      key={String(r.value)}
                      className="text-[#101828]"
                    >
                      {formatReasonLabel(r.name)}
                    </SelectItem>
                  ))}
                </Select>
                {selectedItem && !selectedReason && (
                  <p className="text-xs text-[#F79009] mt-2">
                    Select an adjustment type to determine whether this is an
                    increase or decrease
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-[#667085] font-medium mb-2 block">
                  Reason for Adjustment
                </label>
                <Input
                  placeholder="Enter reason for adjustment..."
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  variant="bordered"
                  isDisabled={!selectedItem || !selectedReason}
                  classNames={{
                    inputWrapper:
                      "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                    input: "text-sm text-[#101828]",
                  }}
                />
              </div>
            </div>

            {/* Stock Info Row */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white mb-6 max-w-[750px] mx-auto">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    Old Stock
                  </label>
                  <div className="text-base font-medium text-[#101828] py-2">
                    {selectedItem ? selectedItem.stockLevel || 0 : "\u2014"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    {selectedReason
                      ? selectedReason.movement === 1
                        ? "Decrease Quantity"
                        : "Increase Quantity"
                      : "Adjustment Quantity"}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    variant="bordered"
                    classNames={{
                      inputWrapper:
                        "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                      input: "text-sm text-[#101828]",
                    }}
                    isDisabled={!selectedItem || !selectedReason}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    New Stock
                  </label>
                  <div
                    className={cn(
                      "text-base font-medium py-2",
                      computedNewStock !== null && signedDelta > 0
                        ? "text-[#16AB60]"
                        : computedNewStock !== null && signedDelta < 0
                          ? "text-red-500"
                          : "text-[#101828]",
                    )}
                  >
                    {computedNewStock !== null ? computedNewStock : "\u2014"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 max-w-[750px] mx-auto">
              <Button
                variant="bordered"
                className="flex-1 h-12 rounded-xl border-[#5F35D2] text-[#5F35D2] font-semibold text-sm"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={() => setIsMultiMode(true)}
              >
                Adjust Multiple Items
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-[#5F35D2] text-white font-semibold text-sm"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={handleAdjustStock}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                Adjust Stock
              </Button>
            </div>
          </div>
        )}

        {/* Multi-Item Adjustment View */}
        {mainTab === "adjustment" && isMultiMode && (
          <div>
            {/* Search Bar - full width */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search and add items"
                  value={multiSearchQuery}
                  onChange={(e) => {
                    setMultiSearchQuery(e.target.value);
                    setShowMultiDropdown(true);
                  }}
                  onFocus={() => {
                    if (multiSearchQuery) setShowMultiDropdown(true);
                  }}
                  variant="bordered"
                  endContent={
                    <Search className="w-5 h-5 text-[#98A2B3] cursor-pointer" />
                  }
                  classNames={{
                    inputWrapper:
                      "bg-white border-[#E4E7EC] h-[48px] rounded-lg px-4 shadow-none",
                    input: "text-sm text-[#101828]",
                  }}
                />
                {showMultiDropdown && multiSearchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredMultiSearchItems.length === 0 ? (
                      <div className="p-3 text-sm text-[#667085]">
                        No items found
                      </div>
                    ) : (
                      filteredMultiSearchItems.map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] text-sm border-b border-[#F2F4F7] last:border-0"
                          onClick={() => handleAddMultiItem(item)}
                        >
                          <div className="font-medium text-[#101828]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#667085] mt-0.5">
                            Stock: {item.stockLevel}{" "}
                            {item.unitCode || item.unitName}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Selected Items Badge */}
                <span className="text-sm font-medium text-[#5F35D2]">
                  Selected Items
                </span>
                <span className="w-6 h-6 rounded-full bg-[#5F35D2] text-white text-xs flex items-center justify-center font-semibold">
                  {adjustmentItems.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Stock Level Filter */}
                <select
                  value={stockLevelFilter}
                  onChange={(e) => setStockLevelFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                >
                  <option value="all">Current Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="medium">Medium Stock</option>
                  <option value="high">High Stock</option>
                </select>

                {/* Item Type Filter */}
                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white"
                >
                  <option value="all">Item Type</option>
                  <option value="0">Direct</option>
                  <option value="1">Ingredient</option>
                  <option value="2">Produced</option>
                </select>
              </div>
            </div>

            <div className="relative border border-primaryGrey rounded-lg overflow-visible">
              {adjustmentItems.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20">
                  <h3 className="text-2xl font-bold text-[#101828] mb-2">
                    Add Items
                  </h3>
                  <p className="text-sm text-[#667085] text-center max-w-[280px] leading-relaxed">
                    Search and add multiple items to make adjustment at the same
                    time
                  </p>
                </div>
              ) : (
                /* Items Table */
                <div className="max-h-[382px] overflow-auto">
                  <Table
                    radius="lg"
                    isCompact
                    removeWrapper
                    aria-label="Stock adjustment items"
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
                    <TableHeader>
                      <TableColumn> </TableColumn>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>ITEM NAME</TableColumn>
                      <TableColumn>UNITS</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>REASON</TableColumn>
                      <TableColumn>OLD STOCK</TableColumn>
                      <TableColumn>ADJ. QTY</TableColumn>
                      <TableColumn>NEW STOCK</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {adjustmentItems.map((item) => {
                        const signedQty = item.reason
                          ? item.movement === 1
                            ? -item.adjustmentQty
                            : item.adjustmentQty
                          : 0;
                        const computedNew = item.oldStock + signedQty;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Checkbox
                                isSelected={item.selected}
                                onValueChange={() =>
                                  handleToggleSelect(item.id)
                                }
                                size="sm"
                              />
                            </TableCell>
                            <TableCell className="text-[#667085] whitespace-nowrap">
                              {item.date}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-[#667085]">
                              {item.unit}
                            </TableCell>
                            <TableCell>
                              <Select
                                placeholder="Select type"
                                selectedKeys={item.reason ? [item.reason] : []}
                                onSelectionChange={(keys) => {
                                  const val = Array.from(keys)[0] as string;
                                  const found = reasons.find(
                                    (r) => r.name === val,
                                  );
                                  if (found)
                                    handleUpdateMultiItemReason(item.id, found);
                                }}
                                variant="bordered"
                                classNames={{
                                  trigger:
                                    "bg-white border-[#E4E7EC] rounded-lg shadow-none h-8 w-[160px] min-w-[160px]",
                                  value: "text-xs text-[#101828]",
                                  listboxWrapper: "max-h-[200px]",
                                }}
                                size="sm"
                              >
                                {reasons.map((r) => (
                                  <SelectItem
                                    key={r.name}
                                    className="text-[#101828]"
                                  >
                                    {formatReasonLabel(r.name)}
                                  </SelectItem>
                                ))}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Enter reason"
                                value={item.reasonText}
                                onChange={(e) =>
                                  handleUpdateMultiItem(
                                    item.id,
                                    "reasonText",
                                    e.target.value,
                                  )
                                }
                                variant="bordered"
                                isDisabled={!item.reason}
                                classNames={{
                                  inputWrapper:
                                    "bg-white border-[#E4E7EC] rounded-lg shadow-none h-8 w-[180px] min-w-[180px]",
                                  input: "text-xs text-[#101828]",
                                }}
                                size="sm"
                              />
                            </TableCell>
                            <TableCell>{item.oldStock}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={String(item.adjustmentQty || "")}
                                onChange={(e) =>
                                  handleUpdateMultiItem(
                                    item.id,
                                    "adjustmentQty",
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                variant="bordered"
                                isDisabled={!item.reason}
                                classNames={{
                                  inputWrapper:
                                    "bg-white border-[#E4E7EC] rounded-lg shadow-none h-8 w-20",
                                  input: "text-sm text-center text-[#101828]",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "font-medium",
                                  signedQty > 0
                                    ? "text-[#16AB60]"
                                    : signedQty < 0
                                      ? "text-red-500"
                                      : "text-[#667085]",
                                )}
                              >
                                {item.reason && item.adjustmentQty > 0
                                  ? computedNew
                                  : "\u2014"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {adjustmentItems.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="bordered"
                  className="h-12 rounded-xl border-[#E4E7EC] text-[#667085] font-semibold text-sm px-8"
                  startContent={<X className="w-4 h-4" />}
                  onPress={handleRemoveSelected}
                  isDisabled={selectedCount === 0}
                >
                  Remove
                </Button>
                <Button
                  className="h-12 rounded-xl bg-[#5F35D2] text-white font-semibold text-sm px-8"
                  endContent={<ArrowRight className="w-4 h-4" />}
                  onPress={handleAdjustMultipleStocks}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  Adjust Stocks
                </Button>
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {mainTab === "history" && (
          <div>
            <div className="flex items-center justify-end mb-4">
          
              <div className="relative">
                <LuSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search adjustments..."
                  value={activitySearchInput}
                  onChange={(e) => setActivitySearchInput(e.target.value)}
                  className="border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] w-64"
                />
              </div>
            </div>

            <div className="relative border border-primaryGrey rounded-lg overflow-visible">
              {isLoadingHistory && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#5F35D2]" />
                </div>
              )}
              <div className="max-h-[382px] overflow-auto">
                <Table
                  radius="lg"
                  isCompact
                  removeWrapper
                  aria-label="Stock adjustment activity log"
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
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>TIME</TableColumn>
                    <TableColumn>ITEM NAME</TableColumn>
                    <TableColumn>UNIT</TableColumn>
                    <TableColumn>OLD STOCK</TableColumn>
                    <TableColumn>NEW STOCK</TableColumn>
                    <TableColumn>DIFFERENCE</TableColumn>
                    <TableColumn>STAFF</TableColumn>
                    <TableColumn>REASON</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No adjustment history found">
                    {history.map(
                      (row: StockAdjustmentHistoryItem, idx: number) => (
                        <TableRow
                          key={`${row.date}-${row.inventoryItemName}-${idx}`}
                        >
                          <TableCell className="whitespace-nowrap">
                            {formatDate(row.date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatTime(row.date)}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {row.inventoryItemName}
                          </TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>{row.oldStock}</TableCell>
                          <TableCell>{row.newStock}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "font-medium",
                                row.difference > 0
                                  ? "text-[#16AB60]"
                                  : row.difference < 0
                                    ? "text-red-500"
                                    : "",
                              )}
                            >
                              {row.difference > 0
                                ? `+${row.difference}`
                                : row.difference}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {row.staff}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatReasonLabel(row.reason)}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex w-full justify-center">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  totalCount={totalCount}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  onNext={() =>
                    setHistoryPage(Math.min(historyPage + 1, totalPages))
                  }
                  onPrevious={() =>
                    setHistoryPage(Math.max(historyPage - 1, 1))
                  }
                  isLoading={isLoadingHistory}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
