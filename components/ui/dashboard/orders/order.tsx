'use client';

import React, { useEffect, useState, Fragment } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
  SortDescriptor,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { BsCalendar2Check } from 'react-icons/bs';
import { FaRegEdit } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { TbFileInvoice } from 'react-icons/tb';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import {
  availableOptions,
  columns,
  statusColorMap,
  statusDataMap,
} from './data';
import Filters from './filters';

import usePermission from '@/hooks/cachedEndpoints/usePermission';
import usePagination from '@/hooks/usePagination';
import { formatPrice, saveJsonItemToLocalStorage } from '@/lib/utils';
import moment from 'moment';
import { FaCommentDots } from 'react-icons/fa6';
import { LiaTimesSolid } from 'react-icons/lia';
import CancelOrderModal from './cancelOrder';
import Comment from './comment';
import ConfirmOrderModal from './confirmOrder';
import InvoiceModal from './invoice';

// Type definitions
interface OrderItem {
  id: string;
  placedByName: string;
  placedByPhoneNumber: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  qrReference: string;
  paymentMethod: number;
  paymentReference: string;
  status: 0 | 1 | 2 | 3;
  dateCreated: string;
  comment?: string;
  orderDetails?: { itemID: string; itemName: string; quantity: number; unitPrice: number }[];
}

interface OrderCategory {
  name: string;
  totalCount: number;
  orders: OrderItem[];
}

interface OrdersListProps {
  orders: OrderItem[];
  categories: OrderCategory[];
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  isPending?: boolean;
}

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "amount",
  "qrReference",
  "orderID",
  "status",
  "dateCreated",
  "actions",
];

// Status mapping for categories
const getStatusForCategory = (categoryName: string): number | null => {
  switch (categoryName.toLowerCase()) {
    case 'open orders':
      return 0;
    case 'closed orders':
      return 1;
    case 'cancelled orders':
      return 2;
    case 'awaitingconfirmation orders':
    case 'awaiting confirmation orders':
      return 3;
    case 'all orders':
    default:
      return null; // null means show all orders
  }
};

