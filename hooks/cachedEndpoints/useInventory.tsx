'use client';
import { getInventoryItems } from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from "@/lib/queryConfig";

export type InventoryItem = {
  id: string;
  itemName: string;
};

const useInventory = (searchQuery: string = "") => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation?.[0]?.businessId;
  const page = 1;

  // Fetch inventory items
  const { data, isLoading, isError } = useQuery<InventoryItem[]>({
    queryKey: ["inventory-items", businessId, searchQuery],
    queryFn: async () => {
      if (!businessId) return [];
      
      const clientParameters = {
        page: 0,
        search: searchQuery,
        pageSize: 0
      };

      const response = await getInventoryItems(businessId, clientParameters);
      
      if (response?.data?.data) {
        // Map response to InventoryItem type
        // The API response might vary, so we map it safely
        return response.data.data.map((item: any) => ({
          id: item.id,
          itemName: item.itemName || item.name // Handle potential property name differences
        }));
      }
      
      return [];
    },
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  return {
    items: data || [],
    isLoading,
    isError,
  };
};

export default useInventory;
