'use client';

import React, { useState, useEffect } from 'react';

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
  Modal,
  ModalContent,
  Spacer,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
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
import { formatPrice, saveJsonItemToLocalStorage, getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import moment from 'moment';
import { FaCommentDots } from 'react-icons/fa6';
import { LiaTimesSolid } from 'react-icons/lia';
import CancelOrderModal from './cancelOrder';
import Comment from './comment';
import ConfirmOrderModal from './confirmOrder';
import InvoiceModal from './invoice';
import UpdateOrderModal from './UpdateOrderModal';
import CheckoutModal from './place-order/checkoutModal';
import { completeOrder, getOrder } from '@/app/api/controllers/dashboard/orders';
import useOrderDetails from '@/hooks/cachedEndpoints/useOrderDetails';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { HiArrowLongLeft } from 'react-icons/hi2';
import { useQueryClient } from '@tanstack/react-query';

// Type definitions
interface OrderItem {
  quickResponseID: string;
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
  dateUpdated: string;
  comment?: string;
  orderDetails?: { itemID: string; itemName: string; quantity: number; unitPrice: number }[];
}

interface OrderCategory {
  name: string;
  count: number;
  orders: OrderItem[];
}

interface OrdersListProps {
  orders: OrderItem[];
  categories: OrderCategory[];
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  isPending?: boolean;
  filterType?: number;
  startDate?: string;
  endDate?: string;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
}

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "amount",
  "qrReference",
  "orderID",
  "status",
  "dateUpdated",
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

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  categories,
  searchQuery,
  refetch,
  isLoading = false,
  isPending = false,
  currentPage: propCurrentPage,
  totalPages: propTotalPages,
  hasNext: propHasNext,
  hasPrevious: propHasPrevious,
  totalCount: propTotalCount
}) => {

  const router = useRouter();
  const { userRolePermissions, role } = usePermission();
  const queryClient = useQueryClient();
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const [singleOrder, setSingleOrder] = React.useState<OrderItem | null>(null);
  const [isOpenCancelOrder, setIsOpenCancelOrder] =
    React.useState<boolean>(false);
  const [isOpenInvoice, setIsOpenInvoice] = React.useState<boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] =
    React.useState<boolean>(false);
  const [isOpenComment, setIsOpenComment] = React.useState<boolean>(false);
  const [isOpenUpdateOrder, setIsOpenUpdateOrder] = React.useState<boolean>(false);
  const [isOpenCheckoutModal, setIsOpenCheckoutModal] = React.useState<boolean>(false);
  const [checkoutSelectedItems, setCheckoutSelectedItems] = React.useState<any[]>([]);

  // Payment modal states
  const [isOpenPaymentModal, setIsOpenPaymentModal] = React.useState<boolean>(false);
  const [paymentScreen, setPaymentScreen] = React.useState<number>(2);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<number>(0);
  const [paymentReference, setPaymentReference] = React.useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = React.useState<boolean>(false);

  // Payment methods array
  const paymentMethods = [
    { text: "Pay with cash", subText: " Accept payment using cash", id: 0 },
    { text: "Pay with Pos", subText: " Accept payment using Pos", id: 1 },
    { text: "Pay with bank transfer", subText: "Accept payment via bank transfer", id: 2 },
    { text: "Pay Later", subText: "Keep this order open", id: 3 },
  ];

  const {
    setTableStatus,
    tableStatus,
    setPage,
  } = useGlobalContext();

  const handleTabClick = (categoryName: string) => {
    // Close all open modals when switching tabs to prevent state conflicts
    setIsOpenUpdateOrder(false);
    setIsOpenCancelOrder(false);
    setIsOpenInvoice(false);
    setIsOpenConfirmOrder(false);
    setIsOpenComment(false);
    setIsOpenCheckoutModal(false);
    setIsOpenPaymentModal(false);
    setSingleOrder(null);

    setTableStatus(categoryName);
    setPage(1);
  };

  // Filter orders based on category and search query
  const orderDetails = React.useMemo(() => {
    if (isLoading || isPending || !orders) {
      return [];
    }

    let filteredOrders = orders;

    // Filter by status based on category
    const statusFilter = getStatusForCategory(tableStatus || 'All Orders');
    if (statusFilter !== null) {
      filteredOrders = orders.filter((order: OrderItem) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filteredOrders = filteredOrders.filter((order: OrderItem) =>
        order.placedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.reference.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredOrders;
  }, [orders, tableStatus, searchQuery, isLoading, isPending]);

  // Create pagination data structure from props
  const paginationData = React.useMemo(() => {
    return {
      data: orderDetails,
      totalPages: propTotalPages,
      currentPage: propCurrentPage,
      hasNext: propHasNext,
      hasPrevious: propHasPrevious,
      totalCount: propTotalCount
    };
  }, [orderDetails, propCurrentPage, propTotalPages, propHasNext, propHasPrevious, propTotalCount]);

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
  } = usePagination(
    paginationData,
    columns,
    INITIAL_VISIBLE_COLUMNS
  );

  // Sort the orders based on sortDescriptor
  // Use displayData which contains accumulated data on mobile, current page on desktop
  const sortedOrders = React.useMemo(() => {
    if (!displayData || displayData.length === 0) return displayData;

    return [...displayData].sort((a: OrderItem, b: OrderItem) => {
      const first = a[sortDescriptor.column as keyof OrderItem];
      const second = b[sortDescriptor.column as keyof OrderItem];

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (typeof first === 'string' && typeof second === 'string') {
        // Special handling for date strings
        if (sortDescriptor.column === 'dateUpdated') {
          cmp = new Date(first).getTime() - new Date(second).getTime();
        } else {
          cmp = first.localeCompare(second);
        }
      }
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [displayData, sortDescriptor]);

  const toggleCancelModal = (order?: OrderItem) => {
    if (order) {
      setSingleOrder(order);
    }
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
  const toggleUpdateOrderModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenUpdateOrder(true);
  };

  // Payment modal functions
  const togglePaymentModal = (order: OrderItem) => {
    setSingleOrder(order);
    setIsOpenPaymentModal(!isOpenPaymentModal);
    setPaymentScreen(2);
    setPaymentReference('');
    setSelectedPaymentMethod(0);
  };

  const handlePaymentClick = (methodId: number) => {
    if (methodId === 3) {
      // Pay Later - just redirect like checkoutModal does
      router.push("/dashboard/orders");
    } else {
      setSelectedPaymentMethod(methodId);
      setPaymentScreen(3);
    }
  };

  const finalizePayment = async () => {
    if (!singleOrder) return;

    setIsProcessingPayment(true);
    const payload = {
      treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
      treatedById: userInformation?.id,
      paymentMethod: selectedPaymentMethod,
      paymentReference: paymentReference,
      status: 1,
    };

    const data = await completeOrder(payload, singleOrder.id);
    setIsProcessingPayment(false);

    if (data?.data?.isSuccessful) {
      notify({
        title: "Payment made!",
        text: "Payment has been made, awaiting confirmation",
        type: "success",
      });

      // Invalidate all order-related queries to force refetch from backend
      await queryClient.invalidateQueries({
        queryKey: ['orderCategories'],
        refetchType: 'active'
      });
      await queryClient.invalidateQueries({
        queryKey: ['orderDetails'],
        refetchType: 'active'
      });
      await queryClient.invalidateQueries({
        queryKey: ['orders'],
        refetchType: 'active'
      });

      // Force immediate refetch of all active queries
      await queryClient.refetchQueries({
        queryKey: ['orderCategories'],
        type: 'active'
      });
      await queryClient.refetchQueries({
        queryKey: ['orderDetails'],
        type: 'active'
      });
      await queryClient.refetchQueries({
        queryKey: ['orders'],
        type: 'active'
      });

      setIsOpenPaymentModal(false);
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const [value, setValue] = useState('');

  // Category state management
  // const [currentCategory, setCurrentCategory] = useState<OrderCategory | undefined>();
  const [isCategoryEmpty, setIsCategoryEmpty] = useState<boolean>(false);
  const [shouldShowLoading, setShouldShowLoading] = useState<boolean>(false);

  const handleTabChange = (index: string) => {
    setValue(index);
  };

  // useEffect to update category states
  useEffect(() => {
    const foundCategory = categories?.find((c: OrderCategory) => c.name === (tableStatus || categories?.[0]?.name || 'All Orders'));
    const isEmpty = !!(foundCategory && foundCategory?.count === 0);

    // Show loading only if we don't have data and category isn't empty
    const hasData = orderDetails.length > 0;
    const showLoading = !hasData && !isEmpty && isLoading;

    setIsCategoryEmpty(isEmpty);
    setShouldShowLoading(showLoading);
  }, [categories, tableStatus, isLoading, orderDetails]);;

  // Monitor tab changes to ensure modal states are properly managed
  useEffect(() => {
    // When tableStatus changes and there's an open modal, we ensure it's properly reset
    // This is a backup in case handleTabClick doesn't fully reset states
    if (isOpenUpdateOrder || isOpenCancelOrder || isOpenInvoice || isOpenConfirmOrder || isOpenComment) {
      // Modal states should be reset by handleTabClick
    }
  }, [tableStatus, isOpenUpdateOrder, isOpenCancelOrder, isOpenInvoice, isOpenConfirmOrder, isOpenComment]);

  // Prefetch order details on hover for better performance
  const prefetchOrderDetails = (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['orderDetails', orderId],
      queryFn: () => getOrder(orderId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Fetch full order details for CheckoutModal
  const {
    orderDetails: fullOrderDetails,
    isLoading: isLoadingFullOrderDetails
  } = useOrderDetails(singleOrder?.id, {
    enabled: !!singleOrder?.id && isOpenCheckoutModal
  });



  // Transform order data to match CheckoutModal expectations (qrReference -> quickResponseID)
  const transformedOrderDetails = React.useMemo(() => {
    if (!singleOrder) return null;

    // Use full order details if available (includes qrReference)
    const sourceData = fullOrderDetails || singleOrder;


    return {
      ...sourceData,
      quickResponseID: sourceData.qrReference || sourceData.quickResponseID || '',
    };
  }, [singleOrder, fullOrderDetails]);

  // Handle table row click based on order status
  const handleRowClick = (order: OrderItem) => {
    switch (order.status) {
      case 0: // Open orders
      case 3: // Awaiting confirmation
        saveJsonItemToLocalStorage('order', order);
        toggleUpdateOrderModal(order);
        break;
      case 1: // Closed orders
      case 2: // Cancelled orders
        toggleInvoiceModal(order);
        break;
      default:
        break;
    }
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCommentModal(order);
                  }}
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
      case 'dateUpdated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.dateUpdated).format('MMM DD, YYYY h:mm A')}
          </div>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2' onClick={(e) => e.stopPropagation()}>
            <Dropdown
              aria-label='drop down'
              className=''
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  prefetchOrderDetails(order.id);
                }
              }}
            >
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                <DropdownSection>
                  <DropdownItem
                    key="invoice"
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
                    options.includes('Cancel Order') && (
                      <DropdownItem
                        key="cancel"
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

  // Loading states are now managed in useEffect above

  return (
    <section className='border border-primaryGrey rounded-lg overflow-hidden'>
      {/* Filters - shown on both mobile and desktop */}
      {topContent}

      {/* Mobile Card Layout */}
      {isMobile ? (
        <div className='divide-y divide-primaryGrey'>
          {/* Loading state */}
          {shouldShowLoading && (
            <div className='flex justify-center items-center py-16'>
              <SpinnerLoader size="md" />
            </div>
          )}

          {/* Empty state */}
          {!shouldShowLoading && sortedOrders.length === 0 && (
            <div className='flex justify-center items-center py-16 text-textGrey'>
              {orderDetails.length === 0
                ? `No results found`
                : isCategoryEmpty
                  ? 'No orders found'
                  : 'No orders available'
              }
            </div>
          )}

          {/* Order Cards */}
          {!shouldShowLoading && sortedOrders.map((order: OrderItem) => (
            <article
              key={order.id}
              className='p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors'
              onClick={() => handleRowClick(order)}
              onMouseEnter={() => prefetchOrderDetails(order.id)}
            >
              {/* Header: Name + Phone + Comment */}
              <div className='flex items-end justify-end -mb-5 mb-3 mt-2'>
            

                {/* Actions Dropdown */}
                <div className='ml-2' onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    aria-label='order actions'
                    onOpenChange={(isOpen) => {
                      if (isOpen) {
                        prefetchOrderDetails(order.id);
                      }
                    }}
                  >
                    <DropdownTrigger aria-label='actions'>
                      <div className='cursor-pointer flex justify-center items-center text-black p-2 -m-2'>
                        <HiOutlineDotsVertical className='text-[20px]' />
                      </div>
                    </DropdownTrigger>
                    <DropdownMenu className='text-black'>
                      <DropdownSection>
                        <DropdownItem
                          key="invoice"
                          onClick={() => toggleInvoiceModal(order)}
                          aria-label='Generate invoice'
                        >
                          <div className='flex gap-3 items-center text-grey500'>
                            <TbFileInvoice className='text-[18px]' />
                            <p>Generate invoice</p>
                          </div>
                        </DropdownItem>
                        {((role === 0 || userRolePermissions?.canEditOrder === true) &&
                          availableOptions[statusDataMap[order.status]] &&
                          availableOptions[statusDataMap[order.status]].includes('Cancel Order') && (
                            <DropdownItem
                              key="cancel"
                              onClick={() => toggleCancelModal(order)}
                              aria-label='cancel order'
                            >
                              <div className='text-danger-500 flex items-center gap-3'>
                                <LiaTimesSolid />
                                <p>Cancel order</p>
                              </div>
                            </DropdownItem>
                          )) as any}
                      </DropdownSection>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className='grid grid-cols-2 gap-3 mb-3'>
                    <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='font-semibold text-black text-[15px]'>
                      {order.placedByName}
                    </span>
                    {order.comment && (
                      <div
                        title='view comment'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCommentModal(order);
                        }}
                        className='cursor-pointer'
                      >
                        <FaCommentDots className='text-primaryColor text-[14px]' />
                      </div>
                    )}
                  </div>
                  <div className='text-textGrey text-[13px]'>
                    {order.placedByPhoneNumber}
                  </div>
                </div>
                <div>
                  <div className='text-[11px] text-textGrey uppercase mb-1'>Amount</div>
                  <div className='text-black font-semibold text-[15px]'>
                    {formatPrice(order.totalAmount)}
                  </div>
                </div>
                   <div>
                  <div className='text-[11px] text-textGrey uppercase mb-1'>Table Name</div>
                  <div className='text-black font-semibold text-[15px]'>
                    {order.qrReference}
                  </div>
                </div>
                <div>
                  <div className='text-[11px] text-textGrey uppercase mb-1'>Order ID</div>
                  <div className='text-black text-[13px] truncate'>
                    {order.reference}
                  </div>
                </div>
              </div>
 
              {/* Status + Date */}
              <div className='flex items-center justify-between'>
                <Chip
                  className='capitalize'
                  color={statusColorMap[order.status]}
                  size='sm'
                  variant='bordered'
                >
                  {statusDataMap[order.status]}
                </Chip>
                <div className='text-textGrey text-[12px]'>
                  {moment(order.dateUpdated).format('MMM DD, YYYY h:mm A')}
                </div>
              </div>
            </article>
          ))}

          {/* Infinite Scroll Sentinel & Loading Indicator from usePagination */}
          {bottomContent}
        </div>
      ) : (
        /* Desktop Table Layout */
        <div className='overflow-x-auto'>
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
            topContent={null}
            topContentPlacement='outside'
            onSelectionChange={setSelectedKeys as (keys: Selection) => void}
            onSortChange={(descriptor: SortDescriptor) => {
              setSortDescriptor({
                column: String(descriptor.column),
                direction: descriptor.direction as string
              });
            }}
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
            emptyContent={
              orderDetails.length === 0
                ? `No results found for "${searchQuery.trim()}"`
                : !shouldShowLoading && isCategoryEmpty
                  ? 'No orders found'
                  : <SpinnerLoader size="md" />
            }
            items={shouldShowLoading ? [] : (sortedOrders || [])}
            isLoading={shouldShowLoading}
            loadingContent={<SpinnerLoader size="md" />}
          >
            {(order: OrderItem) => (
              <TableRow
                key={String(order?.id)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRowClick(order)}
                onMouseEnter={() => prefetchOrderDetails(order.id)}
              >
                {(columnKey) => (
                  <TableCell>{renderCell(order, String(columnKey))}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      )}
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
        onClose={() => setIsOpenInvoice(false)}
      />
      <UpdateOrderModal
        isOpen={isOpenUpdateOrder}
        onOpenChange={setIsOpenUpdateOrder}
        orderData={singleOrder}
        onOrderUpdated={refetch}
        onProceedToConfirm={(selectedItems) => {
          setCheckoutSelectedItems(selectedItems);
          setIsOpenUpdateOrder(false);
          setIsOpenCheckoutModal(true);
        }}
        onProcessPayment={() => {
          setIsOpenUpdateOrder(false);
          togglePaymentModal(singleOrder!);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isOpenCheckoutModal}
        onOpenChange={() => setIsOpenCheckoutModal(false)}
        selectedItems={checkoutSelectedItems}
        orderDetails={transformedOrderDetails}
        id={singleOrder?.id}
        onOrderSuccess={refetch}
        handleDecrement={(itemId: string) => {
          setCheckoutSelectedItems(prev =>
            prev.map(item =>
              item.id === itemId
                ? { ...item, count: Math.max(1, item.count - 1) }
                : item
            ).filter(item => item.count > 0)
          );
        }}
        handleIncrement={(itemId: string) => {
          setCheckoutSelectedItems(prev =>
            prev.map(item =>
              item.id === itemId
                ? { ...item, count: Math.min(item.count + 1, 999) }
                : item
            )
          );
        }}
        handlePackingCost={(itemId: string, isPacked: boolean) => {
          setCheckoutSelectedItems(prev =>
            prev.map(item =>
              item.id === itemId
                ? { ...item, isPacked }
                : item
            )
          );
        }}
      />

      {/* Payment Modal */}
      <Modal
        isOpen={isOpenPaymentModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsOpenPaymentModal(false);
            setPaymentScreen(2);
            setPaymentReference('');
            setSelectedPaymentMethod(0);
          }
        }}
        size="md"
        hideCloseButton={true}
        isDismissable={false}
      >
        <ModalContent>
          {paymentScreen === 2 && (
            <div className="p-5">
              <div className="flex justify-between mt-3">
                <div>
                  <div className="text-[18px] leading-8 font-semibold">
                    <span className="text-black">Select payment method</span>
                  </div>
                  <p className="text-sm text-primaryColor xl:mb-8 w-full mb-4">
                    {formatPrice(singleOrder?.totalAmount || 0)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-black">
                {paymentMethods.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handlePaymentClick(item.id)}
                    className={`flex cursor-pointer items-center gap-2 p-4 rounded-lg justify-between ${
                      selectedPaymentMethod === item.id ? "bg-[#EAE5FF80]" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{item.text}</p>
                      <p className="text-sm text-grey500">{item.subText}</p>
                    </div>
                    <MdKeyboardArrowRight />
                  </div>
                ))}
              </div>
            </div>
          )}

          {paymentScreen === 3 && (
            <>
              <div
                onClick={() => setPaymentScreen(2)}
                className="p-4 cursor-pointer text-black flex items-center"
              >
                <IoIosArrowRoundBack className="text-2xl" />
                <span className="text-sm">Back</span>
              </div>
              <div className="px-5 pb-5">
                <div>
                  <div className="text-[18px] leading-8 font-semibold">
                    <span className="text-black">Confirm payment</span>
                  </div>
                  <p className="text-sm text-grey500 xl:mb-8 w-full mb-4">
                    confirm that customer has paid for order
                  </p>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-lg justify-between bg-[#EAE5FF80]">
                  <div>
                    <p className="text-sm text-grey500">TOTAL ORDER</p>
                    <p className="font-bold text-black text-[20px]">
                      {formatPrice(singleOrder?.totalAmount || 0)}
                    </p>
                  </div>
                  <MdKeyboardArrowRight />
                </div>
                <Spacer y={4} />
                <CustomInput
                  type="text"
                  value={paymentReference}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentReference(e.target.value)}
                  name="paymentRef"
                  label="Enter ref"
                  placeholder="Provide payment reference"
                />
                <Spacer y={5} />
                <div className="flex md:flex-row flex-col gap-5">
                  <CustomButton
                    onClick={() => setIsOpenPaymentModal(false)}
                    className="bg-white h-[50px] w-full border border-primaryGrey"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    loading={isProcessingPayment}
                    disabled={isProcessingPayment}
                    onClick={finalizePayment}
                    className="text-white w-full h-[50px]"
                    backgroundColor="bg-primaryColor"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <p>Confirm payment</p>
                      <HiArrowLongLeft className="text-[22px] rotate-180" />
                    </div>
                  </CustomButton>
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
};

export default OrdersList;