'use client';
import { getOrder } from '@/app/api/controllers/dashboard/orders';
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from "@/lib/queryConfig";

/**
 * Custom hook to fetch and cache order details
 * Provides caching and background refresh for order data used in Invoice and UpdateOrderModal
 */
const useOrderDetails = (
  orderId: string | undefined,
  options?: { enabled?: boolean }
) => {
  // Validate orderId to prevent invalid API calls
  const isValidOrderId = orderId && typeof orderId === 'string' && orderId.trim().length > 0;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: () => {
      if (!isValidOrderId) {
        throw new Error('Invalid order ID provided');
      }
      return getOrder(orderId);
    },
    ...fetchQueryConfig(options),
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    enabled: isValidOrderId && options?.enabled !== false,
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