'use client';
import { getNotificationCount } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useNotificationCount = () => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchNotificationCount = async () => {
    const responseData = await getNotificationCount(business[0]?.businessId);
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    'notificationCount',
    fetchNotificationCount,
    {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useNotificationCount;
