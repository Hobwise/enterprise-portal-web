'use client';
import { getOrder } from '@/app/api/controllers/dashboard/orders';
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from "@/lib/queryConfig";

/**
 * Custom hook to fetch and cache order details
 * Provides caching and background refresh for order data used in Invoice and UpdateOrderModal
 */
const useOrderDetails = (
  orderId: string,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: () => getOrder(orderId),
    ...fetchQueryConfig(options),
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    enabled: !!orderId && options?.enabled !== false,
  });

  return {
    orderDetails: data?.data?.data || null,
    isLoading,
    isError,
    isSuccessful: data?.data?.isSuccessful || false,
    error: data?.data?.error || null,
    refetch,
  };
};

export default useOrderDetails;