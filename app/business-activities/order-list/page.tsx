"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/dashboard/header';
import CustomPagination from '@/components/ui/dashboard/orders/CustomPagination';
import OrderDetailModal, { OrderDetailData } from '@/components/ui/dashboard/orders/OrderDetailModal';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import moment from 'moment';
import { Spinner } from '@nextui-org/react';
import useDateFilter from '@/hooks/useDateFilter';
import useCategoryOrders from '@/hooks/cachedEndpoints/useCategoryOrders';
import DateRangeDisplay from '@/components/ui/dashboard/DateRangeDisplay';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';
import Error from '@/components/error';

// Types
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

interface OrderResponse {
  data: {
    orders: OrderItem[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  isSuccessful: boolean;
  error: any;
}

interface CategoryResponse {
  data: {
    categoryCount: number;
    orderCategories: CategoryCount[];
  };
  isSuccessful: boolean;
  error: any;
}

type OrderTab = 'all' | 'active' | 'served';

export default function OrderListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const pageSize = 10;

  // Map tab to orderStatus filter
  const getOrderStatus = () => {
    if (activeTab === 'active') return 'Active Orders';
    if (activeTab === 'served') return 'Served Orders';
    return undefined;
  };

  // Use date filter hook
  const {
    categories: categoryCounts,
    details,
    isLoading,
    isError,
    refetch,
    dropdownComponent,
    datePickerModal,
    filterType,
    startDate,
    endDate,
  } = useDateFilter((filterType: number, startDate?: string, endDate?: string, options?: any) =>
    useCategoryOrders(
      filterType,
      startDate,
      endDate,
      getOrderStatus(),
      currentPage,
      pageSize,
      options
    )
  );

  // Refetch when tab or page changes
  useEffect(() => {
    refetch();
  }, [activeTab, currentPage, refetch]);

  // Extract orders and pagination from details
  const orders = details?.data?.orders || [];
  const totalPages = details?.data?.totalPages || 1;
  const totalCount = details?.data?.totalCount || 0;
  const hasNext = details?.data?.hasNext || false;
  const hasPrevious = details?.data?.hasPrevious || false;

  // Calculate counts for tabs
  const allOrdersCount = categoryCounts.find((c: CategoryCount) => c.name === 'All Orders')?.count || 0;
  const activeOrdersCount = categoryCounts.find((c: CategoryCount) => c.name === 'Active Orders')?.count || 0;
  const servedOrdersCount = categoryCounts.find((c: CategoryCount) => c.name === 'Served Orders')?.count || 0;

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusText = (status: number): string => {
    return status === 0 ? 'Active' : 'Served';
  };

  const getStatusChipColor = (status: number) => {
    // 0 = Active (green/warning based on time), 1 = Served (gray)
    if (status === 1) {
      return 'border-gray-500 text-gray-700 bg-gray-50';
    }
    return 'border-green-500 text-green-700 bg-green-50';
  };

  const calculateTimeElapsed = (dateUpdated: string): string => {
    const updatedTime = moment(dateUpdated);
    const now = moment();
    const minutesElapsed = now.diff(updatedTime, 'minutes');
    const hours = Math.floor(minutesElapsed / 60);
    const minutes = minutesElapsed % 60;

    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')}`;
  };

  const handleOrderClick = (order: OrderItem) => {
    // Convert order data to modal format - using table data as per user request
    const modalData: OrderDetailData = {
      id: order.orderId,
      table: order.tableName,
      orderNumber: order.reference,
      servedBy: order.treatedBy || 'Not assigned',
      items: [], // Empty as we're not fetching full details
      subtotal: order.totalPrice,
      packingCost: 0,
      tax: 0,
      grandTotal: order.totalPrice,
    };

    setSelectedOrder(modalData);
    setIsModalOpen(true);
  };

  // Show loading during initial load
  if (isLoading && categoryCounts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ispos />
        <CustomLoading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ispos />
        <Error onClick={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header ispos />

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 xl:mb-8 items-start md:items-center justify-between w-full">
          <div>
            <h1 className="text-[24px] leading-8 font-semibold text-gray-900">Order List</h1>
            <p className="text-sm text-grey600 xl:w-[231px] w-full">View and manage all orders.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {dropdownComponent}
            <button
              onClick={() => router.push('/business-activities')}
              className="px-4 py-2 border border-primaryColor text-primaryColor rounded-lg hover:bg-pink200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Activities
            </button>
            <button className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors flex items-center gap-2">
              Active Orders
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        <DateRangeDisplay
          startDate={startDate}
          endDate={endDate}
          filterType={filterType}
        />

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'all'
                  ? 'text-primaryColor border-b-2 border-primaryColor'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Orders
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'all' ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {allOrdersCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'active'
                  ? 'text-primaryColor border-b-2 border-primaryColor'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Orders
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'active' ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {activeOrdersCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('served')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'served'
                  ? 'text-primaryColor border-b-2 border-primaryColor'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Served Orders
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'served' ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {servedOrdersCount}
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading && orders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No orders found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: OrderItem) => (
                    <tr
                      key={order.orderId}
                      onClick={() => handleOrderClick(order)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{order.placedByName}</span>
                          <span className="text-xs text-gray-500">{order.placedByPhoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.tableName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(order.dateUpdated).format('DD/MM/YYYY hh:mm A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{order.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusChipColor(order.status)}`}>
                          {order.status === 1 ? 'Served' : calculateTimeElapsed(order.dateUpdated)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <HiOutlineDotsVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        orderData={selectedOrder}
      />

      {/* Date Picker Modal */}
      {datePickerModal}
    </div>
  );
}
