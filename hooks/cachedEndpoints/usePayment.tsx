'use client';
import { getPaymentByBusiness, getPaymentDetails } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

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

// Global cache for payments data to persist across status/page switches
const globalPaymentsCache = new Map<string, {
  items: any,
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number
}>();
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

const usePayment = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllPayments = async ({ queryKey }: { queryKey: any }) => {
    const [
      _key,
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ] = queryKey;

    // Create cache key
    const cacheKey = `payments_${tableStatus}_${filterType}_${startDate}_${endDate}_page_${page}`;

    // Check cache first
    const cached = globalPaymentsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
      return cached.items;
    }

    try {
      // Fetch payment categories
      const categoriesResponse = await getPaymentByBusiness(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        tableStatus,
        filterType,
        startDate,
        endDate
      );
      const categories = categoriesResponse?.data|| [];
      const detail = categoriesResponse?.data.data.paymentCategories|| [];


      if (categories.length === 0) {
        return { categories: [], details: [] };
      }
      // Fetch details for the selected category or first category
      const targetCategory = tableStatus || detail[0]?.name;
      const detailsItems = await getPaymentDetails(
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

      globalPaymentsCache.set(cacheKey, {
        items: result,
        timestamp: Date.now(),
        totalPages,
        totalItems: totalCount,
        currentPage: page
      });

      return result;
    } catch (error) {
      return { categories: [], details: [] };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      "payments",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    queryFn: getAllPayments,
    
      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      staleTime: 0,
      enabled: options?.enabled !== false,
    
  });

  // Function to clear cache for current filters
  const clearCache = () => {
    const keysToDelete: string[] = [];
    globalPaymentsCache.forEach((_, key) => {
      if (key.includes(`payments_${tableStatus}_${filterType}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalPaymentsCache.delete(key));
  };

  // Function to clear all payments cache
  const clearAllCache = () => {
    const keysToDelete: string[] = [];
    globalPaymentsCache.forEach((_, key) => {
      if (key.startsWith('payments_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalPaymentsCache.delete(key));
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
export const paymentsCacheUtils = {
  clearAll: () => {
    const keysToDelete: string[] = [];
    globalPaymentsCache.forEach((_, key) => {
      if (key.startsWith('payments_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalPaymentsCache.delete(key));
  },
  invalidateStatus: (status: string) => {
    const keysToDelete: string[] = [];
    globalPaymentsCache.forEach((_, key) => {
      if (key.includes(`payments_${status}_`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalPaymentsCache.delete(key));
  }
};

export default usePayment;