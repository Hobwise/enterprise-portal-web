'use client';
import { getPaymentByBusiness, getPaymentDetails } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

const usePayment = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const queryClient = useQueryClient();

  const getAllPayments = async ({ queryKey }: { queryKey: any }) => {
    const [
      _key,
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ] = queryKey;

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

      return result;
    } catch (error) {
      return { categories: [], details: [] };
    }
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<any>({
    queryKey: [
      "payments",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    queryFn: getAllPayments,

      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      enabled: options?.enabled !== false,

  });

  // Function to invalidate cache for current filters using React Query
  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: ["payments"],
      predicate: (query) => {
        const queryKey = query.queryKey as any[];
        return queryKey[0] === "payments" &&
               queryKey[1]?.tableStatus === tableStatus &&
               queryKey[1]?.filterType === filterType;
      }
    });
  };

  // Function to invalidate all payments cache using React Query
  const clearAllCache = () => {
    queryClient.invalidateQueries({
      queryKey: ["payments"]
    });
  };

  return {
    categories: data?.categories || [],
    details: data?.details || [],
    isLoading,
    isFetching,
    isError,
    refetch,
    clearCache,
    clearAllCache,
  };
};

// Export cache utilities for external use with React Query
export const paymentsCacheUtils = {
  clearAll: (queryClient: any) => {
    queryClient.invalidateQueries({
      queryKey: ["payments"]
    });
  },
  invalidateStatus: (queryClient: any, status: string) => {
    queryClient.invalidateQueries({
      queryKey: ["payments"],
      predicate: (query: any) => {
        const queryKey = query.queryKey as any[];
        return queryKey[0] === "payments" && queryKey[1]?.tableStatus === status;
      }
    });
  }
};

export default usePayment;