'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '@/hooks/globalProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
  SortDescriptor,
} from '@nextui-org/react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import usePagination from '@/hooks/usePagination';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import moment from 'moment';
import OrderDetailModal, { OrderDetailData } from '@/components/ui/dashboard/orders/OrderDetailModal';
import { getOrderDetailsByCategory } from '@/app/api/controllers/dashboard/orders';

// Type definitions
interface OrderItem {
  orderId: string;
  reference: string;
  placedByPhoneNumber: string;
  placedByName: string;
  tableName: string;
  treatedBy: string | null;
  estimatedCompletionTime: string;
  dateUpdated: string;
  totalPrice: number;
  status: number; // 0 = Active, 1 = Served
}

interface CategoryCount {
  name: string;
  count: number;
  totalAmount: number;
}

interface CategoryOrdersListProps {
  orders: OrderItem[];
  categories: CategoryCount[];
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
}

// Table columns configuration
const columns = [
  { name: 'NAME', uid: 'name', sortable: true },
  { name: 'TABLE', uid: 'tableName', sortable: true },
  { name: 'ORDER ID', uid: 'orderID', sortable: false },
  { name: 'TIME', uid: 'time', sortable: true },
  { name: 'AMOUNT', uid: 'amount', sortable: true },
  { name: 'STATUS', uid: 'status', sortable: true },
  { name: '', uid: 'actions', sortable: false },
];

const INITIAL_VISIBLE_COLUMNS = [
  'name',
  'tableName',
  'orderID',
  'time',
  'amount',
  'status',
  'actions',
];

