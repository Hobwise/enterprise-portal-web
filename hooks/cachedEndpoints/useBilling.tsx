'use client';
import { getSubscription } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useBilling = () => {
  const business = getJsonItemFromLocalStorage('business');
  const businessId = business?.[0]?.businessId;

  const getSubscriptionInfo = async () => {
    try {
      const responseData = await getSubscription(businessId, 100, 100);
      return responseData?.data?.data ?? null;
    } catch (error) {
      // Re-throw so React Query can retry on failure, but after retries
      // are exhausted, isError will be set and the UI can show a retry button.
      throw error;
    }
  };

  const { data, refetch, isLoading, isError } = useQuery<any>({
    queryKey: ['getSubscription', businessId],
    queryFn: getSubscriptionInfo,
    refetchOnWindowFocus: false,
    enabled: !!businessId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 10000),
    staleTime: 0, // Always re-fetch on mount so fresh data loads after a subscription change
  });

  return { data, isLoading, isError, refetch };
};

export default useBilling;