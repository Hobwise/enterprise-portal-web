'use client';
import {
  getReservations,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

const useReservation = () => {
  const { page, rowsPerPage } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllReservation = async ({ queryKey }) => {
    const responseData = await getReservations(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage
    );
    return responseData?.data?.data as payloadReservationItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<
    payloadReservationItem[]
  >(['reservation', { page, rowsPerPage }], getAllReservation, {
    keepPreviousData: true,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useReservation;
