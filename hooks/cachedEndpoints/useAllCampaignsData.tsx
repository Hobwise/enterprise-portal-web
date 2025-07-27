'use client';
import { getCampaignCategories, getCampaignsByCategory } from '@/app/api/controllers/dashboard/campaigns';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery, useQueryClient } from 'react-query';
import { useEffect, useState } from 'react';

// Custom hook for fetching individual category data
const useCampaignCategoryData = (categoryName: string, businessId: string, enabled: boolean = true) => {
  return useQuery(
    ['campaignsByCategory', categoryName, businessId],
    async () => {
      const payload = {
        category: categoryName,
        businessId: businessId,
        page: 1,
        pageSize: 100
      };
      
      const response = await getCampaignsByCategory(payload);
      
      // Check if response has the expected structure
      if (response?.data?.data) {
        const responseData = response.data.data;
        if (Array.isArray(responseData)) {
          return { campaigns: responseData, totalCount: responseData.length };
        } else if (responseData.campaigns && Array.isArray(responseData.campaigns)) {
          return responseData; // Already has campaigns array
        } else {
          return { campaigns: [], totalCount: 0 };
        }
      } else if (response?.data && Array.isArray(response.data)) {
        // If response.data is directly an array
        return { campaigns: response.data, totalCount: response.data.length };
      } else {
        return { campaigns: [], totalCount: 0 };
      }
    },
    {
      enabled: enabled && !!categoryName && !!businessId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnReconnect: false,
      keepPreviousData: true,
      // refetchOnWindowFocus will use global default (true)
    }
  );
};

interface CampaignItem {
  id: string;
  campaignName: string;
  campaignDescription: string;
  startDateTime: string;
  endDateTime: string;
  dressCode: string;
  isActive: boolean;
  image: string;
  imageReference: string;
}


