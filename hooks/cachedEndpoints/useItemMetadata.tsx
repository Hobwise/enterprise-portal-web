'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from "@/lib/queryConfig";

interface ItemMetadata {
  id: string;
  itemName: string;
  menuName: string;
  itemDescription: string;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image: string;
  varieties: any;
  packingCost: number;
}

/**
 * Lightweight hook to fetch only essential item metadata for UpdateOrderModal
 * Instead of fetching full menu data, this only gets metadata for specific items
 */
const useItemMetadata = (itemIds: string[]) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['itemMetadata', itemIds.sort().join(',')],
    queryFn: async () => {
      // This would be a lightweight API endpoint that returns only metadata
      // For now, we'll return null to indicate this optimization is ready for implementation
      return null;
    },
    ...fetchQueryConfig(),
    enabled: itemIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - metadata doesn't change often
  });

  return {
    metadata: data || {},
    isLoading,
    isError,
  };
};

export default useItemMetadata;