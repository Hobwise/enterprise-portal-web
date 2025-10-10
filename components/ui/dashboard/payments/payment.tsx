'use client';

import React, { useEffect, useState } from 'react';

import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
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
} from '@nextui-org/react';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import { HiOutlineDotsVertical } from 'react-icons/hi';

import { GrFormView } from 'react-icons/gr';
import { columns, statusColorMap, statusDataMap } from './data';

import moment from 'moment';

import { useGlobalContext } from '@/hooks/globalProvider';
import useAllPaymentsData from '@/hooks/cachedEndpoints/useAllPaymentsData';
import usePagination from '@/hooks/usePagination';
import { formatPrice } from '@/lib/utils';
import ApprovePayment from './approvePayment';
import Filters from './filters';

const INITIAL_VISIBLE_COLUMNS = [
  'totalAmount',
  'qrName',
  'reference',
  'treatedBy',
  'dateCreated',
  'customer',
  'status',
  'actions',
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
}

interface PaymentCategory {
  name: string;
  totalCount: number;
  payments: PaymentItem[];
}

interface PaymentsListProps {
  payments: PaymentItem[] | { payments?: PaymentItem[]; data?: PaymentItem[] } | any;
  categories: PaymentCategory[];
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  isPending?: boolean;
  filterType?: number;
  startDate?: string;
  endDate?: string;
}

// Status mapping for payment categories
const getStatusForPaymentCategory = (categoryName: string): number | null => {
  switch (categoryName.toLowerCase()) {
    case 'pending payments':
      return 0;
    case 'confirmed payments':
      return 1;
    case 'cancelled payments':
      return 2;
    case 'awaiting confirmation':
      return 3;
    default:
      return null; // null means show all payments
  }
};

