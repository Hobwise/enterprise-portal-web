'use client';
import { getCategoryOrders, getCategoryOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchQueryConfig } from "@/lib/queryConfig";

type OrderItem = {
  orderId: string;
  reference: string;
  placedByPhoneNumber: string;
  placedByName: string;
  tableName: string;
  treatedBy: string | null;
  estimatedCompletionTime: string;
  dateUpdated: string;
  totalPrice: number;
  status: number;
};

type CategoryCount = {
  name: string;
  count: number;
  totalAmount: number;
};

const useCategoryOrders = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  orderStatus?: string,
  page?: number,
  pageSize?: number,
  options?: { enabled: boolean }
) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const categoryId = userInformation?.assignedCategoryId;

  const getAllCategoryOrders = async ({ queryKey }: { queryKey: any }) => {
    const [_key, { categoryId, filterType, startDate, endDate, orderStatus, page, pageSize }] = queryKey;

    if (!categoryId) {
      return { categories: [], details: null };
    }

    try {
      // First, get category counts
      const categoriesResponse = await getCategoryOrders(
        categoryId,
        startDate,
        endDate,
        filterType
      );

      if (!categoriesResponse?.data?.orderCategories) {
        return { categories: [], details: null };
      }

      const categories = categoriesResponse?.data.orderCategories;

      if (categories.length === 0) {
        return { categories: [], details: null };
      }

      // Fetch order details
      const detailsResponse = await getCategoryOrderDetails(
        categoryId,
        page || 1,
        pageSize || 10,
        startDate,
        endDate,
        filterType,
        orderStatus
      );

      return {
        categories,
        details: detailsResponse,
      };

    } catch (error) {
      console.error('Error loading category orders:', error);
      return { categories: [], details: null };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      "categoryOrders",
      { categoryId, filterType, startDate, endDate, orderStatus, page, pageSize },
    ],
    queryFn: getAllCategoryOrders,
    ...fetchQueryConfig(options),
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!categoryId,
  });

  return {
    categories: data?.categories || [],
    details: data?.details || null,
    isLoading,
    isError,
    refetch,
  };
};

export default useCategoryOrders;
