'use client';
import { getMenuCategories } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isNetworkOnline } from '@/lib/connectivity';
import { createSingletonCache } from '@/lib/persistentCache';
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
  preventOrderItemReduction?: boolean;
  menus: Menu[];
}

// Last good categories payload. The menu page derives every section and
// sub-tab from this list — without it an offline visit renders an empty page
// even though each section's items were cached. Persisted so it survives a
// reload too, not just React Query's in-memory gcTime.
const categoriesCache = createSingletonCache<Category[]>('menu-categories');

const useMenuCategories = () => {
  const business = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const fetchMenuCategories = async () => {
    try {
      const responseData = await getMenuCategories(
        business[0]?.businessId,
        userInformation?.cooperateID
      );
      const data = responseData?.data?.data as Category[];
      if (Array.isArray(data)) {
        categoriesCache.set(data);
      }
      return data;
    } catch (error) {
      // Offline, whatever loaded last beats a failed page: serve it instead
      // of surfacing an error. Online failures still throw so the page can
      // show its retry/banner state.
      const cached = categoriesCache.get();
      if (!isNetworkOnline() && cached) {
        return cached;
      }
      throw error;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<Category[]>({
    queryKey: ['menuCategories'],
    queryFn: fetchMenuCategories,
    refetchOnWindowFocus: false,
    // Run the fetch once even when offline (retries still pause), so the
    // offline fallback above actually gets a chance to answer.
    networkMode: 'offlineFirst',
    enabled: !!business && !!userInformation,
  });

  return { data, isLoading, isError, refetch };
};

export default useMenuCategories;