'use client';
import { getMenuByBusiness } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

type MenuData = {
  name: string;
  items: Array<{
    menuID: string;
    menuName: string;
    itemName: string;
    itemDescription: string;
    price: number;
    currency: string;
    isAvailable: boolean;
    hasVariety: boolean;
    image: string;
    varieties: null | any;
  }>;
};

const useMenu = () => {
  const { page, rowsPerPage, menuIdTable } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllMenus = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, menuIdTable }] = queryKey;
    const responseData = await getMenuByBusiness(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage,
      menuIdTable
    );

    return responseData?.data?.data as MenuData[];
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuData[]>(
    ['menus', { page, rowsPerPage, menuIdTable }],
    getAllMenus,
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useMenu;
