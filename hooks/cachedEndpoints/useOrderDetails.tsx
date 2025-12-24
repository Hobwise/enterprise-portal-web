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
  const isValidOrderId = Boolean(orderId && typeof orderId === 'string' && orderId.trim().length > 0);

  // Ensure enabled is always a strict boolean
  const isEnabled = Boolean(isValidOrderId && options?.enabled !== false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: () => {
      if (!isValidOrderId) {
        throw new Error('Invalid order ID provided');
      }
      return getOrder(orderId);
    },
    ...fetchQueryConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    enabled: isEnabled,
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