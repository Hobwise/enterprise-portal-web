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
  activeCategory?: string,
  _filterType?: number,
  _startDate?: string,
  _endDate?: string
) => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // 1. Fetch categories (tab names + counts)
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['bookingCategories'],
    queryFn: async () => {
      const response = await getBookingCategories(
        businessInformation[0]?.businessId
      );
      return response?.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = categoriesData?.bookingCategories || [];

  // Determine which category to fetch details for
  const activeCategoryName = activeCategory || categories[0]?.name;

  // Check if the active category has items (skip fetch if totalCount is 0)
  const activeCategoryInfo = categories.find((c: BookingCategory) => c.name === activeCategoryName);
  const hasItems = !activeCategoryInfo || activeCategoryInfo.totalCount > 0;

  // 2. Fetch details ONLY for the active category
  const { 
    data: activeCategoryData,
    isLoading: isLoadingDetails,
  } = useQuery({
    queryKey: ['bookingDetails', activeCategoryName, { page, rowsPerPage }],
    queryFn: async () => {
      const response = await getBookingDetails(
        businessInformation[0]?.businessId,
        activeCategoryName!,
        page,
        rowsPerPage
      );
      return response;
    },
    enabled: !!activeCategoryName && categories.length > 0 && hasItems,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Track when initial load completes (categories + first tab)
  // Once set, full-page loading is never shown again (tab switches use inline spinner)
  useEffect(() => {
    if (
      !isLoadingCategories &&
      !isLoadingDetails &&
      categories.length > 0 &&
      !hasInitiallyLoaded
    ) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoadingCategories, isLoadingDetails, categories, hasInitiallyLoaded]);

  // Get details for a specific category
  const getCategoryDetails = (categoryName: string) => {
    const category = categories.find((c: BookingCategory) => c.name === categoryName);
    
    // If category has 0 items, return empty data immediately
    if (category && category.totalCount === 0) {
      return { data: [], totalCount: 0 };
    }

    // If requesting the active category, return its query data
    if (categoryName === activeCategoryName && activeCategoryData) {
      return activeCategoryData;
    }
    
    // For other categories, check React Query cache (previously visited tabs)
    const cachedData = queryClient.getQueryData(
      ['bookingDetails', categoryName, { page, rowsPerPage }]
    );
    if (cachedData) return cachedData;

    // Not yet loaded
    return null;
  };

  // Refetch: invalidate all queries, only active tab auto-refetches
  // Other tabs refetch lazily when the user navigates to them
  const refetchAll = async () => {
    // Invalidate categories (refreshes tab counts)
    await queryClient.invalidateQueries({ queryKey: ['bookingCategories'] });
    // Invalidate all cached booking details (marks them stale)
    await queryClient.invalidateQueries({ queryKey: ['bookingDetails'] });
    // Re-fetch categories + active tab auto-refetches since it's observed
    await refetchCategories();
  };

  return {
    categories,
    getCategoryDetails,
    // Full-page loading: only during very first load
    isLoadingInitial: !hasInitiallyLoaded && (isLoadingCategories || isLoadingDetails),
    // Inline table loading: for tab switches to uncached tabs
    isLoadingDetails,
    isLoadingAll: false, // Kept for backward compatibility
    isError: isCategoriesError,
    refetch: refetchAll,
    allCategoryDetails: {} // Kept for backward compatibility
  };
};

export default useAllBookingsData;