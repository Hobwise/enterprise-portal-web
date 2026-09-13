'use client';
import { getCategoryOrderDocket } from '@/app/api/controllers/dashboard/orders';
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from '@/lib/queryConfig';

export interface DocketCategoryRef {
  categoryId: string;
  categoryName: string;
}

export interface CategoryDocket {
  category: DocketCategoryRef;
  items: any[];
}

/**
 * Fetches the docket for every category in parallel
 * (GET /api/v1/Order/categories/{categoryId}/orders/{orderId}) so the UI can
 * tell which categories actually have items on this order. Categories that
 * return no items are simply empty entries — the caller filters them out.
 *
 * Caching mirrors `useOrderDetails`; the whole batch is keyed by order + the
 * set of category ids.
 */
const useOrderDockets = (
  categories: DocketCategoryRef[] | undefined,
  orderId: string | undefined,
  options?: { enabled?: boolean }
) => {
  const ids = (categories ?? []).map((category) => category.categoryId);
  const isEnabled = Boolean(
    orderId && ids.length > 0 && options?.enabled !== false
  );

  const { data, isLoading, isError, refetch } = useQuery<CategoryDocket[]>({
    queryKey: ['orderDockets', orderId, ids],
    queryFn: async () => {
      const results = await Promise.all(
        (categories ?? []).map(async (category) => {
          const response = await getCategoryOrderDocket(
            category.categoryId,
            orderId as string
          );
          const items = response?.data?.data;
          return {
            category,
            items: Array.isArray(items) ? items : [],
          };
        })
      );
      return results;
    },
    ...fetchQueryConfig(),
    enabled: isEnabled,
  });

  return {
    dockets: data ?? [],
    isLoading,
    isError,
    refetch,
  };
};

export default useOrderDockets;
