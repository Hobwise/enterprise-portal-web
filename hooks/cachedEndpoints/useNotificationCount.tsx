import { getNotificationCount } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useNotificationCount = () => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchNotificationCount = async () => {
    const response = await getNotificationCount(business[0]?.businessId);
    // API response shape: { data: { data: number } }
    return response?.data?.data ?? 0;
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ['notificationCount', business?.[0]?.businessId],
    fetchNotificationCount,
    {
      refetchInterval: 60000, // poll every 60s
      refetchOnWindowFocus: true,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useNotificationCount; 