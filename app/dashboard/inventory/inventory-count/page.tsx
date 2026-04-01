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
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
} from "@nextui-org/react";
import { LuSearch } from "react-icons/lu";
import { Eye, X, CheckCircle2, RefreshCw, Clipboard, ClipboardList } from "lucide-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { InventoryCountIcon } from "@/public/assets/svg";
import { cn, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import useInventoryItems from "@/hooks/cachedEndpoints/useInventoryItems";
import useInventoryCount from "@/hooks/cachedEndpoints/useInventoryCount";
import {
  InventoryItem,
  InventoryItemType,
} from "@/app/api/controllers/dashboard/inventory";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

type MainTab = "inventory-count" | "activity-log";
type CountMode = null | "full" | "partial";

type CountItem = {
  id: string;
  name: string;
  itemType: string;
  unit: string;
  expectedStock: number;
  verifiedCount: number;
  selected: boolean;
};

const getItemTypeName = (itemType: InventoryItemType): string => {
  switch (itemType) {
    case InventoryItemType.Direct:
      return "Inventory";
    case InventoryItemType.Ingredient:
      return "Ingredient";
    case InventoryItemType.Produced:
      return "Produced";
    default:
      return "Inventory";
  }
};


const formatCountType = (type: string): string => {
  return type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
};

export default function InventoryCountPage() {
  const [mainTab, setMainTab] = useState<MainTab>("inventory-count");
  const [countMode, setCountMode] = useState<CountMode>(null);
  const [showCountTypeModal, setShowCountTypeModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<InventoryItem | null>(null);

  // Inventory Count main tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Stock count state
  const [countItems, setCountItems] = useState<CountItem[]>([]);
  const [countSearchQuery, setCountSearchQuery] = useState("");
  const [countItemTypeFilter, setCountItemTypeFilter] = useState("all");
  const [selectedPartialItems, setSelectedPartialItems] = useState<Set<string>>(new Set());

  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessName = businessInformation?.[0]?.businessName || "Store";

  const {
    data: inventoryItems,
    totalCount,
    totalPages,
    currentPage,
    hasNext,
    hasPrevious,
    isLoading,
    refetch: refetchItems,
  } = useInventoryItems({ page, pageSize, search: debouncedSearch });

  const {
    history,
    totalCount: historyTotalCount,
    totalPages: historyTotalPages,
    currentPage: historyCurrentPage,
    hasNext: historyHasNext,
    hasPrevious: historyHasPrevious,
    isLoadingHistory,
    refetchHistory,
    submitInventoryCount,
    isSubmitting,
    page: historyPage,
    setPage: setHistoryPage,
    pageSize: historyPageSize,
  } = useInventoryCount();

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter inventory items for the main tab
  const filteredItems = useMemo(() => {
    let items = inventoryItems;

    if (itemTypeFilter !== "all") {
      items = items.filter(
        (item) => String(item.itemType) === itemTypeFilter
      );
    }

    return items;
  }, [inventoryItems, itemTypeFilter]);

  // Filter count items for the stock count view
  const filteredCountItems = useMemo(() => {
    let items = countItems;

    if (countSearchQuery) {
      const q = countSearchQuery.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(q)
      );
    }

    if (countItemTypeFilter !== "all") {
      items = items.filter((item) => {
        switch (countItemTypeFilter) {
          case "0":
            return item.itemType === "Inventory";
          case "1":
            return item.itemType === "Ingredient";
          case "2":
            return item.itemType === "Produced";
          default:
            return true;
        }
      });
    }

    return items;
  }, [countItems, countSearchQuery, countItemTypeFilter]);

  // Initialize count items from inventory
  const initializeCountItems = (type: CountMode) => {
    const items: CountItem[] = inventoryItems.map((item) => ({
      id: item.id,
      name: item.name,
      itemType: getItemTypeName(item.itemType),
      unit: item.unitName || item.unitCode || "Unit",
      expectedStock: item.stockLevel || 0,
      verifiedCount: 0,
      selected: type === "full",
    }));
    setCountItems(items);
    setSelectedPartialItems(new Set());
  };

  const handleRunStockCount = () => {
    setShowCountTypeModal(true);
  };

  const handleSelectCountType = (type: CountMode) => {
    setCountMode(type);
    setShowCountTypeModal(false);
    initializeCountItems(type);
  };

  const handleUpdateVerifiedCount = (id: string, value: number) => {
    setCountItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, verifiedCount: value } : item
      )
    );
  };

  const handleTogglePartialItem = (id: string) => {
    setSelectedPartialItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmitStockCount = () => {
    const itemsToSubmit =
      countMode === "full"
        ? countItems
        : countItems.filter((item) => selectedPartialItems.has(item.id));

    if (itemsToSubmit.length === 0) {
      notify({
        title: "No items selected",
        text: "Please select items to count",
        type: "warning",
      });
      return;
    }

    const hasEmptyCount = itemsToSubmit.some((item) => item.verifiedCount <= 0);
    if (hasEmptyCount) {
      notify({
        title: "Missing counts",
        text: "Please enter a stock quantity for all selected items",
        type: "warning",
      });
      return;
    }

    submitInventoryCount({
      countRequests: itemsToSubmit.map((item) => ({
        inventoryItemId: item.id,
        stockQuantity: item.verifiedCount,
      })),
    }, {
      onSuccess: (response: any) => {
        if (response?.data?.isSuccessful) {
          setCountMode(null);
          setCountItems([]);
          refetchItems();
        }
      },
    });
  };

  const getFreshIds = () => {
    const user = getJsonItemFromLocalStorage("userInformation");
    const business = getJsonItemFromLocalStorage("business");
    return {
      cooperateID: user?.cooperateID || "",
      businessID: business?.[0]?.businessId || "",
    };
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedDetailItem(item);
    setShowItemDetailModal(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
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
      }).toLowerCase();
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Top Tabs + Current Store */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-1">
          {/* Inventory Count Tab */}
          <button
            onClick={() => {
              setMainTab("inventory-count");
              setCountMode(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mainTab === "inventory-count"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]"
            )}
          >
            <InventoryCountIcon className="w-4 h-4" />
            Inventory Count
          </button>

          {/* Activity Log Tab */}
          <button
            onClick={() => {
              setMainTab("activity-log");
              setCountMode(null);
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
        {/* ===== INVENTORY COUNT TAB (main view, no count mode) ===== */}
        {mainTab === "inventory-count" && countMode === null && (
          <div>
            {/* Title + Run Stock Count Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#101828]">
                  Inventory Count
                </h1>
                <p className="text-sm text-[#667085] mt-1">
                  View the current count and status of all stock items in your inventory
                </p>
              </div>
              <Button
                className="h-12 rounded-xl bg-[#1D2939] text-white font-semibold text-sm px-8"
                endContent={<RefreshCw className="w-4 h-4" />}
                onPress={handleRunStockCount}
              >
                Run Stock Count
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-end mb-4">
              <Select
                placeholder="Item Type"
                selectedKeys={
                  itemTypeFilter !== "all" ? [itemTypeFilter] : []
                }
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setItemTypeFilter(val || "all");
                  setPage(1);
                }}
                variant="bordered"
                className="w-[180px]"
                classNames={{
                  trigger:
                    "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                  value: "text-sm text-[#101828]",
                  listboxWrapper: "max-h-[300px]",
                }}
              >
                <SelectItem key="0" className="text-[#101828]">Direct</SelectItem>
                <SelectItem key="1" className="text-[#101828]">Ingredient</SelectItem>
                <SelectItem key="2" className="text-[#101828]">Produced</SelectItem>
              </Select>
            </div>

            {/* Items Table */}
            <div className="relative border border-primaryGrey rounded-lg overflow-visible">
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#5F35D2]" />
                </div>
              )}
              <div className="max-h-[500px] overflow-auto">
                <Table
                  radius="lg"
                  isCompact
                  removeWrapper
                  aria-label="Inventory count table"
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
                    <TableColumn>ITEM NAME</TableColumn>
                    <TableColumn>ITEM TYPE</TableColumn>
                    <TableColumn>ITEM UNIT</TableColumn>
                    <TableColumn>OPTIMUM STOCK</TableColumn>
                    <TableColumn>CURRENT STOCK</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>{""}</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No inventory items found">
                    {filteredItems.map((item) => {
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-sm text-[#101828]">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {getItemTypeName(item.itemType)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.unitName || item.unitCode || "Unit"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.reorderLevel || 0}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {item.stockLevel || 0}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {item.stockStatus || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div
                              className="relative flex justify-center items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Dropdown>
                                <DropdownTrigger aria-label="actions">
                                  <div className="cursor-pointer flex justify-center items-center text-black">
                                    <HiOutlineDotsVertical className="text-[22px]" />
                                  </div>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label="Item actions"
                                  className="text-black"
                                >
                                  <DropdownItem
                                    key="view"
                                    startContent={<Eye size={16} />}
                                    onPress={() => handleViewItem(item)}
                                  >
                                    View
                                  </DropdownItem>
                                  <DropdownItem
                                    key="adjust"
                                    startContent={
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M4 8h8M8 4v8"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    }
                                    href="/dashboard/inventory/stock-adjustment"
                                  >
                                    Adjust Stock
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
                onNext={() => setPage(Math.min(page + 1, totalPages))}
                onPrevious={() => setPage(Math.max(page - 1, 1))}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* ===== STOCK COUNT MODE (Full or Partial) ===== */}
        {mainTab === "inventory-count" && countMode !== null && (
          <div>
            {/* Title + Verify Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#101828]">
                  {countMode === "full"
                    ? "Full Stock Count"
                    : "Partial Stock Count"}
                </h1>
                <p className="text-sm text-[#667085] mt-1">
                  {countMode === "full"
                    ? "All items registered on this inventory are on this count"
                    : "Count selected items in inventory"}
                </p>
              </div>
              <Button
                className="h-12 rounded-xl bg-[#5F35D2] text-white font-semibold text-sm px-8"
                endContent={<CheckCircle2 className="w-4 h-4" />}
                onPress={handleSubmitStockCount}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                Verify Stock Count
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <LuSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={countSearchQuery}
                  onChange={(e) => setCountSearchQuery(e.target.value)}
                  className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] w-72"
                />
              </div>

              <Select
                placeholder="Item Type"
                selectedKeys={
                  countItemTypeFilter !== "all"
                    ? [countItemTypeFilter]
                    : []
                }
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setCountItemTypeFilter(val || "all");
                }}
                variant="bordered"
                className="w-[180px]"
                classNames={{
                  trigger:
                    "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                  value: "text-sm text-[#101828]",
                  listboxWrapper: "max-h-[300px]",
                }}
              >
                <SelectItem key="0" className="text-[#101828]">Direct</SelectItem>
                <SelectItem key="1" className="text-[#101828]">Ingredient</SelectItem>
                <SelectItem key="2" className="text-[#101828]">Produced</SelectItem>
              </Select>
            </div>

            {/* Count Table */}
            <div className="relative border border-primaryGrey rounded-lg overflow-visible">
              <div className="max-h-[500px] overflow-auto">
                <Table
                  radius="lg"
                  isCompact
                  removeWrapper
                  aria-label="Stock count table"
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
                    {countMode === "partial" ? (
                      <TableColumn>{""}</TableColumn>
                    ) : (
                      <TableColumn className="hidden">{""}</TableColumn>
                    )}
                    <TableColumn>ITEM NAME</TableColumn>
                    <TableColumn>ITEM TYPE</TableColumn>
                    <TableColumn>ITEM UNIT</TableColumn>
                    <TableColumn>EXPECTED STOCK</TableColumn>
                    <TableColumn>VERIFIED COUNT</TableColumn>
                    <TableColumn>DIFFERENCE</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No items to count">
                    {filteredCountItems.map((item) => {
                      const diff = item.verifiedCount - item.expectedStock;
                      return (
                        <TableRow key={item.id}>
                          {countMode === "partial" ? (
                            <TableCell>
                              <Checkbox
                                isSelected={selectedPartialItems.has(item.id)}
                                onValueChange={() =>
                                  handleTogglePartialItem(item.id)
                                }
                                size="sm"
                              />
                            </TableCell>
                          ) : (
                            <TableCell className="hidden">{null}</TableCell>
                          )}
                          <TableCell className="font-medium text-sm text-[#101828]">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.itemType}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.unit}
                          </TableCell>
                          <TableCell className="text-sm text-center">
                            {item.expectedStock}
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={0}
                              value={item.verifiedCount}
                              onChange={(e) =>
                                handleUpdateVerifiedCount(
                                  item.id,
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5F35D2] focus:border-[#5F35D2]"
                            />
                          </TableCell>
                          <TableCell className="text-sm text-center">
                            {diff}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Back button */}
            <div className="mt-4">
              <Button
                variant="bordered"
                className="h-10 rounded-lg border-[#E4E7EC] text-[#667085] font-medium text-sm px-6"
                startContent={<X className="w-4 h-4" />}
                onPress={() => {
                  setCountMode(null);
                  setCountItems([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ===== ACTIVITY LOG TAB ===== */}
        {mainTab === "activity-log" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#101828]">
                Activity Log
              </h1>
              <p className="text-sm text-[#667085] mt-1">
                View Inventory count activities in your location.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#101828]">
                  Activity List
                </h3>
              </div>

              {isLoadingHistory && (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#5F35D2]" />
                </div>
              )}

              {!isLoadingHistory && history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Clipboard className="w-12 h-12 mb-3" />
                  <p className="text-sm">No activity log entries found</p>
                </div>
              )}

              {!isLoadingHistory && history.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {history.map((entry, idx) => {
                    const isActive =
                      entry.status === "completed" || entry.status === "active";
                    return (
                      <div
                        key={entry.id || idx}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                              isActive ? "bg-[#5F35D2]" : "bg-gray-300"
                            )}
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "text-base font-semibold",
                                  isActive
                                    ? "text-[#5F35D2]"
                                    : "text-gray-400"
                                )}
                              >
                                {formatCountType(entry.countType)}
                              </span>
                              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded">
                                {entry.referenceNumber}
                              </span>
                            </div>
                            <p className="text-sm text-[#667085]">
                              {entry.description ||
                                `Stock count ${entry.referenceNumber} Initiated and completed`}
                            </p>
                            <p className="text-sm text-[#667085] mt-0.5">
                              {formatDate(entry.date)}{" "}
                              {formatTime(entry.date)}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-[#5F35D2] transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {historyTotalPages > 1 && (
                <CustomPagination
                  currentPage={historyCurrentPage}
                  totalPages={historyTotalPages}
                  hasNext={historyHasNext}
                  hasPrevious={historyHasPrevious}
                  totalCount={historyTotalCount}
                  pageSize={historyPageSize}
                  onPageChange={(p) => setHistoryPage(p)}
                  onNext={() =>
                    setHistoryPage(Math.min(historyPage + 1, historyTotalPages))
                  }
                  onPrevious={() =>
                    setHistoryPage(Math.max(historyPage - 1, 1))
                  }
                  isLoading={isLoadingHistory}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Count Type Selection Modal */}
      <Modal
        isOpen={showCountTypeModal}
        onOpenChange={setShowCountTypeModal}
        size="md"
        placement="center"
      >
        <ModalContent>
          <ModalBody className="py-6">
            <button
              onClick={() => handleSelectCountType("full")}
              className="flex items-center gap-4 w-full p-4 rounded-xl border border-gray-200 hover:border-[#5F35D2] hover:bg-[#F9F8FE] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#F0ECFB] flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-gray-500 group-hover:text-[#5F35D2]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#101828]">
                  Full Stock Count
                </p>
                <p className="text-sm text-[#667085]">
                  Count all item in inventory
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSelectCountType("partial")}
              className="flex items-center gap-4 w-full p-4 rounded-xl border border-gray-200 hover:border-[#5F35D2] hover:bg-[#F9F8FE] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#F0ECFB] flex items-center justify-center flex-shrink-0">
                <Clipboard className="w-5 h-5 text-gray-500 group-hover:text-[#5F35D2]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#101828]">
                  Partial Stock Count
                </p>
                <p className="text-sm text-[#667085]">
                  Count selected items in inventory
                </p>
              </div>
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Item Detail Modal */}
      <Modal
        isOpen={showItemDetailModal}
        onOpenChange={setShowItemDetailModal}
        size="lg"
        placement="center"
      >
        <ModalContent>
          {selectedDetailItem && (() => {
            return (
              <ModalBody className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#101828]">
                    {selectedDetailItem.name}
                  </h2>
                  <button
                    onClick={() => setShowItemDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-[#667085] font-medium w-40">
                          Item Type
                        </td>
                        <td className="px-4 py-3 text-[#101828]">
                          {getItemTypeName(selectedDetailItem.itemType)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-[#667085] font-medium">
                          Unit
                        </td>
                        <td className="px-4 py-3 text-[#101828]">
                          {selectedDetailItem.unitName ||
                            selectedDetailItem.unitCode ||
                            "Unit"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-[#667085] font-medium">
                          Optimum Stock
                        </td>
                        <td className="px-4 py-3 text-[#101828]">
                          {selectedDetailItem.reorderLevel || 0}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-[#667085] font-medium">
                          Current Stock
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#101828]">
                          {selectedDetailItem.stockLevel || 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-[#667085] font-medium">
                          Status
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#101828]">
                          {selectedDetailItem.stockStatus || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ModalBody>
            );
          })()}
        </ModalContent>
      </Modal>
    </div>
  );
}
