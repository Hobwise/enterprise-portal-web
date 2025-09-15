'use client';
import { getMenuByBusinessUser } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

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

const useMenuUser = (businessIdOutsideApp?: any, cooperateID?: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation
    ? businessInformation[0]?.businessId
    : businessIdOutsideApp;

  const getAllMenus = async () => {
    const responseData = await getMenuByBusinessUser(
      businessId,

      cooperateID
    );

    return responseData?.data?.data as MenuData[];
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuData[]>({
    queryKey: ['menusUser'],
    queryFn: getAllMenus,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useMenuUser;
