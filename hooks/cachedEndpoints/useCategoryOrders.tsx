'use client';
import { getCategoryOrders, getCategoryOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";
import { useEffect, useRef } from 'react';

type OrderItem = {
  orderId: string;
  reference: string;
  placedByPhoneNumber: string;
  placedByName: string;
  tableName: string;
  treatedBy: string | null;
  estimatedCompletionTime: string;
  dateUpdated: string;
  totalPrice: number;
  status: number; // Backend returns this field
  detailStatus?: number; // Mapped from status for UI compatibility (0 = Active, 1 = Served, 2 = Cancelled)
};

type CategoryCount = {
  name: string;
  count: number;
  totalAmount: number;
};

// Global cache for category orders
const globalCategoryOrdersCache = new Map<string, {
  items: any,
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number
}>();
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

const useCategoryOrders = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const categoryId = userInformation?.assignedCategoryId;
  const previousPage = useRef(page);

  // Clear cache when page changes to force fresh data
  useEffect(() => {
    if (previousPage.current !== page) {
      const keysToDelete: string[] = [];
      globalCategoryOrdersCache.forEach((_, key) => {
        if (key.includes(`categoryOrders_${tableStatus}_${filterType}`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => globalCategoryOrdersCache.delete(key));
      previousPage.current = page;
    }
  }, [page, tableStatus, filterType]);

  const getAllCategoryOrders = async ({ queryKey }: { queryKey: any }) => {
    const [_key, { categoryId, filterType, startDate, endDate, tableStatus, page, rowsPerPage }] = queryKey;

    if (!categoryId) {
      return { categories: [], details: null };
    }

    // Create cache key
    const cacheKey = `categoryOrders_${tableStatus}_${filterType}_${startDate}_${endDate}_page_${page}`;

    // Check cache first
    const cached = globalCategoryOrdersCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
      if (cached.currentPage === page) {
        return cached.items;
      }
    }

    try {
      // First, get category counts
      const categoriesResponse = await getCategoryOrders(
        categoryId,
        startDate,
        endDate,
        filterType
      );

      if (!categoriesResponse?.data?.orderCategories) {
        return { categories: [], details: null };
      }

      const categories = categoriesResponse?.data.orderCategories;

      if (categories.length === 0) {
        return { categories: [], details: null };
      }

      // Fetch order details for the selected category
      const targetCategory = tableStatus || categories[0]?.name;

      const detailsResponse = await getCategoryOrderDetails(
        categoryId,
        page || 1,
        rowsPerPage || 10,
        startDate,
        endDate,
        filterType,
        targetCategory
      );

      // Debug logging
      console.log('Category Orders API Response:', {
        targetCategory,
        ordersCount: detailsResponse?.data?.orders?.length || 0,
        firstOrderSample: detailsResponse?.data?.orders?.[0]
      });

      // Map 'status' field to 'detailStatus' for compatibility with CategoryOrdersList component
      if (detailsResponse?.data?.orders) {
        detailsResponse.data.orders = detailsResponse.data.orders.map((order: any) => ({
          ...order,
          detailStatus: order.detailStatus !== undefined ? order.detailStatus : order.status
        }));
      }

      const result = {
        categories,
        details: detailsResponse,
      };

      // Calculate pagination info and cache
      const totalCount = detailsResponse?.data?.totalCount || 0;
      const totalPages = detailsResponse?.data?.totalPages || 1;

      globalCategoryOrdersCache.set(cacheKey, {
        items: result,
        timestamp: Date.now(),
        totalPages,
        totalItems: totalCount,
        currentPage: page
      });

      return result;

    } catch (error) {
      console.error('Error loading category orders:', error);
      return { categories: [], details: null };
    }
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<any>({
    queryKey: [
      "categoryOrders",
      { categoryId, filterType, startDate, endDate, tableStatus, page, rowsPerPage },
    ],
    queryFn: getAllCategoryOrders,
    ...fetchQueryConfig(options),
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!categoryId,
    refetchOnMount: true,
  });

  // Function to clear cache for current filters
  const clearCache = () => {
    const keysToDelete: string[] = [];
    globalCategoryOrdersCache.forEach((_, key) => {
      if (key.includes(`categoryOrders_${tableStatus}_${filterType}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalCategoryOrdersCache.delete(key));
  };

  // Function to clear all category orders cache
  const clearAllCache = () => {
    const keysToDelete: string[] = [];
    globalCategoryOrdersCache.forEach((_, key) => {
      if (key.startsWith('categoryOrders_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalCategoryOrdersCache.delete(key));
  };

  return {
    categories: data?.categories || [],
    details: data?.details || null,
    isLoading,
    isError,
    refetch,
    isFetching,
    clearCache,
    clearAllCache,
  };
};

// Export cache utilities for external use
export const categoryOrdersCacheUtils = {
  clearAll: () => {
    const keysToDelete: string[] = [];
    globalCategoryOrdersCache.forEach((_, key) => {
      if (key.startsWith('categoryOrders_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalCategoryOrdersCache.delete(key));
  },
  invalidateStatus: (status: string) => {
    const keysToDelete: string[] = [];
    globalCategoryOrdersCache.forEach((_, key) => {
      if (key.includes(`categoryOrders_${status}_`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalCategoryOrdersCache.delete(key));
  }
};

export default useCategoryOrders;
