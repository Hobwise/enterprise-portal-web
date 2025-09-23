'use client';
import { getOrderCategories, getOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

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
}

interface OrderCategory {
  name: string;
  totalCount: number;
}

const useOrdersPagination = (
  filterType: number,
  startDate?: string,
  endDate?: string
) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['orderCategories', { filterType, startDate, endDate }],
    queryFn: async () => {
      const response = await getOrderCategories(
        businessInformation[0]?.businessId,
        filterType,
        startDate,
        endDate
      );
      return response?.data?.data || [];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories: OrderCategory[] = categoriesData || [];

  // Set first category as default when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Fetch orders for selected category
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    isError: isOrdersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: [
      'orders',
      selectedCategory,
      pagination.currentPage,
      pagination.pageSize,
      filterType,
      startDate,
      endDate
    ],
    queryFn: async () => {
      if (!selectedCategory) return null;

      const response = await getOrderDetails(
        businessInformation[0]?.businessId,
        selectedCategory,
        filterType,
        startDate,
        endDate,
        pagination.currentPage,
        pagination.pageSize
      );
      return response;
    },
    enabled: !!selectedCategory,
    staleTime: 0,
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update pagination state when orders data changes
  useEffect(() => {
    if (ordersData?.data) {
      const serverData = ordersData.data;
      setPagination(prev => ({
        ...prev,
        totalCount: serverData.totalCount || 0,
        totalPages: serverData.totalPages || 1,
        hasNext: serverData.hasNext || false,
        hasPrevious: serverData.hasPrevious || false,
        currentPage: serverData.currentPage || prev.currentPage
      }));
    }
  }, [ordersData]);

  // Extract orders array from response
  const orders: OrderItem[] = ordersData?.data?.payments || [];

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (pagination.hasPrevious) {
      goToPage(pagination.currentPage - 1);
    }
  };

  const changePageSize = (newPageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1 // Reset to first page when changing page size
    }));
  };

  const changeCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page when changing category
    }));
  };

  const refetchAll = () => {
    refetchCategories();
    refetchOrders();
  };

  return {
    // Data
    categories,
    orders,
    selectedCategory,
    pagination,

    // Loading states
    isLoadingCategories,
    isLoadingOrders,
    isLoading: isLoadingCategories || isLoadingOrders,

    // Error states
    isCategoriesError,
    isOrdersError,
    isError: isCategoriesError || isOrdersError,

    // Actions
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    changeCategory,
    refetchAll
  };
};

export default useOrdersPagination;