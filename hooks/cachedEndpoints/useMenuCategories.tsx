'use client';
import { getMenuCategories } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface MenuSection {
  name: string;
  id: string;
  packingCost: number;
  waitingTimeMinutes: number;
  totalCount: number;
}

interface Menu {
  menuCount: number;
  menuSections: MenuSection[];
}

interface Category {
  categoryId: string;
  orderIndex: number;
  categoryName: string;
  isVatEnabled: boolean;
  vatRate: number;
  menus: Menu[];
}

const useMenuCategories = () => {
  const business = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const fetchMenuCategories = async () => {
    const responseData = await getMenuCategories(
      business[0]?.businessId,
      userInformation?.cooperateID
    );
    return responseData?.data?.data as Category[];
  };

  const { data, isLoading, isError, refetch } = useQuery<Category[]>({
    queryKey: ['menuCategories'],
    queryFn: fetchMenuCategories,
    refetchOnWindowFocus: false,
    enabled: !!business && !!userInformation,
  });

  return { data, isLoading, isError, refetch };
};

export default useMenuCategories;