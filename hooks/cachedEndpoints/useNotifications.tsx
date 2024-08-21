'use client';
import { getNotification } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

export interface Event {
  message: string;
  eventType: string;
  user: string;
  isRead: boolean;
  cooperateID: string;
  businessID: string;
  id: string;
}
const useNotification = () => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchNotification = async () => {
    const responseData = await getNotification(business[0]?.businessId);
    return responseData?.data?.data as Event[];
  };

  const { data, isLoading, isError, refetch } = useQuery<Event[]>(
    'notification',
    fetchNotification,
    {
      refetchOnWindowFocus: false,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useNotification;
