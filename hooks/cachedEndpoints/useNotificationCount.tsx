import { getNotificationCount } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';

const useNotifyCount = () => {
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const business = getJsonItemFromLocalStorage('business');
  
  const businessId = useMemo(() => business?.[0]?.businessId, [business]);

  /**
   * Fetches the notification count from the API.
   * This function will only be called when the query is enabled or manually refetched.
   * @returns {Promise<number>} The notification count.
   */
  const fetchNotificationCount = async () => {
    // Do not proceed if businessId is not available.
    if (!businessId) {
      return 0;
    }
    const response = await getNotificationCount(businessId);

    return response?.data?.data ?? 0;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notificationCount', businessId],
    queryFn: fetchNotificationCount,
    enabled: !!businessId && !hasInitialFetch, // Only auto-run once when businessId is available and hasn't fetched yet
  });

  // Handle success/error using useEffect since onSuccess/onError are deprecated in v5
  useEffect(() => {
    if (data !== undefined || isError) {
      setHasInitialFetch(true);
    }
  }, [data, isError]);

  // Manual trigger function that bypasses the hasInitialFetch check
  const triggerFetch = () => {
    if (businessId) {
      refetch();
    }
  };

  // Return the state and the trigger function to the component.
  return { 
    data, 
    isLoading, 
    isError, 
    // You can call this function to trigger the API call manually after the initial fetch.
    triggerFetch,
    // Original refetch function (if you need it for other purposes)
    refetch 
  };
};

export default useNotifyCount;