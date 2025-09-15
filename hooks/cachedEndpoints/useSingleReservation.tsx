'use client';
import {
  getReservation,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';

const useSingleReservation = (reservationId: any) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();

  const getSingleReservation = async ({ queryKey }) => {
    const responseData = await getReservation(
      reservationId,
      page,
      rowsPerPage,
      tableStatus
    );
    return responseData?.data?.data as payloadReservationItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['singleReservation', { page, rowsPerPage, tableStatus }],
    queryFn: getSingleReservation,
    
      enabled: !!reservationId,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useSingleReservation;
