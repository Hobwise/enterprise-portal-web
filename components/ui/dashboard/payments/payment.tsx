"use client";

import React, { useEffect, useState } from "react";

import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
  SortDescriptor,
} from "@nextui-org/react";
import SpinnerLoader from "@/components/ui/dashboard/menu/SpinnerLoader";
import { HiOutlineDotsVertical } from "react-icons/hi";

import { GrFormView } from "react-icons/gr";
import { columns, paymentTypeMap, statusColorMap, statusDataMap, isCheckoutPayment } from "./data";

import moment from "moment";

import { useGlobalContext } from "@/hooks/globalProvider";
import usePagination from "@/hooks/usePagination";
import { formatPrice } from "@/lib/utils";
import ApprovePayment from "./approvePayment";
import Filters from "./filters";
import PaymentBreakdownModal from "../orders/PaymentBreakdownModal";
import { Info } from "lucide-react";

const INITIAL_VISIBLE_COLUMNS = [
  "paymentType",
  "totalAmount",
  "qrName",
  "reference",
  "treatedBy",
  "dateCreated",
  "customer",
  "status",
  "actions",
];
interface PaymentItem {
  id: string;
  qrName: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  dateCreated: string;
  customer: string;
  status: number;
  paymentReference: string;
  paymentType: number;
  paymentMethod: number;
  checkOutReference?: string;
}

interface PaymentCategory {
  name: string;
  totalCount: number;
  payments: PaymentItem[];
}

interface PaymentsListProps {
  payments:
    | PaymentItem[]
    | { payments?: PaymentItem[]; data?: PaymentItem[] }
    | any;
  categories: PaymentCategory[];
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  isPending?: boolean;
  filterType?: number;
  startDate?: string;
  endDate?: string;
  currentPage?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  totalCount?: number;
}

