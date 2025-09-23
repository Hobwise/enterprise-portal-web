'use client';
import { getOrderCategories, getOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";
import { useEffect, useRef } from 'react';

type OrderItem = {
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
};

type OrderCategory = {
  name: string;
  totalCount: number;
  orders: OrderItem[];
};

// Global cache for orders data to persist across status/page switches
const globalOrdersCache = new Map<string, {
  items: any,
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number
}>();
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes


const useOrder = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const previousPage = useRef(page);

  // Clear cache when page changes to force fresh data
  useEffect(() => {
    if (previousPage.current !== page) {
      // Clear cache for all pages of current status when page changes
      const keysToDelete: string[] = [];
      globalOrdersCache.forEach((_, key) => {
        if (key.includes(`orders_${tableStatus}_${filterType}`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => globalOrdersCache.delete(key));
      previousPage.current = page;
    }
  }, [page, tableStatus, filterType]);

  const getAllOrders = async ({ queryKey }: { queryKey: any }) => {
    const [_key, { page, rowsPerPage, tableStatus, filterType, startDate, endDate }] = queryKey;

    // Create cache key
    const cacheKey = `orders_${tableStatus}_${filterType}_${startDate}_${endDate}_page_${page}`;

    // Check cache first - but skip cache for pagination to ensure fresh data
    const cached = globalOrdersCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
      // Only use cache if it's for the exact same page request
      // This prevents stale data when navigating between pages
      if (cached.currentPage === page) {
        return cached.items;
      }
    }

    try {
      // First, get order categories with updated counts for the date range
      const categoriesResponse = await getOrderCategories(
        businessInformation[0]?.businessId,
        filterType,
        startDate,
        endDate
      );

      if (!categoriesResponse?.data?.orderCategories) {
        return { categories: [], details: [] };
      }

      const categories = categoriesResponse?.data.orderCategories;

      if (categories.length === 0) {
        return { categories: [], details: [] };
      }



      // Fetch details for the selected category or first category
      const targetCategory = tableStatus || categories[0]?.name;


      const detailsItems = await getOrderDetails(
        businessInformation[0]?.businessId,
        targetCategory,
        filterType,
        startDate,
        endDate,
        page,
        rowsPerPage
      );

      const result = {
        categories,
        details: detailsItems,
      };

      // Calculate pagination info and cache
      const totalCount = detailsItems?.totalCount || detailsItems?.length || 0;
      const totalPages = Math.ceil(totalCount / rowsPerPage);

      globalOrdersCache.set(cacheKey, {
        items: result,
        timestamp: Date.now(),
        totalPages,
        totalItems: totalCount,
        currentPage: page
      });

      return result;

    } catch (error) {
      console.error('Error loading orders:', error);
      return { categories: [], details: [] };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      "orders",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    queryFn: getAllOrders,

      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      staleTime: 0, // Always consider data stale to ensure refetch on page/date changes
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes
      enabled: options?.enabled !== false,

  });


  

  // Function to clear cache for current filters
  const clearCache = () => {
    const keysToDelete: string[] = [];
    globalOrdersCache.forEach((_, key) => {
      if (key.includes(`orders_${tableStatus}_${filterType}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalOrdersCache.delete(key));
  };

  // Function to clear all orders cache
  const clearAllCache = () => {
    const keysToDelete: string[] = [];
    globalOrdersCache.forEach((_, key) => {
      if (key.startsWith('orders_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalOrdersCache.delete(key));
  };

  return {
    categories: data?.categories || [],
    details: data?.details || [],
    isLoading,
    isError,
    refetch,
    clearCache,
    clearAllCache,
  };
};

// Export cache utilities for external use
export const ordersCacheUtils = {
  clearAll: () => {
    const keysToDelete: string[] = [];
    globalOrdersCache.forEach((_, key) => {
      if (key.startsWith('orders_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalOrdersCache.delete(key));
  },
  invalidateStatus: (status: string) => {
    const keysToDelete: string[] = [];
    globalOrdersCache.forEach((_, key) => {
      if (key.includes(`orders_${status}_`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalOrdersCache.delete(key));
  }
};

export default useOrder;