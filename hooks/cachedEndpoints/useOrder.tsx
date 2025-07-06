'use client';
import { getOrderCategories, getOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

type OrderItem = {
  id: string;
  placedByName: string;
  placedByPhoneNumber: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  qrReference: string;
  paymentMethod: number;
  paymentReference: string;
  status: 0 | 1 | 2 | 3;
  dateCreated: string;
  comment?: string;
};

type OrderCategory = {
  name: string;
  totalCount: number;
  orders: OrderItem[];
};


const useOrder = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllOrders = async ({ queryKey }: { queryKey: any }) => {
    const [_key, { page, rowsPerPage, tableStatus, filterType, startDate, endDate }] = queryKey;

    try {
      // First, get order categories with updated counts for the date range
      const categoriesResponse = await getOrderCategories(
        businessInformation[0]?.businessId,
        filterType,
        startDate,
        endDate
      );
      
      if (!categoriesResponse?.data?.orderCategories) {
        return { categories: [], details: [] };
      }
      
      const categories = categoriesResponse?.data.orderCategories;
      
      if (categories.length === 0) {
        return { categories: [], details: [] };
      }

  

      // Fetch details for the selected category or first category
      const targetCategory = tableStatus || categories[0]?.name;
      
      
      const detailsItems = await getOrderDetails(
        businessInformation[0]?.businessId,
        targetCategory,
        filterType,
        startDate,
        endDate,
        page,
        rowsPerPage
      );
      
            
      return {
        categories,
        details: detailsItems,
      };

    } catch (error) {
      console.error('Error loading orders:', error);
      return { categories: [], details: [] };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<{ categories: OrderCategory[]; details: OrderItem[] }>(
    [
      "orders",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    getAllOrders,
    {
      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      staleTime: 0, // Always consider data stale to ensure refetch on date changes
      enabled: options?.enabled !== false,
    }
  );


  

  return {
    categories: data?.categories || [],
    details: data?.details || [],
    isLoading,
    isError,
    refetch,
  };
};

export default useOrder;
