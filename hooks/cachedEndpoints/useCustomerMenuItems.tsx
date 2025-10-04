'use client';
import { getCustomerMenuItems } from '@/app/api/controllers/customerOrder';
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

const useCustomerMenuItems = (menuId: string, page: number = 1, pageSize: number = 100) => {
  const fetchMenuItems = async () => {
    if (!menuId) return [];

    const responseData = await getCustomerMenuItems(menuId, page, pageSize);
    // The API returns data.items, not just data
    const items = responseData?.data?.items;

    // Ensure we return an array
    if (!items || !Array.isArray(items)) {
      return [];
    }

    return items as MenuItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuItem[]>({
    queryKey: ['customerMenuItems', menuId, page, pageSize],
    queryFn: fetchMenuItems,
    refetchOnWindowFocus: false,
    enabled: !!menuId,
  });

  return { data, isLoading, isError, refetch };
};

export default useCustomerMenuItems;