const useAllCampaignsData = (currentCategory?: string) => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [categoryDetails, setCategoryDetails] = useState<Record<string, any>>({});
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const businessId = businessInformation?.[0]?.businessId;

  // First, fetch categories
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useQuery(
    ['campaignCategories', businessInformation?.[0]?.businessId],
    async () => {
      const response = await getCampaignCategories(businessInformation?.[0]?.businessId);
      return response?.data?.data?.campaignCategories || [];
    },
    {
      enabled: !!businessInformation?.[0]?.businessId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnReconnect: false,
      // refetchOnWindowFocus will use global default (true)
    }
  );

  const categories = categoriesData || [];

  // Fetch first category details immediately
  const firstCategory = categories[0]?.name;
  const { 
    data: firstCategoryData,
    isLoading: isLoadingFirst
  } = useQuery(
    ['campaignsByCategory', firstCategory, businessInformation?.[0]?.businessId],
    async () => {
      if (!firstCategory || categories[0]?.totalCount === 0) return { campaigns: [], totalCount: 0 };
      
      const payload = {
        category: firstCategory,
        businessId: businessInformation?.[0]?.businessId,
        page: 1,
        pageSize: 100 // Get all campaigns for now
      };
      
      const response = await getCampaignsByCategory(payload);
      
      // Check if response has the expected structure
      if (response?.data?.data) {
        // Check if it's the campaigns array or an object with campaigns
        const responseData = response.data.data;
        if (Array.isArray(responseData)) {
          return { campaigns: responseData, totalCount: responseData.length };
        } else if (responseData.campaigns && Array.isArray(responseData.campaigns)) {
          return responseData; // Already has campaigns array
        } else {
          return { campaigns: [], totalCount: 0 };
        }
      } else if (response?.data && Array.isArray(response.data)) {
        // If response.data is directly an array
        return { campaigns: response.data, totalCount: response.data.length };
      } else {
        return { campaigns: [], totalCount: 0 };
      }
    },
    {
      enabled: !!firstCategory && !!businessInformation?.[0]?.businessId && categories.length > 0,
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
    if (categories.length <= 1 || isLoadingFirst || !businessInformation?.[0]?.businessId) return;

    const timer = setTimeout(async () => {
      setIsLoadingAll(true);
      
      // Get categories except the first one
      const otherCategories = categories.slice(1);
      
      // Fetch all other categories in parallel
      const promises = otherCategories.map(async (category: any) => {
        // Skip if category has 0 items
        if (category.totalCount === 0) {
          return { categoryName: category.name, data: { campaigns: [], totalCount: 0 } };
        }

        const queryKey = ['campaignsByCategory', category.name, businessInformation?.[0]?.businessId];
        
        // Check if already cached
        const cachedData = queryClient.getQueryData(queryKey);
        if (cachedData) {
          return { categoryName: category.name, data: cachedData };
        }

        // Fetch if not cached
        try {
          const payload = {
            category: category.name,
            businessId: businessInformation?.[0]?.businessId,
            page: 1,
            pageSize: 100
          };
          
          const response = await getCampaignsByCategory(payload);
          
          // Check if response has the expected structure
          let data;
          if (response?.data?.data) {
            const responseData = response.data.data;
            if (Array.isArray(responseData)) {
              data = { campaigns: responseData, totalCount: responseData.length };
            } else if (responseData.campaigns && Array.isArray(responseData.campaigns)) {
              data = responseData; // Already has campaigns array
            } else {
              data = { campaigns: [], totalCount: 0 };
            }
          } else if (response?.data && Array.isArray(response.data)) {
            // If response.data is directly an array
            data = { campaigns: response.data, totalCount: response.data.length };
          } else {
            data = { campaigns: [], totalCount: 0 };
          }
          
          // Cache the result with the same options
          queryClient.setQueryData(queryKey, data, {
            updatedAt: Date.now(),
          });
          
          return { categoryName: category.name, data };
        } catch (error) {
          console.error(`Failed to fetch ${category.name}:`, error);
          return { categoryName: category.name, data: { campaigns: [], totalCount: 0 } };
        }
      });

      const results = await Promise.all(promises);
      
      // Update categoryDetails with all fetched data
      const newDetails: Record<string, any> = {};
      results.forEach(result => {
        newDetails[result.categoryName] = result.data;
      });
      
      setCategoryDetails(prev => ({
        ...prev,
        ...newDetails
      }));
      
      setIsLoadingAll(false);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [categories, isLoadingFirst, businessInformation, queryClient]);

  // Use the individual hook for current category - let React Query handle caching
  const currentCategoryHasData = currentCategory && 
    categories.some((c: any) => c.name === currentCategory && c.totalCount > 0);
    
  const { isLoading: isLoadingCurrent } = useCampaignCategoryData(
    currentCategory || '',
    businessId || '',
    currentCategoryHasData || false
  );

  // No longer needed - React Query cache is the single source of truth

  // Get details for a specific category
  const getCategoryDetails = (categoryName: string) => {
    
    // Always return a valid object structure
    const defaultResult = { data: [], totalCount: 0 };
    
    // If no categories loaded yet, return empty
    if (!categories || categories.length === 0) {
      return defaultResult;
    }
    
    const category = categories.find((c: any) => c.name === categoryName);
    
    // If category has 0 items, return empty array immediately
    if (category && category.totalCount === 0) {
      return defaultResult;
    }

    // Check React Query cache first
    const queryKey = ['campaignsByCategory', categoryName, businessId];
    const cachedData = queryClient.getQueryData(queryKey);
    
    if (cachedData) {
      // Extract campaigns array from the cached response structure
      const details = cachedData as any;
      
      if (details && details.campaigns && Array.isArray(details.campaigns)) {
        return { data: details.campaigns, totalCount: details.totalCount || details.campaigns.length };
      } else if (details && details.data && Array.isArray(details.data)) {
        return { data: details.data, totalCount: details.totalCount || details.data.length };
      } else if (Array.isArray(details)) {
        return { data: details, totalCount: details.length };
      }
    }

    // Fallback to local state for bulk-fetched data
    if (categoryDetails[categoryName]) {
      const details = categoryDetails[categoryName];
      
      if (details && details.campaigns && Array.isArray(details.campaigns)) {
        return { data: details.campaigns, totalCount: details.totalCount || details.campaigns.length };
      } else if (details && details.data && Array.isArray(details.data)) {
        return { data: details.data, totalCount: details.totalCount || details.data.length };
      } else if (Array.isArray(details)) {
        return { data: details, totalCount: details.length };
      }
    }

    // Return empty array if no data found
    return defaultResult;
  };

  return {
    categories,
    campaigns: [], // No longer used, but kept for compatibility
    getCategoryDetails,
    isLoadingInitial: isLoadingCategories || isLoadingFirst,
    isLoadingAll,
    isLoadingCurrent,
    isError: isCategoriesError,
    refetch: refetchCategories,
    allCategoryDetails: categoryDetails
  };
};

export default useAllCampaignsData;