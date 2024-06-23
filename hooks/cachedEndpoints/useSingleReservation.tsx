'use client';
import {
  getReservation,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

const useSingleReservation = (reservationId: string) => {
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

  const { data, isLoading, isError, refetch } = useQuery<
    payloadReservationItem[]
  >(
    ['singleReservation', { page, rowsPerPage, tableStatus }],
    getSingleReservation,
    {
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useSingleReservation;
