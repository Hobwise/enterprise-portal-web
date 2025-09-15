'use client';
import { getBookingCategories, getBookingDetails } from '@/app/api/controllers/dashboard/bookings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

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
}

interface BookingCategory {
  name: string;
  totalCount: number;
  bookings: Booking[];
}

const useBookings = (
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllBookings = async ({ queryKey }: { queryKey: any }) => {
    const [
      _key,
      { page, rowsPerPage, tableStatus },
    ] = queryKey;

    try {
      // Fetch booking categories
      const categoriesResponse = await getBookingCategories(
        businessInformation[0]?.businessId
      );
      const categories = categoriesResponse?.data?.data || [];
      
      if (categories.length === 0) {
        return { categories: [], details: [] };
      }

      // Fetch details for the selected category or first category
      const targetCategory = tableStatus || categories[0]?.name;
      const detailsItems = await getBookingDetails(
        businessInformation[0]?.businessId,
        targetCategory,
        page,
        rowsPerPage
      );
       
      return {
        categories,
        details: detailsItems,
      };
    } catch (error) {
      return { categories: [], details: [] };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      "bookings",
      { page, rowsPerPage, tableStatus },
    ],
    queryFn: getAllBookings,
    
      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      staleTime: 0,
      enabled: options?.enabled !== false,
    
  });

  return {
    categories: data?.categories || [],
    details: data?.details || [],
    isLoading,
    isError,
    refetch,
  };
};

export default useBookings;