'use client';
import { getBookingCategories, getBookingDetails } from '@/app/api/controllers/dashboard/bookings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface Booking {
  reservationName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  reference: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  bookingDateTime: string;
  bookingStatus: number;
  statusComment: string;
  id?: number;
}

interface BookingCategory {
  name: string;
  totalCount: number;
  bookings: Booking[];
}

interface AllBookingsData {
  categories: BookingCategory[];
  categoryDetails: Record<string, any>;
  isLoadingInitial: boolean;
  isLoadingAll: boolean;
}

const useAllBookingsData = (
  page: number = 1,
  rowsPerPage: number = 10,
  // Maintain parameter count for hook stability
  _filterType?: number,
  _startDate?: string,
  _endDate?: string
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
    queryKey: ['bookingCategories', { page, rowsPerPage }],
    queryFn: async () => {
      const response = await getBookingCategories(
        businessInformation[0]?.businessId
      );
      return response?.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = categoriesData?.bookingCategories   || [];

  // Fetch first category details immediately
  const firstCategory = categories[0]?.name;
  const { 
    data: firstCategoryData,
    isLoading: isLoadingFirst
  } = useQuery({
    queryKey: ['bookingDetails', firstCategory, { page, rowsPerPage }],
    queryFn: async () => {
      if (!firstCategory) return null;
      const response = await getBookingDetails(
        businessInformation[0]?.businessId,
        firstCategory,
        page,
        rowsPerPage
      );
      return response;
    },
    enabled: !!firstCategory && categories.length > 0,
    staleTime: 5 * 60 * 1000,
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

  // Fetch all other categories after 2 seconds
  useEffect(() => {
    if (categories.length <= 1 || isLoadingFirst) return;

    const timer = setTimeout(async () => {
      setIsLoadingAll(true);
      
      // Get categories except the first one
      const otherCategories = categories.slice(1);
      
      // Fetch all other categories in parallel
      const promises = otherCategories.map(async (category) => {
        const queryKey = ['bookingDetails', category.name, { page, rowsPerPage }];
        
        // Check if already cached
        const cachedData = queryClient.getQueryData(queryKey);
        if (cachedData) {
          return { categoryName: category.name, data: cachedData };
        }

        // Fetch if not cached
        try {
          const response = await getBookingDetails(
            businessInformation[0]?.businessId,
            category.name,
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
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [categories, isLoadingFirst, businessInformation, page, rowsPerPage, _filterType, _startDate, _endDate, queryClient]);

  // Get details for a specific category
  const getCategoryDetails = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    
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

export default useAllBookingsData;