// Function to get filtered orders based on category and pending state
const getFilteredOrderDetails = (
  orders: any, 
  isLoading: boolean, 
  isPending: boolean, 
  selectedCategory: string,
  searchQuery: string = ''
): OrderItem[] => {
  // Check if data is in pending state
  if (isLoading || isPending || !orders) {
    console.log(isLoading, isPending, orders);
    return [];
  }
  
  // Get the payments array
  const allOrders = orders.payments || [];
  
  // Get the status filter for the selected category
  const statusFilter = getStatusForCategory(selectedCategory);
  
  // Filter by status if not "All Orders"
  let filteredByStatus = allOrders;
  if (statusFilter !== null) {
    filteredByStatus = allOrders.filter((order: OrderItem) => order.status === statusFilter);
  }
  
  // Apply search filter if provided
  if (searchQuery.trim()) {
    filteredByStatus = filteredByStatus.filter((order: OrderItem) =>
      order.placedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.reference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filteredByStatus;
};

const OrdersList: React.FC<OrdersListProps> = ({ 
  orders, 
  categories, 
  searchQuery, 
  refetch, 
  isLoading = false,
  isPending = false 
}) => {

  const router = useRouter();
  const { userRolePermissions, role } = usePermission();
  const [singleOrder, setSingleOrder] = React.useState<OrderItem | null>(null);
  const [isOpenCancelOrder, setIsOpenCancelOrder] =
    React.useState<Boolean>(false);
  const [isOpenInvoice, setIsOpenInvoice] = React.useState<Boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] =
    React.useState<Boolean>(false);
  const [isOpenComment, setIsOpenComment] = React.useState<Boolean>(false);
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());
  const [isFirstTimeLoading, setIsFirstTimeLoading] = useState<boolean>(false);
  

  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
    page,
    rowsPerPage,
    setTableStatus,
    tableStatus,
    setPage,
  } = useGlobalContext();

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
      }, 3000);
    }
    
    setTableStatus(categoryName);
    setPage(1);
  };

  // Use the new filtered function that includes status filtering
  const orderDetails = getFilteredOrderDetails(
    orders, 
    isLoading, 
    isPending, 
    tableStatus || 'All Orders', // Default to "All Orders" if tableStatus is not set
    searchQuery
  );
  


  const matchingObjectArray = orderDetails; // Use filtered orders for pagination
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

  // Sort the orders based on sortDescriptor
  const sortedOrders = React.useMemo(() => {
    if (!orderDetails || orderDetails.length === 0) return orderDetails;
    
    return [...orderDetails].sort((a: OrderItem, b: OrderItem) => {
      const first = a[sortDescriptor.column as keyof OrderItem];
      const second = b[sortDescriptor.column as keyof OrderItem];
      
      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;
      
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [orderDetails, sortDescriptor]);

  const toggleCancelModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenCancelOrder(!isOpenCancelOrder);
  };
  const toggleCommentModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenComment(!isOpenComment);
  };
  const toggleConfirmModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenConfirmOrder(!isOpenConfirmOrder);
  };
  const toggleInvoiceModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenInvoice(!isOpenInvoice);
  };

  const [value, setValue] = useState('');

  const handleTabChange = (index: string) => {
    setValue(index);
  };
      
  const renderCell = React.useCallback((order: OrderItem, columnKey: string) => {
    const cellValue = order[columnKey as keyof OrderItem];
    const options = availableOptions[statusDataMap[order.status]];
    switch (columnKey) {
      case 'name':
        return (
          <div>
            <div className='flex text-black font-medium items-center gap-2 text-sm cursor-pointer'>
              <span>{order.placedByName}</span>
              {order.comment && (
                <div
                  title={'view comment'}
                  onClick={() => toggleCommentModal(order)}
                  className=' cursor-pointer'
                >
                  <FaCommentDots className='text-primaryColor' />
                </div>
              )}
            </div>
            <div className='text-textGrey text-[13px]'>
              {order.placedByPhoneNumber}
            </div>
          </div>
        );
      case 'amount':
        return (
          <div className='text-textGrey text-sm'>
            <p>{formatPrice(order.totalAmount)}</p>
          </div>
        );
      case 'orderID':
        return <div className='text-textGrey text-sm'>{order.reference}</div>;

      case 'status':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap[order.status]}
            size='sm'
            variant='bordered'
          >
            {statusDataMap[cellValue as number]}
          </Chip>
        );
      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2'>
            <Dropdown aria-label='drop down' className=''>
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                <DropdownSection>
                  <DropdownItem
                    onClick={() => toggleInvoiceModal(order)}
                    aria-label='Generate invoice'
                  >
                    <div className={`  flex gap-3  items-center text-grey500`}>
                      <TbFileInvoice className='text-[18px]' />
                      <p>Generate invoice</p>
                    </div>
                  </DropdownItem>

                  {((role === 0 || userRolePermissions?.canEditOrder === true) &&
                    options &&
                    options.includes('Update Order') && (
                      <DropdownItem
                        onClick={() => {
                          router.push('/dashboard/orders/place-order');
                          saveJsonItemToLocalStorage('order', order);
                        }}
                        aria-label='update order'
                      >
                        <div
                          className={` flex gap-3  items-center text-grey500`}
                        >
                          <FaRegEdit />
                          <p>Update order</p>
                        </div>
                      </DropdownItem>
                    )) as any}

                  {((role === 0 || userRolePermissions?.canEditOrder === true) &&
                    options &&
                    options.includes('Checkout') && (
                      <DropdownItem
                        onClick={() => toggleConfirmModal(order)}
                        aria-label='checkout'
                      >
                        <div className={`flex gap-3 items-center text-grey500`}>
                          <BsCalendar2Check />
                          <p>Checkout</p>
                        </div>
                      </DropdownItem>
                    )) as any}
                  {((role === 0 || userRolePermissions?.canEditOrder === true) &&
                    options &&
                    options.includes('Cancel Order') && (
                      <DropdownItem
                        onClick={() => toggleCancelModal(order)}
                        aria-label='cancel order'
                      >
                        <div
                          className={` text-danger-500 flex  items-center gap-3 `}
                        >
                          <LiaTimesSolid />

                          <p>Cancel order</p>
                        </div>
                      </DropdownItem>
                    )) as any}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue ? String(cellValue) : '';
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <Filters
        orders={categories}
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
  const shouldShowLoading = isFirstTimeLoading || isPending || (isLoading && !loadedCategories.has(tableStatus));

  return (
    <section className='border border-primaryGrey rounded-lg'>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        aria-label='list of orders'
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
          emptyContent={'No orders found'} 
          items={shouldShowLoading ? [] : sortedOrders}
          isLoading={shouldShowLoading}
          loadingContent={<SpinnerLoader size="md" />}
        >
          {(order: OrderItem) => (
            <TableRow key={String(order?.id)}>
              {(columnKey) => (
                <TableCell>{renderCell(order, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Comment
        toggleCommentModal={toggleCommentModal}
        singleOrder={singleOrder}
        isOpenComment={isOpenComment}
      />
      <CancelOrderModal
        refetch={refetch}
        singleOrder={singleOrder}
        isOpenCancelOrder={isOpenCancelOrder}
        toggleCancelModal={toggleCancelModal}
      />
      <ConfirmOrderModal
        refetch={refetch}
        singleOrder={singleOrder}
        isOpenConfirmOrder={isOpenConfirmOrder}
        toggleConfirmModal={toggleConfirmModal}
      />
      <InvoiceModal
        singleOrder={singleOrder}
        isOpenInvoice={isOpenInvoice}
        toggleInvoiceModal={toggleInvoiceModal}
      />
    </section>
  );
};

export default OrdersList;