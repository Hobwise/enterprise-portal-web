'use client';
import { getPaymentByBusiness, getPaymentDetails } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery, useQueryClient } from 'react-query';
import { useEffect, useState } from 'react';

interface PaymentItem {
  id: string;
  qrName: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  dateCreated: string;
  customer: string;
  status: number;
  paymentReference: string;
}

interface PaymentCategory {
  name: string;
  totalCount: number;
  payments: PaymentItem[];
}

const useAllPaymentsData = (
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
  } = useQuery(
    ['paymentCategories', { filterType, startDate, endDate }],
    async () => {
      const response = await getPaymentByBusiness(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        'All', // Get all categories initially
        filterType,
        startDate,
        endDate
      );
      return response?.data?.data?.categories || [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const categories = categoriesData || [];

  // Fetch first category details immediately
  const firstCategory = categories[0]?.name || 'All';
  const { 
    data: firstCategoryData,
    isLoading: isLoadingFirst
  } = useQuery(
    ['paymentDetails', firstCategory, { page, rowsPerPage, filterType, startDate, endDate }],
    async () => {
      if (!firstCategory) return null;
      const response = await getPaymentByBusiness(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        firstCategory,
        filterType,
        startDate,
        endDate
      );
      return response?.data?.data;
    },
    {
      enabled: !!firstCategory && categories.length > 0,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
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
    if (categories.length <= 1 || isLoadingFirst) return;

    const timer = setTimeout(async () => {
      setIsLoadingAll(true);
      
      // Get categories except the first one
      const otherCategories = categories.slice(1);
      
      // Fetch all other categories in parallel
      const promises = otherCategories.map(async (category) => {
        const queryKey = ['paymentDetails', category.name, { page, rowsPerPage, filterType, startDate, endDate }];
        
        // Check if already cached
        const cachedData = queryClient.getQueryData(queryKey);
        if (cachedData) {
          return { categoryName: category.name, data: cachedData };
        }

        // Fetch if not cached
        try {
          const response = await getPaymentByBusiness(
            businessInformation[0]?.businessId,
            page,
            rowsPerPage,
            category.name,
            filterType,
            startDate,
            endDate
          );
          
          // Cache the result
          queryClient.setQueryData(queryKey, response?.data?.data);
          
          return { categoryName: category.name, data: response?.data?.data };
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
  }, [categories, isLoadingFirst, businessInformation, page, rowsPerPage, filterType, startDate, endDate, queryClient]);

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

export default useAllPaymentsData;