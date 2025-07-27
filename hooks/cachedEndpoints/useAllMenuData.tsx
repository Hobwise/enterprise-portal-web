'use client';
import { getMenuCategories, getMenuItems } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery, useQueryClient } from 'react-query';
import { useEffect, useState } from 'react';

interface MenuItem {
  id: string;
  menuID: string;
  packingCost: number;
  price: number;
  image: string;
  imageReference: string;
  varieties: null | any;
  menuName: string;
  itemName: string;
  itemDescription: string;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  packingCost: number;
  waitingTimeMinutes: number;
  totalCount: number;
}

interface MenuItemsResponse {
  items: MenuItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const useAllMenuData = (
  currentCategory?: string,
  page: number = 1,
  rowsPerPage: number = 10
) => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [categoryDetails, setCategoryDetails] = useState<Record<string, any>>({});
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const businessId = businessInformation?.[0]?.businessId;

  // First, fetch categories
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useQuery(
    ['menuCategories', businessId],
    async () => {
      const response = await getMenuCategories(businessId, '');
      return response?.data?.data?.menuCategories || [];
    },
    {
      enabled: !!businessId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnReconnect: false,
      // refetchOnWindowFocus will use global default (true)
    }
  );

  const categories = categoriesData || [];

  // Fetch first category details immediately
  const firstCategory = categories[0]?.id;
  const { 
    data: firstCategoryData,
    isLoading: isLoadingFirst,
    isFetching: isFetchingFirst
  } = useQuery(
    ['menuItems', firstCategory, { page, rowsPerPage }],
    async () => {
      if (!firstCategory || categories[0]?.totalCount === 0) return { items: [], totalCount: 0 };
      
      const response = await getMenuItems(firstCategory, page, rowsPerPage);
      return response?.data?.data || { items: [], totalCount: 0 };
    },
    {
      enabled: !!firstCategory && !!businessId && categories.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnReconnect: false,
      keepPreviousData: true,
      // refetchOnWindowFocus will use global default (true)
    }
  );

  // Update categoryDetails when first category loads
  useEffect(() => {
    if (firstCategoryData && firstCategory) {
      setCategoryDetails(prev => ({
        ...prev,
        [firstCategory]: firstCategoryData
      }));
    }
  }, [firstCategoryData, firstCategory]);

  // Fetch all other categories after 2 seconds
  useEffect(() => {
    if (categories.length <= 1 || isLoadingFirst || !businessId) return;

    const timer = setTimeout(async () => {
      setIsLoadingAll(true);
      
      // Get categories except the first one
      const otherCategories = categories.slice(1);
      
      // Fetch all other categories in parallel
      const promises = otherCategories.map(async (category: any) => {
        // Skip if category has 0 items
        if (category.totalCount === 0) {
          return { categoryId: category.id, data: { items: [], totalCount: 0 } };
        }

        const queryKey = ['menuItems', category.id, { page: 1, rowsPerPage: 100 }];
        
        // Check if already cached
        const cachedData = queryClient.getQueryData(queryKey);
        if (cachedData) {
          return { categoryId: category.id, data: cachedData };
        }

        // Fetch if not cached
        try {
          const response = await getMenuItems(category.id, 1, 100);
          const data = response?.data?.data || { items: [], totalCount: 0 };
          
          // Cache the result
          queryClient.setQueryData(queryKey, data, {
            updatedAt: Date.now(),
          });
          
          return { categoryId: category.id, data };
        } catch (error) {
          console.error(`Failed to fetch ${category.name}:`, error);
          return { categoryId: category.id, data: { items: [], totalCount: 0 } };
        }
      });

      const results = await Promise.all(promises);
      
      // Update categoryDetails with all fetched data
      const newDetails: Record<string, any> = {};
      results.forEach(result => {
        newDetails[result.categoryId] = result.data;
      });
      
      setCategoryDetails(prev => ({
        ...prev,
        ...newDetails
      }));
      
      setIsLoadingAll(false);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [categories, isLoadingFirst, businessId, queryClient]);

  // Use individual hook for on-demand fetching of current category
  const currentCategoryHasData = currentCategory && 
    categories.some((c: any) => c.id === currentCategory && c.totalCount > 0);
    
  const { isLoading: isLoadingCurrent, isFetching: isFetchingCurrent } = useQuery(
    ['menuItems', currentCategory, { page, rowsPerPage }],
    async () => {
      if (!currentCategory) return { items: [], totalCount: 0 };
      
      const response = await getMenuItems(currentCategory, page, rowsPerPage);
      return response?.data?.data || { items: [], totalCount: 0 };
    },
    {
      enabled: currentCategoryHasData || false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnReconnect: false,
      keepPreviousData: true,
      // refetchOnWindowFocus will use global default (true)
    }
  );

  // Get details for a specific category using React Query cache as single source of truth
  const getCategoryDetails = (categoryId: string) => {
    // Always return a valid object structure
    const defaultResult = { items: [], totalCount: 0 };
    
    // If no categories loaded yet, return empty
    if (!categories || categories.length === 0) {
      return defaultResult;
    }
    
    const category = categories.find((c: any) => c.id === categoryId);
    
    // If category has 0 items, return empty array immediately
    if (category && category.totalCount === 0) {
      return defaultResult;
    }

    // Check React Query cache first
    const queryKey = ['menuItems', categoryId, { page, rowsPerPage }];
    const cachedData = queryClient.getQueryData(queryKey);
    
    if (cachedData) {
      // Return cached data directly
      const details = cachedData as MenuItemsResponse;
      return {
        items: details.items || [],
        totalCount: details.totalCount || 0,
        ...details // Include pagination info
      };
    }

    // Fallback to local state for bulk-fetched data
    if (categoryDetails[categoryId]) {
      const details = categoryDetails[categoryId];
      return {
        items: details.items || [],
        totalCount: details.totalCount || 0,
        ...details
      };
    }

    // Return empty array if no data found
    return defaultResult;
  };

  return {
    categories,
    getCategoryDetails,
    isLoadingInitial: isLoadingCategories || isLoadingFirst,
    isLoadingAll,
    isLoadingCurrent,
    isFetching: isFetchingCategories || isFetchingFirst || isFetchingCurrent,
    isError: isCategoriesError,
    refetch: refetchCategories,
    allCategoryDetails: categoryDetails
  };
};

export default useAllMenuData;