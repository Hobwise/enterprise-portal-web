'use client';

import {
  getInventoryItems,
  getInventoryItem,
  getIngredients,
  getSuppliers,
  getUnitsByBusiness,
  InventoryItem,
  InventoryUnit,
  Supplier,
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
        const items = response.data.data as InventoryItem[];
        return items.filter((item) => item.itemType === 1);
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

export default useInventoryItems;