const CategoryOrdersList: React.FC<CategoryOrdersListProps> = ({
  orders,
  categories,
  searchQuery,
  refetch,
  isLoading = false,
  currentPage: propCurrentPage,
  totalPages: propTotalPages,
  hasNext: propHasNext,
  hasPrevious: propHasPrevious,
  totalCount: propTotalCount
}) => {
  const { setTableStatus, tableStatus, setPage } = useGlobalContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);

  const handleTabClick = (categoryName: string) => {
    setTableStatus(categoryName);
    setPage(1);
  };

  // Filter orders based on search query only
  // Note: Status filtering is already done by the API, no need to filter again client-side
  const orderDetails = React.useMemo(() => {
    if (isLoading || !orders) {
      return [];
    }

    let filteredOrders = orders;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredOrders = filteredOrders.filter((order: OrderItem) =>
        order.placedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.placedByPhoneNumber.includes(searchQuery)
      );
    }

    return filteredOrders;
  }, [orders, searchQuery, isLoading]);

  // Create pagination data structure from props
  // When searching, use client-side pagination based on filtered results
  const isSearchActive = searchQuery.trim().length > 0;
  const paginationData = React.useMemo(() => {
    if (isSearchActive) {
      // When searching, show all filtered results on one page
      return {
        data: orderDetails,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
        totalCount: orderDetails.length
      };
    }

    // Normal server-side pagination
    return {
      data: orderDetails,
      totalPages: propTotalPages,
      currentPage: propCurrentPage,
      hasNext: propHasNext,
      hasPrevious: propHasPrevious,
      totalCount: propTotalCount
    };
  }, [orderDetails, propCurrentPage, propTotalPages, propHasNext, propHasPrevious, propTotalCount, isSearchActive]);

  const {
    setSelectedKeys,
    selectedKeys,
    sortDescriptor,
    setSortDescriptor,
    classNames,
    displayData,
    isMobile,
    bottomContent,
  } = usePagination(
    paginationData,
    columns,
    INITIAL_VISIBLE_COLUMNS
  );

  // Sort the orders based on sortDescriptor
  const sortedOrders = React.useMemo(() => {
    if (!displayData || displayData.length === 0) return displayData;

    return [...displayData].sort((a: OrderItem, b: OrderItem) => {
      const first = a[sortDescriptor.column as keyof OrderItem];
      const second = b[sortDescriptor.column as keyof OrderItem];

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (typeof first === 'string' && typeof second === 'string') {
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

  const [isCategoryEmpty, setIsCategoryEmpty] = useState<boolean>(false);
  const [shouldShowLoading, setShouldShowLoading] = useState<boolean>(false);

  useEffect(() => {
    const foundCategory = categories?.find((c: CategoryCount) => c.name === (tableStatus || categories?.[0]?.name || 'All Orders'));
    const isEmpty = !!(foundCategory && foundCategory?.count === 0);

    const hasData = orderDetails.length > 0;
    const showLoading = !hasData && !isEmpty && isLoading;

    setIsCategoryEmpty(isEmpty);
    setShouldShowLoading(showLoading);
  }, [categories, tableStatus, isLoading, orderDetails]);

  const calculateTimeElapsed = (dateUpdated: string): string => {
    const updatedTime = moment(dateUpdated);
    const now = moment();
    const minutesElapsed = now.diff(updatedTime, 'minutes');
    const hours = Math.floor(minutesElapsed / 60);
    const minutes = minutesElapsed % 60;

    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusChipColor = (status: number) => {
    if (status === 1) {
      return 'border-gray-500 text-gray-700 bg-gray-50';
    }
    return 'border-green-500 text-green-700 bg-green-50';
  };

  const handleOrderClick = async (order: OrderItem) => {
    try {
      const userInformation = getJsonItemFromLocalStorage("userInformation");
      const categoryId = userInformation?.assignedCategoryId;

      if (!categoryId) {
        notify({
          title: "Error",
          text: "Category information not found",
          type: "error",
        });
        return;
      }

      const response = await getOrderDetailsByCategory(categoryId, order.orderId);

      if (!response?.isSuccessful || !response?.data) {
        notify({
          title: "Error",
          text: "Failed to fetch order details",
          type: "error",
        });
        return;
      }

      const modalData: OrderDetailData = {
        id: order.orderId,
        table: order.tableName,
        orderNumber: order.reference,
        servedBy: order.treatedBy || 'Not assigned',
        items: response.data.map((item: any, idx: number) => ({
          id: `${order.orderId}-${idx}`,
          itemName: item.itemName,
          category: item.menuName,
          quantity: item.quantity,
          unitPrice: item.totalPrice / item.quantity,
          totalPrice: item.totalPrice,
          packingCost: item.packingCost || 0,
        })),
        subtotal: 0,
        packingCost: 0,
        tax: 0,
        grandTotal: 0,
      };

      modalData.subtotal = modalData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      modalData.packingCost = modalData.items.reduce((sum, item) => sum + (item.packingCost || 0), 0);
      modalData.grandTotal = modalData.subtotal + modalData.packingCost + modalData.tax;

      setSelectedOrder(modalData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      notify({
        title: "Error",
        text: "Failed to load order details",
        type: "error",
      });
    }
  };

  const renderCell = React.useCallback((order: OrderItem, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div>
            <div className='flex text-black font-medium items-center gap-2 text-sm cursor-pointer'>
              <span>{order.placedByName}</span>
            </div>
            <div className='text-textGrey text-[13px]'>
              {order.placedByPhoneNumber}
            </div>
          </div>
        );
      case 'tableName':
        return <div className='text-textGrey text-sm'>{order.tableName}</div>;
      case 'orderID':
        return <div className='text-textGrey text-sm'>{order.reference}</div>;
      case 'time':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.dateUpdated).format('DD/MM/YYYY hh:mm A')}
          </div>
        );
      case 'amount':
        return (
          <div className='text-textGrey text-sm font-medium'>
            ₦{order.totalPrice.toLocaleString()}
          </div>
        );
      case 'status':
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusChipColor(order.status)}`}>
            {order.status === 1 ? 'Served' : calculateTimeElapsed(order.dateUpdated)}
          </span>
        );
      case 'actions':
        return (
          <div className='relative flex justify-center items-center'>
            <button
              onClick={(e) => e.stopPropagation()}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <HiOutlineDotsVertical className='w-5 h-5' />
            </button>
          </div>
        );
      default:
        return '';
    }
  }, []);

  // Calculate counts for tabs
  const allOrdersCount = categories.find((c: CategoryCount) => c.name === 'All Orders')?.count || 0;
  const activeOrdersCount = categories.find((c: CategoryCount) => c.name === 'Active Orders')?.count || 0;
  const servedOrdersCount = categories.find((c: CategoryCount) => c.name === 'Served Orders')?.count || 0;

  const topContent = React.useMemo(() => {
    return (
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabClick('All Orders')}
          className={`px-6 py-4 font-medium text-sm transition-colors relative ${
            tableStatus === 'All Orders' || !tableStatus
              ? 'text-primaryColor border-b-2 border-primaryColor'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Orders
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
            tableStatus === 'All Orders' || !tableStatus ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {allOrdersCount}
          </span>
        </button>
        <button
          onClick={() => handleTabClick('Active Orders')}
          className={`px-6 py-4 font-medium text-sm transition-colors relative ${
            tableStatus === 'Active Orders'
              ? 'text-primaryColor border-b-2 border-primaryColor'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Orders
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
            tableStatus === 'Active Orders' ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {activeOrdersCount}
          </span>
        </button>
        <button
          onClick={() => handleTabClick('Served Orders')}
          className={`px-6 py-4 font-medium text-sm transition-colors relative ${
            tableStatus === 'Served Orders'
              ? 'text-primaryColor border-b-2 border-primaryColor'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Served Orders
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
            tableStatus === 'Served Orders' ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {servedOrdersCount}
          </span>
        </button>
      </div>
    );
  }, [categories, tableStatus, allOrdersCount, activeOrdersCount, servedOrdersCount]);

  return (
    <section className='border border-primaryGrey rounded-lg overflow-hidden'>
      {/* Tabs - shown on both mobile and desktop */}
      {topContent}

      {/* Mobile Card Layout */}
      {isMobile ? (
        <div className='divide-y divide-primaryGrey'>
          {shouldShowLoading && (
            <div className='flex justify-center items-center py-16'>
              <SpinnerLoader size="md" />
            </div>
          )}

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

          {!shouldShowLoading && sortedOrders.map((order: OrderItem) => (
            <article
              key={order.orderId}
              className='p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors'
              onClick={() => handleOrderClick(order)}
            >
              <div className='grid grid-cols-2 gap-3 mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='font-semibold text-black text-[15px]'>
                      {order.placedByName}
                    </span>
                  </div>
                  <div className='text-textGrey text-[13px]'>
                    {order.placedByPhoneNumber}
                  </div>
                </div>
                <div>
                  <div className='text-[11px] text-textGrey uppercase mb-1'>Amount</div>
                  <div className='text-black font-semibold text-[15px]'>
                    ₦{order.totalPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-[11px] text-textGrey uppercase mb-1'>Table</div>
                  <div className='text-black font-semibold text-[15px]'>
                    {order.tableName}
                  </div>
                </div>
                <div>
                  <div className='text-[11px] text-textGrey uppercase mb-1'>Order ID</div>
                  <div className='text-black text-[13px] truncate'>
                    {order.reference}
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusChipColor(order.status)}`}>
                  {order.status === 1 ? 'Served' : "Active"}
                </span>
                <div className='text-textGrey text-[12px]'>
                  {moment(order.dateUpdated).format('DD/MM/YYYY hh:mm A')}
                </div>
              </div>
            </article>
          ))}

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
            <TableHeader columns={columns}>
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
                  key={String(order?.orderId)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleOrderClick(order)}
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        orderData={selectedOrder}
      />
    </section>
  );
};

export default CategoryOrdersList;
