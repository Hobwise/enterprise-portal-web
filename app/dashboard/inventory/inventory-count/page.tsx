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
  Checkbox,
} from "@nextui-org/react";
import { LuHistory, LuSearch } from "react-icons/lu";
import { X, CheckCircle2, RefreshCw, Clipboard, ClipboardList } from "lucide-react";
import { InventoryCountIcon } from "@/public/assets/svg";
import { getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import useInventoryCount from "@/hooks/cachedEndpoints/useInventoryCount";
import useInventoryItems from "@/hooks/cachedEndpoints/useInventoryItems";
import {
  InventoryItem,
  InventoryItemType,
} from "@/app/api/controllers/dashboard/inventory";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";
import InventoryCountHistoryTable from "@/components/ui/dashboard/inventory/InventoryCountHistoryTable";
import { cn } from "@/lib/utils";

type CountMode = null | "full" | "partial";

function getStockStatus(item: InventoryItem): string {
  const stock = item.stockLevel ?? 0;
  const reorder = item.reorderLevel ?? 0;
  if (stock === 0) return "out-of-stock";
  if (stock <= reorder) return "low-stock";
  return "in-stock";
}

type CountItem = {
  id: string;
  name: string;
  itemType: string;
  unit: string;
  expectedStock: number;
  reorderLevel: number;
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

export default function InventoryCountPage() {
  const [activeTab, setActiveTab] = useState<"count" | "history">("count");
  const [countMode, setCountMode] = useState<CountMode>(null);
  const [showCountTypeModal, setShowCountTypeModal] = useState(false);

  const pageSize = 10;

  // Stock count state
  const [countItems, setCountItems] = useState<CountItem[]>([]);
  const [countSearchQuery, setCountSearchQuery] = useState("");
  const [countItemTypeFilter, setCountItemTypeFilter] = useState("all");
  const [countStockLevelFilter, setCountStockLevelFilter] = useState("all");
  const [selectedPartialItems, setSelectedPartialItems] = useState<Set<string>>(new Set());
  const [countPage, setCountPage] = useState(1);
  const countPageSize = 10;

  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessName = businessInformation?.[0]?.businessName || "Store";

  const {
    // Items from /api/v1/Inventory/by-business — used to seed Full/Partial count
    items: inventoryItems,
    isLoadingItems: isLoading,
    refetchItems,
    submitInventoryCount,
    isSubmitting,
    // History data
    history: historyItems,
    totalCount: historyTotalCount,
    totalPages: historyTotalPages,
    currentPage: historyCurrentPage,
    hasNext: historyHasNext,
    hasPrevious: historyHasPrevious,
    isLoadingHistory,
    // History pagination controls
    setPage: setHistoryPage,
    search: historySearch,
    setSearch: setHistorySearch,
  } = useInventoryCount({
    itemsPage: 1,
    itemsPageSize: countMode || showCountTypeModal ? 1000 : pageSize,
    itemsSearch: "",
  });

  // Full inventory lookup (id -> item) used by the history view modal so item
  // names resolve even when the main table is paginated/filtered to a subset.
  const { data: allInventoryItems } = useInventoryItems({
    pageSize: 1000,
    enabled: activeTab === "history",
  });

  const historyLookupItems = useMemo(() => {
    if (allInventoryItems && allInventoryItems.length > 0) {
      return allInventoryItems;
    }
    return inventoryItems;
  }, [allInventoryItems, inventoryItems]);

  // Sync countItems when inventoryItems are loaded in count mode
  useEffect(() => {
    if (countMode && inventoryItems.length > 0 && countItems.length === 0) {
      initializeCountItems(countMode);
    }
  }, [countMode, inventoryItems]);

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

    if (countStockLevelFilter !== "all") {
      items = items.filter((item) => {
        // Adapt item for getStockStatus helper
        const tempItem: any = {
          stockLevel: item.expectedStock,
          reorderLevel: item.reorderLevel,
        };
        return getStockStatus(tempItem) === countStockLevelFilter;
      });
    }

    return items;
  }, [countItems, countSearchQuery, countItemTypeFilter, countStockLevelFilter]);

  const paginatedCountItems = useMemo(() => {
    const start = (countPage - 1) * countPageSize;
    return filteredCountItems.slice(start, start + countPageSize);
  }, [filteredCountItems, countPage, countPageSize]);

  const countTotalPages = Math.ceil(filteredCountItems.length / countPageSize) || 1;

  // Initialize count items from inventory
  const initializeCountItems = (type: CountMode) => {
    const items: CountItem[] = inventoryItems.map((item) => ({
      id: item.id,
      name: item.name,
      itemType: getItemTypeName(item.itemType),
      unit: item.unitName || item.unitCode || "Unit",
      expectedStock: item.stockLevel || 0,
      reorderLevel: item.reorderLevel || 0,
      verifiedCount: 0,
      selected: type === "full",
    }));
    setCountItems(items);
    setSelectedPartialItems(new Set());
    setCountStockLevelFilter("all");
    setCountItemTypeFilter("all");
    setCountPage(1);
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
      type: countMode === "partial" ? "Partial" : "Full",
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

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-1">
          {/* Inventory Count Tab */}
          <button
            onClick={() => {
              setActiveTab("count");
              setCountMode(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "count"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]"
            )}
          >
            <InventoryCountIcon className="w-4 h-4" />
            Inventory Count
          </button>

          {/* History Tab */}
          <button
            onClick={() => {
              setActiveTab("history");
              setCountMode(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "history"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]"
            )}
          >
         <LuHistory size={16} />
            History
          </button>
        </div>

      </div>

      {/* Page Title & Subtitle */}
      {countMode === null && (
        <div className="px-6 pt-4 mb-2">
          <h1 className="text-2xl font-bold text-[#101828]">
            {activeTab === "count" ? "Inventory Count" : "Inventory Count History"}
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            {activeTab === "count"
              ? "Run a stock count to verify and reconcile your inventory items"
              : "View the history of all inventory counts performed"}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* ===== INVENTORY COUNT (main view, no count mode) ===== */}
        {activeTab === "count" && countMode === null && (
          <div>
            {/* Empty state — items list is hidden until user picks Full or Partial */}
            <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-2xl bg-white py-16 px-6">
              <div className="w-14 h-14 rounded-full bg-[#F0ECFB] flex items-center justify-center mb-4">
                <ClipboardList className="w-7 h-7 text-[#5F35D2]" />
              </div>
              <h2 className="text-lg font-semibold text-[#101828] mb-1">
                Start a stock count to view items
              </h2>
              <p className="text-sm text-[#667085] max-w-md mb-6">
                Choose between a full or partial stock count to see your inventory items and verify their counts.
              </p>
              <Button
                className="h-12 rounded-xl bg-[#1D2939] text-white font-semibold text-sm px-8"
                endContent={<RefreshCw className="w-4 h-4" />}
                onPress={handleRunStockCount}
              >
                Run Stock Count
              </Button>
            </div>

          </div>
        )}

        {/* ===== HISTORY VIEW ===== */}
        {activeTab === "history" && countMode === null && (
          <div>
            <InventoryCountHistoryTable
              data={historyItems}
              currentPage={historyCurrentPage}
              totalPages={historyTotalPages}
              hasNext={historyHasNext}
              hasPrevious={historyHasPrevious}
              totalCount={historyTotalCount}
              pageSize={pageSize}
              onPageChange={(p) => setHistoryPage(p)}
              searchQuery={historySearch}
              onSearchChange={(s) => setHistorySearch(s)}
              isLoading={isLoadingHistory}
              inventoryItems={historyLookupItems}
            />
          </div>
        )}

        {/* ===== STOCK COUNT MODE (Full or Partial) ===== */}
        {countMode !== null && (
          <div>
            {/* Title + Verify Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#101828]">
                  {countMode === "full" ? "Full Stock Count" : "Partial Stock Count"}
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
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <LuSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={countSearchQuery}
                  onChange={(e) => setCountSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  placeholder="Item Type"
                  selectedKeys={countItemTypeFilter !== "all" ? [countItemTypeFilter] : []}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    setCountItemTypeFilter(val || "all");
                  }}
                  variant="bordered"
                  className="w-[180px]"
                  classNames={{
                    trigger: "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                    value: "text-sm text-[#101828]",
                    listboxWrapper: "max-h-[300px]",
                  }}
                >
                  <SelectItem key="0" className="text-[#101828]">Direct</SelectItem>
                  <SelectItem key="1" className="text-[#101828]">Ingredient</SelectItem>
                  <SelectItem key="2" className="text-[#101828]">Produced</SelectItem>
                </Select>

                <Select
                  placeholder="Stock Level"
                  selectedKeys={countStockLevelFilter !== "all" ? [countStockLevelFilter] : []}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    setCountStockLevelFilter(val || "all");
                  }}
                  variant="bordered"
                  className="w-[180px]"
                  classNames={{
                    trigger: "bg-white border-[#E4E7EC] rounded-lg shadow-none h-10",
                    value: "text-sm text-[#101828]",
                    listboxWrapper: "max-h-[300px]",
                  }}
                >
                  <SelectItem key="in-stock" className="text-[#101828]">In Stock</SelectItem>
                  <SelectItem key="low-stock" className="text-[#101828]">Low Stock</SelectItem>
                  <SelectItem key="out-of-stock" className="text-[#101828]">Out of Stock</SelectItem>
                </Select>

                {(countItemTypeFilter !== "all" || countStockLevelFilter !== "all" || countSearchQuery) && (
                  <button
                    onClick={() => {
                      setCountItemTypeFilter("all");
                      setCountStockLevelFilter("all");
                      setCountSearchQuery("");
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-10"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Count Table */}
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
                    {paginatedCountItems.map((item) => {
                      const diff = item.verifiedCount - item.expectedStock;
                      return (
                        <TableRow key={item.id}>
                          {countMode === "partial" ? (
                            <TableCell>
                              <Checkbox
                                isSelected={selectedPartialItems.has(item.id)}
                                onValueChange={() => handleTogglePartialItem(item.id)}
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
                                handleUpdateVerifiedCount(item.id, Number(e.target.value) || 0)
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
              <CustomPagination
                currentPage={countPage}
                totalPages={countTotalPages}
                hasNext={countPage < countTotalPages}
                hasPrevious={countPage > 1}
                totalCount={filteredCountItems.length}
                pageSize={countPageSize}
                onPageChange={(p) => setCountPage(p)}
                onNext={() => setCountPage((curr) => Math.min(curr + 1, countTotalPages))}
                onPrevious={() => setCountPage((curr) => Math.max(curr - 1, 1))}
              />
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
      </div>

      {/* Count Type Selection Modal */}
      <Modal
        isOpen={showCountTypeModal}
        onOpenChange={setShowCountTypeModal}
        size="md"
        placement="center"
        hideCloseButton
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

    </div>
  );
}