// Function to get filtered payments based on category and pending state
const getFilteredPaymentDetails = (
  payments: any, 
  isLoading: boolean, 
  isPending: boolean, 
  selectedCategory: string,
  searchQuery: string = ''
): PaymentItem[] => {
  // Check if data is in pending state
  if (isLoading || isPending || !payments) {
    return [];
  }
  
  // If payments has totalCount of 0, return empty array immediately
  if (payments?.totalCount === 0) {
    return [];
  }
  
  // Extract payments data - ensure it's always a valid array
  let allPayments: PaymentItem[] = [];
  if (payments.payments && Array.isArray(payments.payments)) {
    allPayments = payments.payments;
  } else if (payments.data && Array.isArray(payments.data)) {
    allPayments = payments.data;
  } else if (Array.isArray(payments)) {
    allPayments = payments;
  } else {
    // Fallback to empty array if no valid data found
    allPayments = [];
  }

  // Safety check - ensure allPayments is valid array before filtering
  if (!Array.isArray(allPayments)) {
    return [];
  }
  
  // Get the status filter for the selected category
  const statusFilter = getStatusForPaymentCategory(selectedCategory);
  
  // Filter by status if not "All Payments"
  let filteredByStatus = allPayments;
  if (statusFilter !== null && Array.isArray(allPayments)) {
    filteredByStatus = allPayments.filter((payment: PaymentItem) => payment.status === statusFilter);
  }
  
  // Apply search filter if provided
  if (searchQuery.trim() && Array.isArray(filteredByStatus)) {
    filteredByStatus = filteredByStatus.filter((payment: PaymentItem) =>
      payment.qrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.treatedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filteredByStatus;
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
  endDate
}) => {
  const [singlePayment, setSinglePayment] = React.useState<PaymentItem | null>(null);
  const [isOpen, setIsOpen] = React.useState<Boolean>(false);
  const { page, rowsPerPage, setTableStatus, tableStatus, setPage } =
    useGlobalContext();

  // Use the new hook for fetching all data
  const { 
    getCategoryDetails, 
    isLoadingInitial, 
    isLoadingAll 
  } = useAllPaymentsData(filterType, startDate, endDate, 1, 10);

  // Get data for current category from the new hook
  const currentCategoryData = getCategoryDetails(tableStatus || categories?.[0]?.name || 'All');
  
  // Use the new filtered function that includes status filtering
  const paymentDetails = getFilteredPaymentDetails(
    currentCategoryData || payments, 
    isLoading || isLoadingInitial, 
    isPending || false, 
    tableStatus || 'All', 
    searchQuery
  );

  const matchingObjectArray = { data: paymentDetails, totalCount: paymentDetails.length };
  

  const {
    bottomContent,
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
  } = usePagination(
    matchingObjectArray,
    columns,
    INITIAL_VISIBLE_COLUMNS
  );

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


  const toggleApproveModal = (payment: PaymentItem) => {
    setSinglePayment(payment);
    setIsOpen(!isOpen);
  };

  const [value, setValue] = useState('');

  const handleTabChange = (index: string) => {
    setValue(index);
  };

  const handleTabClick = (categoryName: string) => {
    setTableStatus(categoryName);
    setPage(1);
  };

  const renderCell = React.useCallback((payment: PaymentItem, columnKey: string) => {
    const cellValue = payment[columnKey as keyof PaymentItem];

    switch (columnKey) {
      case 'totalAmount':
        return (
          <div className='font-medium text-black text-sm'>
            <p>{formatPrice(payment.totalAmount)}</p>
          </div>
        );
      case 'qrName':
        return (
          <div className='flex text-textGrey text-sm'>{payment.qrName}</div>
        );
      case 'reference':
        return <div className='text-textGrey text-sm'>{payment.reference}</div>;
      case 'treatedBy':
        return <div className='text-textGrey text-sm'>{payment.treatedBy}</div>;
      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(payment.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );
      case 'customer':
        return <div className='text-textGrey text-sm'>{payment.customer}</div>;
      case 'status':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap[payment.status]}
            size='sm'
            variant='bordered'
          >
            {statusDataMap[payment.status]}
          </Chip>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2'>
            <Dropdown className=''>
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label='Approve payment' className='text-black'>
                <DropdownItem
                  onClick={() => {
                    toggleApproveModal(payment);
                  }}
                  aria-label='update order'
                >
                  <div className={` flex gap-2  items-center text-grey500`}>
                    <GrFormView className='text-[20px]' />
                    <p>View more</p>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <Filters
        payments={categories}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
      />
    );
  }, [
    categories,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    hasSearchFilter,
    handleTabChange,
    value,
    handleTabClick,
  ]);

  // Determine if we should show loading spinner
  // Determine if we should show loading spinner - only show for initial load
  const shouldShowLoading = isLoadingInitial && paymentDetails.length === 0;

  return (
    <section className='border border-primaryGrey rounded-lg'>
        <Table
          radius='lg'
          isCompact
          removeWrapper
          aria-label='list of payments'
          bottomContent={bottomContent}
          bottomContentPlacement='outside'
          classNames={classNames}
          selectedKeys={selectedKeys}
          // selectionMode='multiple'
          sortDescriptor={sortDescriptor as SortDescriptor}
          topContent={topContent}
          topContentPlacement='outside'
          onSelectionChange={setSelectedKeys as (keys: Selection) => void}
          onSortChange={setSortDescriptor as (descriptor: SortDescriptor) => void}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === 'actions' ? 'center' : 'start'}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            isLoading={shouldShowLoading}
            loadingContent={<SpinnerLoader size="md" />}
            emptyContent={'No payment(s) found'}
            items={shouldShowLoading ? [] : sortedPayments}
          >
            {(payment: PaymentItem) => (
              <TableRow key={String(payment?.id)}>
                {(columnKey) => (
                  <TableCell>{renderCell(payment, String(columnKey))}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ApprovePayment
          refetch={refetch}
          singlePayment={singlePayment}
          isOpen={isOpen}
          toggleApproveModal={toggleApproveModal}
        />
    </section>
  );
};

export default PaymentsList;
