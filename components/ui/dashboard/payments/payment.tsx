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
  payments: PaymentItem[];
  categories: PaymentCategory[];
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
}

const PaymentsList: React.FC<PaymentsListProps> = ({
  payments,
  categories,
  searchQuery,
  refetch,
  isLoading = false,
}) => {
  const [singlePayment, setSinglePayment] = React.useState<PaymentItem | null>(null);
  const [isOpen, setIsOpen] = React.useState<Boolean>(false);
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());
  const [isFirstTimeLoading, setIsFirstTimeLoading] = useState<boolean>(false);

  const { page, rowsPerPage, setTableStatus, tableStatus, setPage } =
    useGlobalContext();

  const paymentDetails = payments.payments;

  const matchingObjectArray = paymentDetails;
  

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
  } = usePagination(
    matchingObjectArray, 
    columns, 
    INITIAL_VISIBLE_COLUMNS
  );


  const toggleApproveModal = (payment: PaymentItem) => {
    setSinglePayment(payment);
    setIsOpen(!isOpen);
  };

  const [value, setValue] = useState('');

  const handleTabChange = (index: string) => {
    setValue(index);
  };

  const handleTabClick = (categoryName: string) => {
    // Check if this category has been loaded before
    const isFirstTime = !loadedCategories.has(categoryName);
    
    // Only show loading state for first-time loads
    if (isFirstTime) {
      setIsFirstTimeLoading(true);
      setLoadedCategories(prev => new Set([...prev, categoryName]));
      
      // Stop loading state after 2 seconds for first-time loads only
      setTimeout(() => {
        setIsFirstTimeLoading(false);
      }, 2000);
    }
    
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
  const shouldShowLoading = isFirstTimeLoading || (isLoading && !loadedCategories.has(tableStatus));

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
                allowsSorting={true}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            isLoading={shouldShowLoading}
            loadingContent={<SpinnerLoader size="md" />}
            emptyContent={'No payment(s) found'}
            items={shouldShowLoading ? [] : (Array.isArray(paymentDetails) ? paymentDetails : [])}
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
