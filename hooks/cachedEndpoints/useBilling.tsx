'use client';
import { getSubscription } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useBilling = () => {
  const business = getJsonItemFromLocalStorage('business');
  const businessId = business?.[0]?.businessId;

  const getSubscriptionInfo = async () => {
    const responseData = await getSubscription(businessId, 100, 100);
    // console.log("RESSS",responseData)
    return responseData?.data?.data ?? null;
  };

  const { data, refetch, isLoading, isError } = useQuery<any>({
    queryKey: ['getSubscription', businessId],
    queryFn: getSubscriptionInfo,
    refetchOnWindowFocus: false,
    enabled: !!businessId,
  });

  return { data, isLoading, isError, refetch };
};

export default useBilling;