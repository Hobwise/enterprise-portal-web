'use client';
import { getSubscription } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useBilling = () => {
  const business = getJsonItemFromLocalStorage('business');

  const getSubscriptionInfo = async () => {
    const responseData = await getSubscription(business[0].businessId, 100, 100);
    // console.log("RESSS",responseData)
    return responseData?.data?.data as any;
  };

  const { data, refetch, isLoading, isError } = useQuery<any>({
    queryKey: ['getSubscription'],
    queryFn: getSubscriptionInfo,
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, isError, refetch };
};

export default useBilling;