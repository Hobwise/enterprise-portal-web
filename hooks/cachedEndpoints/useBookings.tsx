'use client';
import { getBookingsByBusiness } from '@/app/api/controllers/dashboard/bookings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

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

interface BookingGroup {
  name: string;
  bookings: Booking[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const useBookings = () => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllBookings = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, tableStatus }] = queryKey;
    const responseData = await getBookingsByBusiness(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage,
      tableStatus
    );
    return responseData?.data?.data as BookingGroup[];
  };

  const { data, isLoading, isError, refetch } = useQuery<BookingGroup[]>(
    ['bookings', { page, rowsPerPage, tableStatus }],
    getAllBookings,
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useBookings;
