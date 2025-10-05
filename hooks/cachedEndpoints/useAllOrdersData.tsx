'use client';
import { getOrderCategories, getOrderDetails } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface OrderItem {
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
  orderDetails?: { itemID: string; itemName: string; quantity: number; unitPrice: number; packingCost?: number }[];
}

interface OrderCategory {
  name: string;
  totalCount: number;
  orders: OrderItem[];
}

const useAllOrdersData = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  rowsPerPage: number = 10
) => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [categoryDetails, setCategoryDetails] = useState<Record<string, any>>({});
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // First, fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['orderCategories', { filterType, startDate, endDate }],
    queryFn: async () => {
      const response = await getOrderCategories(
        businessInformation[0]?.businessId,
        filterType,
        startDate,
        endDate
      );
      return response?.data?.data || [];
    },
    staleTime: 0, // Always consider stale to ensure immediate refetch when orders are updated
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = categoriesData || [];

  // Fetch first category details immediately
  const firstCategory = categories[0]?.name;
  const {
    data: firstCategoryData,
    isLoading: isLoadingFirst
  } = useQuery({
    queryKey: ['orderDetails', firstCategory, { page, rowsPerPage, filterType, startDate, endDate }],
    queryFn: async () => {
      if (!firstCategory) return null;
      const response = await getOrderDetails(
        businessInformation[0]?.businessId,
        firstCategory,
        filterType,
        startDate,
        endDate,
        page,
        rowsPerPage
      );
      return response;
    },
    enabled: !!firstCategory && categories.length > 0,
    staleTime: 0, // Always consider stale to ensure immediate refetch when orders are updated
    gcTime: 10 * 60 * 1000,
  });

  // Update categoryDetails when first category loads
  useEffect(() => {
    if (firstCategoryData && firstCategory) {
      setCategoryDetails(prev => ({
        ...prev,
        [firstCategory]: firstCategoryData
      }));
    }
  }, [firstCategoryData, firstCategory]);

  // Fetch all other categories immediately after first category loads
  useEffect(() => {
    if (categories.length <= 1 || isLoadingFirst) return;

    // Start fetching immediately - no delay
    const fetchOtherCategories = async () => {
      setIsLoadingAll(true);

      // Get categories except the first one
      const otherCategories = categories.slice(1);

      // Fetch all other categories in parallel
      const promises = otherCategories.map(async (category: any) => {
        const queryKey = ['orderDetails', category.name, { page, rowsPerPage, filterType, startDate, endDate }];

        // Check if already cached
        const cachedData = queryClient.getQueryData(queryKey);
        if (cachedData) {
          return { categoryName: category.name, data: cachedData };
        }

        // Fetch if not cached
        try {
          const response = await getOrderDetails(
            businessInformation[0]?.businessId,
            category.name,
            filterType,
            startDate,
            endDate,
            page,
            rowsPerPage
          );

          // Cache the result
          queryClient.setQueryData(queryKey, response);

          return { categoryName: category.name, data: response };
        } catch (error) {
          console.error(`Failed to fetch ${category.name}:`, error);
          return { categoryName: category.name, data: null };
        }
      });

      const results = await Promise.all(promises);

      // Update categoryDetails with all fetched data
      const newDetails: Record<string, any> = {};
      results.forEach(result => {
        if (result.data) {
          newDetails[result.categoryName] = result.data;
        }
      });

      setCategoryDetails(prev => ({
        ...prev,
        ...newDetails
      }));

      setIsLoadingAll(false);
    };

    fetchOtherCategories();
  }, [categories, isLoadingFirst, businessInformation, page, rowsPerPage, filterType, startDate, endDate, queryClient]);

  // Get details for a specific category
  const getCategoryDetails = (categoryName: string) => {
    const category = categories.find((c: any) => c.name === categoryName);

    // If category has 0 items, return empty array immediately
    if (category && category.totalCount === 0) {
      return { data: [], totalCount: 0 };
    }

    // Return cached data if available
    if (categoryDetails[categoryName]) {
      return categoryDetails[categoryName];
    }

    // Return null if still loading
    return null;
  };

  return {
    categories,
    getCategoryDetails,
    isLoadingInitial: isLoadingCategories || isLoadingFirst,
    isLoadingAll,
    isError: isCategoriesError,
    refetch: refetchCategories,
    allCategoryDetails: categoryDetails
  };
};

export default useAllOrdersData;