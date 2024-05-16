'use client';
import { getMenuByBusiness } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

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
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllMenus = async () => {
    const responseData = await getMenuByBusiness(
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as MenuData[];
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuData[]>(
    'menus',
    getAllMenus,
    {
      staleTime: 1000 * 60 * 1,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useMenu;
