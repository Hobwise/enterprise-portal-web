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
    packingCost: number;
  }>;
  totalCount: number;
};

const useMenu = (businessIdOutsideApp?: any, cooperateID?: any) => {
  const { page, rowsPerPage, menuIdTable } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation
    ? businessInformation[0]?.businessId
    : businessIdOutsideApp;

  const getAllMenus = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, menuIdTable }] = queryKey;
    const responseData = await getMenuByBusiness(
      businessId,
      page,
      rowsPerPage,
      menuIdTable,
      cooperateID
    );

    return responseData?.data?.data as MenuData[];
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuData[]>(
    ['menus', { page, rowsPerPage, menuIdTable }],
    getAllMenus,
    {
      refetchOnWindowFocus: false,

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
