"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import { LuEye, LuSearch } from "react-icons/lu";
import {
  X,
  ClipboardList,
  Calendar,
  Package,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  InventoryCountHistoryItem,
  InventoryItem,
} from "@/app/api/controllers/dashboard/inventory";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

interface InventoryCountHistoryTableProps {
  data: InventoryCountHistoryItem[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  inventoryItems?: InventoryItem[];
}

const InventoryCountHistoryTable: React.FC<InventoryCountHistoryTableProps> = ({
  data,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  totalCount,
  pageSize,
  onPageChange,
  searchQuery = "",
  onSearchChange,
  isLoading,
  inventoryItems,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState<InventoryCountHistoryItem | null>(null);
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 10;

  const handleViewDetails = (record: InventoryCountHistoryItem) => {
    setSelectedRecord(record);
    setModalPage(1);
    onOpen();
  };

  const allAdjustments = useMemo(() => {
    if (!selectedRecord?.requestJson) return [];
    try {
      const parsed = JSON.parse(selectedRecord.requestJson);
      // The API seems to store items in 'countRequests' based on the controller
      const items = parsed.countRequests || parsed.adjustments || [];
      return items;
    } catch (e) {
      return [];
    }
  }, [selectedRecord]);

  const paginatedAdjustments = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return allAdjustments.slice(start, start + modalPageSize);
  }, [allAdjustments, modalPage, modalPageSize]);

  const modalTotalPages = Math.ceil(allAdjustments.length / modalPageSize) || 1;

