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
import { StockAdjustmentIcon } from "@/public/assets/svg";
import { cn, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import useInventoryItems from "@/hooks/cachedEndpoints/useInventoryItems";
import { InventoryItem } from "@/app/api/controllers/dashboard/inventory";

type MainTab = "adjustment" | "activity-log";

const ADJUSTMENT_REASONS = [
  "Physical stock count correction",
  "Wastage/spoilage",
  "Theft/Loss",
  "Supplier discrepancy",
  "Kitchen prep adjustment",
  "Data correction",
];

const STAFF_OPTIONS = ["Jane Doe", "John Smith", "Esther O.", "David K."];

// Mock data for activity log
const mockActivityLog = [
  {
    id: "1",
    date: "1/02/2026",
    time: "10:26 am",
    transferId: "45412PR",
    itemName: "Stallion long grain rice",
    supplierName: "Sandra Okoro",
    units: "Kilo",
    oldStock: 7,
    newStock: 7,
    difference: 5,
    reason: "Physical stock count correction",
  },
  {
    id: "2",
    date: "1/02/2026",
    time: "10:26 am",
    transferId: "45412PR",
    itemName: "Golden Penny Spaghetti",
    supplierName: "Seun Obafemi",
    units: "Kilo",
    oldStock: 5,
    newStock: 5,
    difference: 10,
    reason: "Wastage/spoilage",
  },
  {
    id: "3",
    date: "1/02/2026",
    time: "10:26 am",
    transferId: "45412PR",
    itemName: "Golden Penny Twist Pasta",
    supplierName: "Rachel Laurence",
    units: "Kilo",
    oldStock: 12,
    newStock: 12,
    difference: 20,
    reason: "Theft/Loss",
  },
  {
    id: "4",
    date: "1/02/2026",
    time: "10:26 am",
    transferId: "45412PR",
    itemName: "Gino Tin Tomato Paste",
    supplierName: "Bunmi Susan",
    units: "Kilo",
    oldStock: 9,
    newStock: 9,
    difference: 8,
    reason: "Supplier discrepancy",
  },
  {
    id: "5",
    date: "1/02/2026",
    time: "10:26 am",
    transferId: "45412PR",
    itemName: "Stallion Basmati Rice",
    supplierName: "Mark Osu",
    units: "Kilo",
    oldStock: 5,
    newStock: 5,
    difference: 12,
    reason: "Kitchen prep adjustment",
  },
  {
    id: "6",
    date: "1/02/2026",
    time: "10:26 am",
    transferId: "45412PR",
    itemName: "Kings Vegetable Oil",
    supplierName: "Ope Falana",
    units: "Ltr",
    oldStock: 7,
    newStock: 7,
    difference: 9,
    reason: "Data correction",
  },
];

interface AdjustmentItem {
  id: string;
  name: string;
  unit: string;
  oldStock: number;
  newStock: number;
  staff: string;
  reason: string;
  selected: boolean;
  date: string;
  transferId: string;
}

export default function StockAdjustmentPage() {
  const [mainTab, setMainTab] = useState<MainTab>("adjustment");
  const [isMultiMode, setIsMultiMode] = useState(false);

  // Quick adjustment state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState("");
  const [staff, setStaff] = useState("");
  const [reason, setReason] = useState("");

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

  const stockDifference = useMemo(() => {
    if (!selectedItem || !newStock) return 0;
    return Number(newStock) - (selectedItem.stockLevel || 0);
  }, [selectedItem, newStock]);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setSearchQuery(item.name);
    setShowDropdown(false);
    setNewStock("");
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
        newStock: 0,
        staff: "Jane Doe",
        reason: ADJUSTMENT_REASONS[0],
        selected: false,
        date: new Date().toLocaleDateString("en-GB"),
        transferId: "45412PR",
      },
    ]);
    setMultiSearchQuery("");
    setShowMultiDropdown(false);
  };

  const handleUpdateMultiItem = (
    id: string,
    field: keyof AdjustmentItem,
    value: any
  ) => {
    setAdjustmentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveSelected = () => {
    setAdjustmentItems((prev) => prev.filter((item) => !item.selected));
  };

  const handleToggleSelect = (id: string) => {
    handleUpdateMultiItem(
      id,
      "selected",
      !adjustmentItems.find((i) => i.id === id)?.selected
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
    if (!newStock) {
      notify({
        title: "Enter new stock",
        text: "Please enter the new stock quantity",
        type: "error",
      });
      return;
    }
    if (!staff) {
      notify({
        title: "Select staff",
        text: "Please select a staff member",
        type: "error",
      });
      return;
    }
    if (!reason) {
      notify({
        title: "Select reason",
        text: "Please select a reason for adjustment",
        type: "error",
      });
      return;
    }

    notify({
      title: "Stock Adjusted",
      text: `${selectedItem.name} stock adjusted from ${selectedItem.stockLevel} to ${newStock}`,
      type: "success",
    });

    setSelectedItem(null);
    setSearchQuery("");
    setNewStock("");
    setStaff("");
    setReason("");
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

    notify({
      title: "Stocks Adjusted",
      text: `${adjustmentItems.length} item(s) have been adjusted`,
      type: "success",
    });
  };

  const filteredMultiSearchItems = useMemo(() => {
    if (!multiSearchItems) return [];
    const existingIds = new Set(adjustmentItems.map((i) => i.id));
    return multiSearchItems.filter((item) => !existingIds.has(item.id));
  }, [multiSearchItems, adjustmentItems]);

  return (
    <div className="w-full min-h-screen bg-[#F8F9FB]">
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
                : "text-[#667085] hover:text-[#101828]"
            )}
          >
            <StockAdjustmentIcon className="w-4 h-4" />
            Stock Adjustment
          </button>

          {/* Activity Log Tab */}
          <button
            onClick={() => {
              setMainTab("activity-log");
              setIsMultiMode(false);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mainTab === "activity-log"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]"
            )}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33 10l3.34-3.33L10 10l3.33-3.33L16.67 10"
                stroke="currentColor"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Activity Log
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#667085]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 8.667a2 2 0 100-4 2 2 0 000 4z"
              stroke="#667085"
              strokeWidth="1.33"
            />
            <path
              d="M8 14s5.333-3.333 5.333-7.333a5.333 5.333 0 00-10.666 0C2.667 10.667 8 14 8 14z"
              stroke="#667085"
              strokeWidth="1.33"
            />
          </svg>
          Current Store:{" "}
          <span className="font-semibold text-[#101828]">{businessName}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* Quick Adjustment View */}
        {mainTab === "adjustment" && !isMultiMode && (
          <div>
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#101828]">
                Stock Adjustment
              </h1>
              <p className="text-sm text-[#667085] mt-1">
                Manage adjustment of individual and multiple stocks here
              </p>
            </div>

            {/* Quick Adjustment Card */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 mb-4 max-w-[750px] mx-auto">
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
                  endContent={<Search className="w-4 h-4 text-[#98A2B3]" />}
                  classNames={{
                    inputWrapper:
                      "bg-white border border-[#E4E7EC] rounded-lg shadow-none",
                    input: "text-sm",
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

            {/* Stock Info Row */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 mb-4 max-w-[750px] mx-auto">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    Old Stock
                  </label>
                  <div className="text-base font-medium text-[#101828] py-2">
                    {selectedItem ? selectedItem.stockLevel || 0 : "—"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    New Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    classNames={{
                      inputWrapper:
                        "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-10",
                      input: "text-sm",
                    }}
                    isDisabled={!selectedItem}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    Stock Difference
                  </label>
                  <div
                    className={cn(
                      "text-base font-medium py-2",
                      stockDifference > 0
                        ? "text-[#16AB60]"
                        : stockDifference < 0
                        ? "text-red-500"
                        : "text-[#101828]"
                    )}
                  >
                    {selectedItem && newStock
                      ? `${stockDifference > 0 ? "+" : ""}${stockDifference}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Staff & Reason Row */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 mb-6 max-w-[750px] mx-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    Staff
                  </label>
                  <Select
                    placeholder="Select staff"
                    selectedKeys={staff ? [staff] : []}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0] as string;
                      setStaff(val || "");
                    }}
                    classNames={{
                      trigger:
                        "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-10",
                      value: "text-sm",
                    }}
                  >
                    {STAFF_OPTIONS.map((s) => (
                      <SelectItem key={s}>{s}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-[#667085] font-medium mb-2 block">
                    Reason for Adjustment
                  </label>
                  <Select
                    placeholder="Select reason"
                    selectedKeys={reason ? [reason] : []}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0] as string;
                      setReason(val || "");
                    }}
                    classNames={{
                      trigger:
                        "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-10",
                      value: "text-sm",
                    }}
                  >
                    {ADJUSTMENT_REASONS.map((r) => (
                      <SelectItem key={r}>{r}</SelectItem>
                    ))}
                  </Select>
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
              >
                Adjust Stock
              </Button>
            </div>
          </div>
        )}

        {/* Multi-Item Adjustment View */}
        {mainTab === "adjustment" && isMultiMode && (
          <div>
            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-4">
              {/* Selected Items Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-[#5F35D2]">
                  Selected Items
                </span>
                <span className="w-6 h-6 rounded-full bg-[#5F35D2] text-white text-xs flex items-center justify-center font-semibold">
                  {adjustmentItems.length}
                </span>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Input
                  placeholder="Search items here"
                  value={multiSearchQuery}
                  onChange={(e) => {
                    setMultiSearchQuery(e.target.value);
                    setShowMultiDropdown(true);
                  }}
                  onFocus={() => {
                    if (multiSearchQuery) setShowMultiDropdown(true);
                  }}
                  startContent={<Search className="w-4 h-4 text-[#98A2B3]" />}
                  classNames={{
                    inputWrapper:
                      "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-10",
                    input: "text-sm placeholder:text-[#D0D5DD]",
                  }}
                />
                {showMultiDropdown && multiSearchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E4E7EC] rounded-lg shadow-lg max-h-60 overflow-y-auto">
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

              {/* Stock Level Filter */}
              <Select
                placeholder="Stock Level"
                selectedKeys={
                  stockLevelFilter !== "all" ? [stockLevelFilter] : []
                }
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setStockLevelFilter(val || "all");
                }}
                classNames={{
                  trigger:
                    "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-10 w-[150px]",
                  value: "text-sm text-[#98A2B3]",
                }}
              >
                <SelectItem key="all">All Levels</SelectItem>
                <SelectItem key="low">Low Stock</SelectItem>
                <SelectItem key="medium">Medium Stock</SelectItem>
                <SelectItem key="high">High Stock</SelectItem>
              </Select>

              {/* Item Type Filter */}
              <Select
                placeholder="Item Type"
                selectedKeys={
                  itemTypeFilter !== "all" ? [itemTypeFilter] : []
                }
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setItemTypeFilter(val || "all");
                }}
                classNames={{
                  trigger:
                    "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-10 w-[150px]",
                  value: "text-sm text-[#98A2B3]",
                }}
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="0">Direct</SelectItem>
                <SelectItem key="1">Ingredient</SelectItem>
                <SelectItem key="2">Produced</SelectItem>
              </Select>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6">
              <h2 className="text-xl font-bold text-[#101828] mb-1">
                Stock Adjustment History
              </h2>
              <div className="border-b border-[#E4E7EC] mb-4" />

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
                <div className="overflow-x-auto">
                  <Table
                    aria-label="Stock adjustment items"
                    removeWrapper
                    classNames={{
                      th: "bg-transparent text-[#667085] text-xs font-medium border-b border-[#E4E7EC] py-3",
                      td: "py-4 text-sm text-[#101828]",
                      tr: "border-b border-[#F2F4F7] last:border-0",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>{" "}</TableColumn>
                      <TableColumn>Date</TableColumn>
                      <TableColumn>Transfer ID</TableColumn>
                      <TableColumn>Item Name</TableColumn>
                      <TableColumn>Units</TableColumn>
                      <TableColumn>Old Stock</TableColumn>
                      <TableColumn>New Stock</TableColumn>
                      <TableColumn>Difference</TableColumn>
                      <TableColumn>Staff</TableColumn>
                      <TableColumn>Item Name</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {adjustmentItems.map((item) => {
                        const diff = item.newStock - item.oldStock;
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
                            <TableCell className="text-[#667085]">
                              {item.transferId}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-[#667085]">
                              {item.unit}
                            </TableCell>
                            <TableCell>{item.oldStock}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={String(item.newStock)}
                                onChange={(e) =>
                                  handleUpdateMultiItem(
                                    item.id,
                                    "newStock",
                                    Number(e.target.value)
                                  )
                                }
                                classNames={{
                                  inputWrapper:
                                    "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-8 w-20",
                                  input: "text-sm text-center",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "font-medium",
                                  diff > 0
                                    ? "text-[#16AB60]"
                                    : diff < 0
                                    ? "text-red-500"
                                    : "text-[#667085]"
                                )}
                              >
                                {diff !== 0
                                  ? `${diff > 0 ? "+" : ""}${diff}`
                                  : "0"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select
                                selectedKeys={[item.staff]}
                                onSelectionChange={(keys) => {
                                  const val = Array.from(keys)[0] as string;
                                  if (val)
                                    handleUpdateMultiItem(
                                      item.id,
                                      "staff",
                                      val
                                    );
                                }}
                                classNames={{
                                  trigger:
                                    "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-8 w-[120px] min-w-[120px]",
                                  value: "text-xs",
                                }}
                                size="sm"
                              >
                                {STAFF_OPTIONS.map((s) => (
                                  <SelectItem key={s}>{s}</SelectItem>
                                ))}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                selectedKeys={[item.reason]}
                                onSelectionChange={(keys) => {
                                  const val = Array.from(keys)[0] as string;
                                  if (val)
                                    handleUpdateMultiItem(
                                      item.id,
                                      "reason",
                                      val
                                    );
                                }}
                                classNames={{
                                  trigger:
                                    "bg-white border border-[#E4E7EC] rounded-lg shadow-none h-8 w-[200px] min-w-[200px]",
                                  value: "text-xs",
                                }}
                                size="sm"
                              >
                                {ADJUSTMENT_REASONS.map((r) => (
                                  <SelectItem key={r}>{r}</SelectItem>
                                ))}
                              </Select>
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
                >
                  Adjust Stocks
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Activity Log View */}
        {mainTab === "activity-log" && (
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6">
            <h2 className="text-xl font-bold text-[#101828] mb-4">
              Stock Adjustment Activity Log
            </h2>
            <Table
              aria-label="Stock adjustment activity log"
              removeWrapper
              classNames={{
                th: "bg-transparent text-[#667085] text-xs font-medium border-b border-[#E4E7EC] py-3",
                td: "py-4 text-sm text-[#101828]",
                tr: "border-b border-[#F2F4F7] last:border-0",
              }}
            >
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Time</TableColumn>
                <TableColumn>Transfer ID</TableColumn>
                <TableColumn>Item Name</TableColumn>
                <TableColumn>Supplier Name</TableColumn>
                <TableColumn>Units</TableColumn>
                <TableColumn>Old Stock</TableColumn>
                <TableColumn>New Stock</TableColumn>
                <TableColumn>Difference</TableColumn>
                <TableColumn>Item Name</TableColumn>
              </TableHeader>
              <TableBody>
                {mockActivityLog.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-[#667085] whitespace-nowrap">
                      {row.date}
                    </TableCell>
                    <TableCell className="text-[#667085] whitespace-nowrap">
                      {row.time}
                    </TableCell>
                    <TableCell className="text-[#667085]">
                      {row.transferId}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {row.itemName}
                    </TableCell>
                    <TableCell className="text-[#667085] whitespace-nowrap">
                      {row.supplierName}
                    </TableCell>
                    <TableCell className="text-[#667085]">
                      {row.units}
                    </TableCell>
                    <TableCell>{row.oldStock}</TableCell>
                    <TableCell>{row.newStock}</TableCell>
                    <TableCell>
                      <span className="text-[#16AB60] font-medium">
                        +{row.difference}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
