'use client';
import { getMenuCategories } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
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

  const fetchMenuCategories = async (): Promise<Category[]> => {
    try {
      const responseData = await getMenuCategories(
        business[0]?.businessId,
        userInformation?.cooperateID
      );
      const data = responseData?.data?.data as Category[];
      if (Array.isArray(data)) {
        categoriesCache.set(data);
        return data;
      }

      // The controller swallows request failures and resolves `undefined`.
      // React Query rejects `undefined` as query data, so serve the last good
      // payload when we have one, otherwise throw so the page can retry.
      const cached = categoriesCache.get();
      if (cached) return cached;
      throw new Error('Failed to load menu categories');
    } catch (error) {
      // Offline (or a failed request), whatever loaded last beats an empty page.
      const cached = categoriesCache.get();
      if (cached) return cached;
      throw error;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<Category[]>({
    queryKey: ['menuCategories'],
    queryFn: fetchMenuCategories,
    // Seed from the persisted cache so the category tabs paint immediately on
    // a reload instead of waiting on the network. Freshness is governed
    // by staleTime so cached categories are treated as fresh and do not cause churn.
    initialData: () => categoriesCache.get(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Run the fetch once even when offline (retries still pause), so the
    // offline fallback above actually gets a chance to answer.
    networkMode: 'offlineFirst',
    enabled: !!business && !!userInformation,
  });

  return { data, isLoading, isError, refetch };
};

export default useMenuCategories;