// Function to get filtered payments based on search query
const getFilteredPaymentDetails = (
  payments: any,
  isLoading: boolean,
  isPending: boolean,
  searchQuery: string = ""
): PaymentItem[] => {
  // Check if data is in pending state
  if (isLoading || isPending || !payments) {
    return [];
  }

  // Extract payments data - ensure it's always a valid array
  let allPayments: PaymentItem[] = [];
  if (Array.isArray(payments)) {
    allPayments = payments;
  } else if (payments.payments && Array.isArray(payments.payments)) {
    allPayments = payments.payments;
  } else if (payments.data && Array.isArray(payments.data)) {
    allPayments = payments.data;
  } else {
    // Fallback to empty array if no valid data found
    allPayments = [];
  }

  // Safety check - ensure allPayments is valid array before filtering
  if (!Array.isArray(allPayments)) {
    return [];
  }

  // Apply search filter if provided
  if (searchQuery.trim()) {
    return allPayments.filter(
      (payment: PaymentItem) =>
        payment.qrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.treatedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paymentTypeMap[payment.paymentType]
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  return allPayments;
};

const PaymentsList: React.FC<PaymentsListProps> = ({
  payments,
  categories,
  searchQuery,
  refetch,
  isLoading = false,
  isPending = false,
  filterType = 1,
  startDate,
  endDate,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  totalCount,
}) => {
  const [singlePayment, setSinglePayment] = React.useState<PaymentItem | null>(
    null
  );
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isOpenPaymentBreakdown, setIsOpenPaymentBreakdown] = React.useState<boolean>(false);
  const { page, rowsPerPage, setTableStatus, tableStatus, setPage } =
    useGlobalContext();

  // Use the payments prop directly - API already returns category-specific data
  // Memoize to prevent infinite loops in usePagination
  const paymentDetails = React.useMemo(() => 
    getFilteredPaymentDetails(
      payments,
      isLoading,
      isPending || false,
      searchQuery
    ),
  [payments, isLoading, isPending, searchQuery]);

  // Create pagination data structure for usePagination hook (matching Orders component)
  const paginationData = React.useMemo(() => {
    return {
      data: paymentDetails,
      totalPages: totalPages || 1,
      currentPage: currentPage || 1,
      hasNext: hasNext || false,
      hasPrevious: hasPrevious || false,
      totalCount: totalCount || 0,
    };
  }, [paymentDetails, currentPage, totalPages, hasNext, hasPrevious, totalCount]);

  // Use usePagination hook for mobile/desktop responsive layout (matching Orders component)
  const {
    headerColumns,
    setSelectedKeys,
    selectedKeys,
    sortDescriptor,
    setSortDescriptor,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    classNames,
    hasSearchFilter,
    displayData,
    isMobile,
    isLoadingMore,
    bottomContent,
  } = usePagination(paginationData, columns, INITIAL_VISIBLE_COLUMNS);

  // Sort the payments based on sortDescriptor
  // Use displayData which contains accumulated data on mobile, current page on desktop
  const sortedPayments = React.useMemo(() => {
    if (!displayData || displayData.length === 0) return displayData;

    return [...displayData].sort((a: PaymentItem, b: PaymentItem) => {
      const first = a[sortDescriptor.column as keyof PaymentItem];
      const second = b[sortDescriptor.column as keyof PaymentItem];

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [displayData, sortDescriptor]);

  // State for table sorting and selection (kept for backward compatibility with desktop table)
  const [selectedKeysLegacy, setSelectedKeysLegacy] = React.useState<Selection>(
    new Set([])
  );
  const [sortDescriptorLegacy, setSortDescriptorLegacy] = React.useState<SortDescriptor>({
    column: "dateCreated",
    direction: "descending",
  });

  // Filter visible columns (legacy - for desktop table)
  const headerColumnsLegacy = React.useMemo(() => {
    return columns.filter((column) =>
      INITIAL_VISIBLE_COLUMNS.includes(column.uid)
    );
  }, []);

  // Explicit open/close avoids the phase-desync that a setIsOpen(!isOpen)
  // toggle suffers when onOpenChange fires out of sync — which made row
  // clicks intermittently fail to open the modal.
  const openApproveModal = (payment: PaymentItem) => {
    setSinglePayment(payment);
    setIsOpen(true);
  };

  const closeApproveModal = () => {
    setIsOpen(false);
  };

  const togglePaymentBreakdownModal = (payment: PaymentItem) => {
    setSinglePayment(payment);
    setIsOpenPaymentBreakdown(true);
  };

  const handleTabClick = (categoryName: string) => {
    setTableStatus(categoryName);
    setPage(1);
  };

  const renderCell = React.useCallback(
    (payment: PaymentItem, columnKey: string) => {
      const cellValue = payment[columnKey as keyof PaymentItem];

      switch (columnKey) {
        case "paymentType":
          return (
            <div className="font-medium text-black text-sm">
              <p>{paymentTypeMap[payment.paymentType]}</p>
            </div>
          );
        case "totalAmount":
          return (
            <div className="font-medium text-black text-sm">
              <p>{formatPrice(payment.totalAmount)}</p>
            </div>
          );
        case "qrName":
          return (
            <div className="flex text-textGrey text-sm">{payment.qrName}</div>
          );
        case "reference":
          return (
            <div className="text-textGrey text-sm">{payment.reference}</div>
          );
        case "treatedBy":
          return (
            <div className="text-textGrey text-sm">{payment.treatedBy}</div>
          );
        case "dateCreated":
          return (
            <div className="text-textGrey text-sm">
              {moment(payment.dateCreated).format("MMMM Do YYYY, h:mm:ss a")}
            </div>
          );
        case "customer":
          return (
            <div className="text-textGrey text-sm">{payment.customer}</div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[payment.status]}
              size="sm"
              variant="bordered"
            >
              {statusDataMap[payment.status]}
            </Chip>
          );

        case "actions":
          return (
            <div
              className="relative flexjustify-center items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown className="">
                <DropdownTrigger aria-label="actions">
                  <div className="cursor-pointer flex justify-center items-center text-black">
                    <HiOutlineDotsVertical className="text-[22px] " />
                  </div>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Approve payment"
                  className="text-black"
                >
                  <DropdownItem
                    onClick={() => {
                      openApproveModal(payment);
                    }}
                    aria-label="update order"
                  >
                    <div className={` flex gap-2  items-center text-grey500`}>
                      <GrFormView className="text-[20px]" />
                      <p>View more</p>
                    </div>
                  </DropdownItem>
                  {isCheckoutPayment(payment.paymentMethod) && (
                    <DropdownItem
                      onClick={() => {
                        togglePaymentBreakdownModal(payment);
                      }}
                      aria-label="payment breakdown"
                    >
                      <div className={` flex gap-2  items-center text-grey500`}>
                        <Info className="w-[18px] h-[18px]" />
                        <p>Payment Breakdown</p>
                      </div>
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  const renderMobileCard = React.useCallback(
    (payment: PaymentItem) => (
      <article
        key={payment.id}
        className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
        onClick={() => handleRowClick(payment)}
      >
        <div className="flex items-end justify-end mb-3 mt-2">
          <div className="ml-2" onClick={(e) => e.stopPropagation()}>
            <Dropdown aria-label="payment actions" className="">
              <DropdownTrigger aria-label="actions">
                <div className="cursor-pointer flex justify-center items-center text-black p-2 -m-2">
                  <HiOutlineDotsVertical className="text-[20px]" />
                </div>
              </DropdownTrigger>
              <DropdownMenu className="text-black">
                <DropdownSection>
                  <DropdownItem
                    key="view-more"
                    onClick={() => openApproveModal(payment)}
                    aria-label="View more"
                  >
                    <div className="flex gap-3 items-center text-grey500">
                      <GrFormView className="text-[18px]" />
                      <p>View more</p>
                    </div>
                  </DropdownItem>
                  {isCheckoutPayment(payment.paymentMethod) && (
                    <DropdownItem
                      key="payment-breakdown"
                      onClick={() => togglePaymentBreakdownModal(payment)}
                      aria-label="Payment Breakdown"
                    >
                      <div className="flex gap-3 items-center text-grey500">
                        <Info className="w-[18px] h-[18px]" />
                        <p>Payment Breakdown</p>
                      </div>
                    </DropdownItem>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-black text-[15px]">
                {paymentTypeMap[payment.paymentType]}
              </span>
            </div>
            <div className="text-textGrey text-[13px]">{payment.customer}</div>
          </div>
          <div>
            <div className="text-[11px] text-textGrey uppercase mb-1">Amount</div>
            <div className="text-black font-semibold text-[15px]">
              {formatPrice(payment.totalAmount)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-textGrey uppercase mb-1">Table</div>
            <div className="text-black font-semibold text-[15px]">
              {payment.qrName}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-textGrey uppercase mb-1">Order ID</div>
            <div className="text-black text-[13px] truncate">
              {payment.reference}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Chip
            className="capitalize"
            color={statusColorMap[payment.status]}
            size="sm"
            variant="bordered"
          >
            {statusDataMap[payment.status]}
          </Chip>
          <div className="text-textGrey text-[12px]">
            {moment(payment.dateCreated).format("MMM DD, YYYY h:mm A")}
          </div>
        </div>
      </article>
    ),
    []
  );

  const topContent = React.useMemo(() => {
    return (
      <Filters
        payments={categories}
        tableStatus={tableStatus}
        handleTabClick={handleTabClick}
      />
    );
  }, [categories, tableStatus]);

  const paymentBreakdownModal = React.useMemo(() => {
    return (
      <PaymentBreakdownModal
        isOpen={isOpenPaymentBreakdown}
        onOpenChange={setIsOpenPaymentBreakdown}
        reference={
          singlePayment?.checkOutReference || 
          (singlePayment as any)?.checkoutReference || 
          singlePayment?.paymentReference || 
          singlePayment?.reference || 
          null
        }
      />
    );
  }, [isOpenPaymentBreakdown, singlePayment]);

  // Determine if we should show loading spinner
  // Only show loading spinner on initial load when there's no data
  const shouldShowLoading = isLoading && paymentDetails.length === 0;

  // Handle row click to open payment details
  const handleRowClick = (payment: PaymentItem) => {
    openApproveModal(payment);
  };

  return (
    <section className="border border-primaryGrey rounded-lg overflow-hidden">
      {/* Filters - shown on both mobile and desktop */}
      {topContent}

      {/* Mobile Card Layout */}
      {isMobile ? (
        <div className="divide-y divide-primaryGrey">
          {/* Loading state */}
          {shouldShowLoading && (
            <div className="flex justify-center items-center py-16">
              <SpinnerLoader size="md" />
            </div>
          )}

          {/* Empty state */}
          {!shouldShowLoading && sortedPayments.length === 0 && (
            <div className="flex justify-center items-center py-16 text-textGrey">
              {paymentDetails.length === 0
                ? `No results found`
                : "No payments found"}
            </div>
          )}

          {/* Payment Cards */}
          {!shouldShowLoading &&
            sortedPayments.map((payment: PaymentItem) =>
              renderMobileCard(payment)
            )}

          {/* Infinite Scroll Sentinel & Loading Indicator from usePagination */}
          {bottomContent}
        </div>
      ) : (
        /* Desktop Table Layout */
        <div className="overflow-x-auto">
          <Table
            radius="lg"
            isCompact
            removeWrapper
            aria-label="list of payments"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={classNames}
            selectedKeys={selectedKeys}
            sortDescriptor={sortDescriptor as SortDescriptor}
            topContent={null}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys as (keys: Selection) => void}
            onSortChange={
              setSortDescriptor as (descriptor: SortDescriptor) => void
            }
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              isLoading={shouldShowLoading}
              loadingContent={<SpinnerLoader size="md" />}
              emptyContent={
                paymentDetails.length === 0 ? (
                  `No results found `
                ) : !shouldShowLoading ? (
                  "No payments found"
                ) : (
                  <SpinnerLoader size="md" />
                )
              }
              items={shouldShowLoading ? [] : sortedPayments}
            >
              {(payment: PaymentItem) => (
                <TableRow
                  key={String(payment?.id)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleRowClick(payment)}
                >
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(payment, String(columnKey))}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <ApprovePayment
        refetch={refetch}
        singlePayment={singlePayment}
        isOpen={isOpen}
        toggleApproveModal={closeApproveModal}
      />
      {paymentBreakdownModal}
    </section>
  );
};

export default PaymentsList;