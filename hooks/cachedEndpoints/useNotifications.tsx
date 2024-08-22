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

const useNotification = (page: number, pageSize: number) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchNotification = async () => {
    const responseData = await getNotification(
      business[0]?.businessId,
      page,
      pageSize
    );
    return responseData?.data.data as {
      notifications: Event[];
      totalCount: number;
      pageSize: number;
      currentPage: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ['notification', page, pageSize],
    fetchNotification,
    {
      staleTime: 60000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useNotification;
