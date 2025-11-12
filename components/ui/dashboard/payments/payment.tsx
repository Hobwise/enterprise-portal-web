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
  searchQuery: string = ''
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
    return allPayments.filter((payment: PaymentItem) =>
      payment.qrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.treatedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer?.toLowerCase().includes(searchQuery.toLowerCase())
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
  totalCount
}) => {
  const [singlePayment, setSinglePayment] = React.useState<PaymentItem | null>(null);
  const [isOpen, setIsOpen] = React.useState<Boolean>(false);
  const { page, rowsPerPage, setTableStatus, tableStatus, setPage } =
    useGlobalContext();

  // Use the payments prop directly - API already returns category-specific data
  const paymentDetails = getFilteredPaymentDetails(
    payments,
    isLoading,
    isPending || false,
    searchQuery
  );

  // State for table sorting and selection
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: 'dateCreated',
    direction: 'descending',
  });

  // Filter visible columns
  const headerColumns = React.useMemo(() => {
    return columns.filter((column) =>
      INITIAL_VISIBLE_COLUMNS.includes(column.uid)
    );
  }, []);

  // Sort the payments based on sortDescriptor
  const sortedPayments = React.useMemo(() => {
    if (!paymentDetails || paymentDetails.length === 0) return paymentDetails;

    return [...paymentDetails].sort((a: PaymentItem, b: PaymentItem) => {
      const first = a[sortDescriptor.column as keyof PaymentItem];
      const second = b[sortDescriptor.column as keyof PaymentItem];

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paymentDetails, sortDescriptor]);


  const toggleApproveModal = (payment: PaymentItem) => {
    setSinglePayment(payment);
    setIsOpen(!isOpen);
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
          <div className='relative flexjustify-center items-center gap-2' onClick={(e) => e.stopPropagation()}>
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
        tableStatus={tableStatus}
        handleTabClick={handleTabClick}
      />
    );
  }, [categories, tableStatus]);

  // Determine if we should show loading spinner
  // Only show loading spinner on initial load when there's no data
  const shouldShowLoading = isLoading && paymentDetails.length === 0;

  // Table styling - matching order table
  const classNames = React.useMemo(
    () => ({
      wrapper: ['max-h-[382px]'],
      th: [
        'text-default-500',
        'text-sm',
        'border-b',
        'border-divider',
        'py-4',
        'rounded-none',
        'bg-grey300',
      ],
      tr: 'border-b border-divider rounded-none',
      td: [
        'py-3',
        'text-textGrey',
        'group-data-[first=true]:first:before:rounded-none',
        'group-data-[first=true]:last:before:rounded-none',
        'group-data-[middle=true]:before:rounded-none',
        'group-data-[last=true]:first:before:rounded-none',
        'group-data-[last=true]:last:before:rounded-none',
      ],
    }),
    []
  );

  // Handle row click to open payment details
  const handleRowClick = (payment: PaymentItem) => {
    toggleApproveModal(payment);
  };

  return (
    <section className='border border-primaryGrey rounded-lg overflow-hidden'>
      <div className='overflow-x-auto'>
        <Table
          radius='lg'
          isCompact
          removeWrapper
          aria-label='list of payments'
          bottomContentPlacement='outside'
          classNames={classNames}
          selectedKeys={selectedKeys}
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
              <TableRow
                key={String(payment?.id)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRowClick(payment)}
              >
                {(columnKey) => (
                  <TableCell>{renderCell(payment, String(columnKey))}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