  const summary = useMemo(() => {
    let increases = 0;
    let decreases = 0;
    let unchanged = 0;
    let netChange = 0;
    allAdjustments.forEach((adj: any) => {
      const qty = Number(adj.stockQuantity ?? adj.quantity ?? 0);
      if (qty > 0) increases += qty;
      else if (qty < 0) decreases += Math.abs(qty);
      else unchanged += 1;
      netChange += qty;
    });
    return {
      total: allAdjustments.length,
      increases,
      decreases,
      unchanged,
      netChange,
    };
  }, [allAdjustments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="relative w-64">
          <LuSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 text-sm"
          />
        </div>
      </div>

      {/* Table */}
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
            aria-label="Inventory count history table"
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
              <TableColumn>DATE & TIME</TableColumn>
              <TableColumn>COUNT TYPE</TableColumn>
              <TableColumn>ITEMS COUNTED</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No history found">
              {data.map((item) => {
                let itemsCount = 0;
                try {
                  const parsed = JSON.parse(item.requestJson);
                  itemsCount = (parsed?.countRequests || parsed?.adjustments || []).length;
                } catch (e) {}

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm">
                          {new Date(item.date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{item.type}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span className="text-sm">{itemsCount} items</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleViewDetails(item)}
                          className="hover:bg-[#F0ECFB] rounded-lg"
                        >
                          <LuEye className="w-4 h-4 text-[#5F35D2]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
            pageSize={pageSize}
            onPageChange={onPageChange}
            onNext={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            onPrevious={() => onPageChange(Math.max(currentPage - 1, 1))}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        size="3xl"
        scrollBehavior="inside"
        hideCloseButton
      >
        <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
          {(onClose) => (
            <>
              <ModalBody className="p-0">
                <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-[#5F35D2]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          Count Details
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={14} />
                            {selectedRecord && new Date(selectedRecord.date).toLocaleString("en-GB")}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0ECFB] text-[#5F35D2]">
                            {selectedRecord?.type} Count
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                          Items Adjusted
                        </p>
                        <p className="text-xl font-bold text-gray-800 mt-1">
                          {summary.total}
                        </p>
                      </div>
                      <div className="border border-emerald-100 rounded-xl px-4 py-3 bg-emerald-50">
                        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                          Units Added
                        </p>
                        <p className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1">
                          <ArrowUp className="w-4 h-4" />
                          {summary.increases}
                        </p>
                      </div>
                      <div className="border border-rose-100 rounded-xl px-4 py-3 bg-rose-50">
                        <p className="text-[10px] font-semibold text-rose-700 uppercase tracking-wide">
                          Units Removed
                        </p>
                        <p className="text-xl font-bold text-rose-700 mt-1 flex items-center gap-1">
                          <ArrowDown className="w-4 h-4" />
                          {summary.decreases}
                        </p>
                      </div>
                      <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                          Net Change
                        </p>
                        <p
                          className={`text-xl font-bold mt-1 ${
                            summary.netChange > 0
                              ? "text-emerald-700"
                              : summary.netChange < 0
                              ? "text-rose-700"
                              : "text-gray-700"
                          }`}
                        >
                          {summary.netChange > 0 ? "+" : ""}
                          {summary.netChange}
                        </p>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <Table
                        removeWrapper
                        aria-label="Count adjustment details"
                        classNames={{
                          th: "bg-gray-50 text-gray-500 font-semibold text-xs py-4",
                          td: "py-4 border-b border-gray-100",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>ITEM NAME</TableColumn>
                          <TableColumn align="center">ADJUSTMENT</TableColumn>
                          <TableColumn align="center">QUANTITY</TableColumn>
                          <TableColumn>REASON</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No items found">
                          {paginatedAdjustments.map((adj: any, idx: number) => {
                            // The API uses 'inventoryItemId' and 'stockQuantity' in countRequests
                            const itemId = adj.inventoryItemId || adj.inventoryItemID;
                            const rawQuantity =
                              adj.stockQuantity ?? adj.quantity ?? 0;
                            const quantity = Number(rawQuantity);
                            const inlineName =
                              adj.itemName ||
                              adj.inventoryItemName ||
                              adj.name;
                            const lookedUpName = inventoryItems?.find(
                              (i) => i.id === itemId,
                            )?.name;
                            const itemName =
                              inlineName || lookedUpName || "Unknown item";

                            const adjustmentType = Number(adj.adjustmentType);
                            const isIncrease =
                              adjustmentType === 12 || quantity > 0;
                            const isDecrease =
                              adjustmentType === 13 || quantity < 0;
                            const reason =
                              adj.reason ||
                              (isIncrease
                                ? "Inventory count increase"
                                : isDecrease
                                ? "Inventory count decrease"
                                : "No change");

                            const badge = isIncrease
                              ? {
                                  label: "Increase",
                                  bg: "bg-emerald-50",
                                  text: "text-emerald-700",
                                  border: "border-emerald-100",
                                  Icon: ArrowUp,
                                }
                              : isDecrease
                              ? {
                                  label: "Decrease",
                                  bg: "bg-rose-50",
                                  text: "text-rose-700",
                                  border: "border-rose-100",
                                  Icon: ArrowDown,
                                }
                              : {
                                  label: "Unchanged",
                                  bg: "bg-gray-50",
                                  text: "text-gray-600",
                                  border: "border-gray-100",
                                  Icon: Minus,
                                };

                            return (
                              <TableRow key={idx}>
                                <TableCell>
                                  <span className="text-sm font-medium text-gray-800">
                                    {itemName}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                                    >
                                      <badge.Icon className="w-3 h-3" />
                                      {badge.label}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center">
                                    <span
                                      className={`text-sm font-bold px-3 py-1 rounded-lg ${
                                        isIncrease
                                          ? "text-emerald-700 bg-emerald-50"
                                          : isDecrease
                                          ? "text-rose-700 bg-rose-50"
                                          : "text-gray-700 bg-gray-50"
                                      }`}
                                    >
                                      {quantity > 0 ? `+${quantity}` : quantity}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs text-gray-600">
                                    {reason}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Modal Pagination */}
                    {modalTotalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <CustomPagination
                          currentPage={modalPage}
                          totalPages={modalTotalPages}
                          hasNext={modalPage < modalTotalPages}
                          hasPrevious={modalPage > 1}
                          totalCount={allAdjustments.length}
                          pageSize={modalPageSize}
                          onPageChange={setModalPage}
                          onNext={() => setModalPage(curr => Math.min(curr + 1, modalTotalPages))}
                          onPrevious={() => setModalPage(curr => Math.max(curr - 1, 1))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default InventoryCountHistoryTable;
