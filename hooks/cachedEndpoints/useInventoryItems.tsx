'use client';

import {
  getInventoryItems,
  getInventoryItem,
  getIngredients,
  getSuppliers,
  getUnitsByBusiness,
  getUnits,
  getRecipeDetails,
  InventoryItem,
  InventoryUnit,
  Supplier,
  ItemUnit,
  RecipeWithHistory,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from '@/lib/queryConfig';

type UseInventoryItemsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

const useInventoryItems = (params: UseInventoryItemsParams = {}) => {
  const { page = 1, pageSize = 10, search } = params;

  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchInventoryItems = async () => {
    try {
      const response = await getInventoryItems(
        businessId,
        page,
        pageSize,
        search
      );

      if (!response?.data?.isSuccessful) {
        return [];
      }

      return response.data.data as InventoryItem[];
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['inventoryItems', { page, pageSize, search }],
    queryFn: fetchInventoryItems,
    ...fetchQueryConfig(),
    retry: 1,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export const useInventoryItem = (itemId: string | null) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchItem = async () => {
    if (!itemId) return null;

    try {
      const response = await getInventoryItem(businessId, itemId);
      if (response?.data?.isSuccessful) {
        return response.data.data as InventoryItem;
      }
      return null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryItem | null>({
    queryKey: ['inventoryItem', itemId],
    queryFn: fetchItem,
    enabled: !!itemId,
    ...fetchQueryConfig(),
    retry: 1,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export const useIngredients = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchIngredients = async () => {
    try {
      const response = await getIngredients(businessId);
      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        // Handle paginated response - items are in the 'items' property
        if (result && typeof result === 'object' && 'items' in result) {
          return result.items as InventoryItem[];
        }
        // Fallback if response is already an array
        return Array.isArray(result) ? result : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['ingredients'],
    queryFn: fetchIngredients,
    ...fetchQueryConfig(),
    retry: 1,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    refetch,
  };
};

export const useUnitsByBusiness = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchUnits = async () => {
    try {
      const response = await getUnitsByBusiness(businessId);
      if (response?.data?.isSuccessful) {
        return response.data.data as InventoryUnit[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching units by business:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryUnit[]>({
    queryKey: ['unitsByBusiness'],
    queryFn: fetchUnits,
    ...fetchQueryConfig(),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  return { data: data || [], isLoading, isError, refetch };
};

export const useSuppliers = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers(businessId);
      if (response?.data?.isSuccessful) {
        return response.data.data as Supplier[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
    ...fetchQueryConfig(),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  return { data: data || [], isLoading, isError, refetch };
};

type UseUnitsParams = {
  page?: number;
  pageSize?: number;
};

export const useUnits = (params: UseUnitsParams = {}) => {
  const { page = 1, pageSize = 10 } = params;

  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchUnits = async () => {
    try {
      const response = await getUnits(businessId, page, pageSize);
      if (response?.data?.isSuccessful) {
        return response.data.data as InventoryUnit[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryUnit[]>({
    queryKey: ['units', { page, pageSize }],
    queryFn: fetchUnits,
    ...fetchQueryConfig(),
    retry: 1,
  });

  return { data: data || [], isLoading, isError, refetch };
};

export const useItemUnits = (itemId: string | null) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchItemUnits = async () => {
    if (!itemId) return [];

    try {
      const response = await getInventoryItem(businessId, itemId);
      if (response?.data?.isSuccessful) {
        const item = response.data.data as InventoryItem;
        return (item.itemUnits || []) as ItemUnit[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching item units:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<ItemUnit[]>({
    queryKey: ['itemUnits', itemId],
    queryFn: fetchItemUnits,
    enabled: !!itemId,
    ...fetchQueryConfig(),
    retry: 1,
  });

  return { data: data || [], isLoading, isError, refetch };
};

export const useRecipeDetails = (recipeId: string | null) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation ? businessInformation[0]?.businessId : '';

  const fetchRecipeDetails = async () => {
    if (!recipeId) return null;

    try {
      const response = await getRecipeDetails(businessId, recipeId);
      if (response?.data?.isSuccessful) {
        return response.data.data as RecipeWithHistory;
      }
      return null;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<RecipeWithHistory | null>({
    queryKey: ['recipeDetails', recipeId],
    queryFn: fetchRecipeDetails,
    enabled: !!recipeId,
    ...fetchQueryConfig(),
    retry: 1,
  });

  return { data, isLoading, isError, refetch };
};

export default useInventoryItems;
