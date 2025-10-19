'use client';
import { getCustomerMenuCategories } from '@/app/api/controllers/customerOrder';
import { useQuery } from '@tanstack/react-query';

interface MenuCategory {
  id: string;
  name: string;
  packingCost: number;
  waitingTimeMinutes: number;
  totalCount?: number;
}

const useCustomerMenuCategories = (businessId?: string, cooperateId?: string) => {
  const fetchCategories = async () => {
    if (!businessId) return [];

const responseData = await getCustomerMenuCategories(businessId, cooperateId);

    const categories = responseData?.data || [];
    const menuSections: MenuCategory[] = [];

    categories.forEach((category: any) => {
      category.menus?.forEach((menu: any) => {
        menu.menuSections?.forEach((section: any) => {
          menuSections.push({
            id: section.id,
            name: section.name,
            packingCost: section.packingCost,
            waitingTimeMinutes: section.waitingTimeMinutes,
            totalCount: section.totalCount,
          });
        });
      });
    });

    return menuSections;
  };

  const { data, isLoading, isError, refetch } = useQuery<MenuCategory[]>({
    queryKey: ['customerMenuCategories', businessId, cooperateId],
    queryFn: fetchCategories,
    refetchOnWindowFocus: false,
    enabled: !!businessId,
  });

  return { data, isLoading, isError, refetch };
};

export default useCustomerMenuCategories;
