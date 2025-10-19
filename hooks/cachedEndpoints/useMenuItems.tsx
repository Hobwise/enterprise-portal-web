'use client';
import { getMenuItems } from '@/app/api/controllers/dashboard/menu';
import { useQuery } from '@tanstack/react-query';

interface MenuItem {
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
  waitingTimeMinutes?: number;
}

const useMenuItems = (menuId: string, page: number = 1, pageSize: number = 100) => {
  const fetchMenuItems = async () => {
    const responseData = await getMenuItems(menuId, page, pageSize);
    return responseData?.data?.data as MenuItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuItem[]>({
    queryKey: ['menuItems', menuId, page, pageSize],
    queryFn: fetchMenuItems,
    refetchOnWindowFocus: false,
    enabled: !!menuId,
  });

  return { data, isLoading, isError, refetch };
};

export default useMenuItems;
