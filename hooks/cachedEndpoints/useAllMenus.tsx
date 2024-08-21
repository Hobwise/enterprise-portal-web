'use client';
import { getMenu } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useAllMenus = () => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchMenus = async () => {
    const responseData = await getMenu(business[0].businessId);
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    'allMenus',
    fetchMenus,
    {
      refetchOnWindowFocus: false,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useAllMenus;
