'use client';
import { getOrderCategories, getOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isNetworkOnline } from '@/lib/connectivity';
import { PersistentCache } from '@/lib/persistentCache';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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

// Orders grouped by status/filter/page. Persisted so the rows a user was
// looking at survive a reload — offline that is the difference between their
// last view and an error banner. The library scopes the stored bucket by
// business id, so switching business never surfaces another one's orders.
type CachedOrdersPage = {
  items: any,
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number
};
const globalOrdersCache = new PersistentCache<CachedOrdersPage>('orders', {
  maxEntries: 40,
});
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
    if (cached) {
      const isFresh = Date.now() - cached.timestamp < CACHE_EXPIRY_TIME;
      // Only use a cache entry for the exact same page request (so pagination
      // stays honest). Offline an expired entry is still the best answer: the
      // rows this sub-tab showed earlier beat a request that cannot succeed —
      // networkMode 'offlineFirst' runs this function once even with no
      // connection, which is where this branch matters.
      if ((isFresh || !isNetworkOnline()) && cached.currentPage === page) {
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
        return { categories: [], details: [], salesSummary: null };
      }

      const categories = categoriesResponse?.data.orderCategories;
      const salesSummary = categoriesResponse?.data?.salesSummary || null;

      if (categories.length === 0) {
        return { categories: [], details: [], salesSummary };
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
        salesSummary,
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
      // The controller already rethrows network-level failures (offline, DNS,
      // timeout). Let them reach React Query so the page surfaces a retry /
      // stale-data banner instead of a silent "No orders found". Same-page data
      // stays visible via placeholderData + React Query's retained cache, and
      // previously-visited pages are still served by the Map cache above.
      throw error;
    }
  };

  const { data, isLoading, isError, refetch, dataUpdatedAt, isFetching } = useQuery<any>({
    queryKey: [
      "orders",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    queryFn: getAllOrders,

      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30s — keeps lists near-live without refetch-on-every-mount churn
      placeholderData: keepPreviousData, // keep the current rows visible while a refresh runs
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
    salesSummary: data?.salesSummary || null,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
    isFetching,
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